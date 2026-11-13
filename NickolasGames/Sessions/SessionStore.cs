using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace NickolasGames.Sessions;

public sealed record PlayerView(string Id, string Name, bool Host);
public sealed record SessionView(
    string Id, string Game, string Phase, long Version, string? ActivePlayerId,
    string? Choice, IReadOnlyList<PlayerView> Players, DateTimeOffset ExpiresAt);
public sealed record CreateSessionRequest(string? Game, string? DisplayName);
public sealed record JoinSessionRequest(string? DisplayName);
public sealed record SessionAccess(string SessionId, string PlayerId, string Token, SessionView Session);
public sealed record MutationResult(SessionView? Session, string? Error)
{
    public bool Success => Session is not null;
}

internal sealed class SessionEntry
{
    public required string Id { get; init; }
    public required string Game { get; init; }
    public List<SessionMember> Members { get; } = [];
    public object Gate { get; } = new();
    public string Phase { get; set; } = "lobby";
    public long Version { get; set; } = 0;
    public int ActiveIndex { get; set; }
    public string? Choice { get; set; }
    public DateTimeOffset ExpiresAt { get; set; } = DateTimeOffset.UtcNow.AddHours(2);
}
internal sealed record SessionMember(string Id, string Name, string Token, bool Host);

/// <summary>Single-process session coordinator. Never use for multi-instance deployment.</summary>
public sealed class SessionStore
{
    private static readonly HashSet<string> Games =
        ["alias", "charades", "whoami", "truth-or-dare"];
    private readonly ConcurrentDictionary<string, SessionEntry> _sessions = new();
    private static string Secret() => Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
    private static string? Name(string? name)
    {
        var trimmed = name?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) || trimmed.Length > 40 ? null : trimmed;
    }
    private static bool TokenEquals(string left, string right)
    {
        if (left.Length != right.Length) return false;
        return CryptographicOperations.FixedTimeEquals(
            System.Text.Encoding.UTF8.GetBytes(left),
            System.Text.Encoding.UTF8.GetBytes(right));
    }
    private static SessionView Snapshot(SessionEntry entry) => new(
        entry.Id, entry.Game, entry.Phase, entry.Version,
        entry.Phase == "lobby" || entry.Members.Count == 0
            ? null : entry.Members[entry.ActiveIndex].Id,
        entry.Choice,
        entry.Members.Select(member => new PlayerView(member.Id, member.Name, member.Host)).ToArray(),
        entry.ExpiresAt);

    private bool TryFind(string id, out SessionEntry entry)
    {
        entry = null!;
        if (!_sessions.TryGetValue(id, out var value)) return false;
        if (value.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            _sessions.TryRemove(id, out _);
            return false;
        }
        entry = value;
        return true;
    }

    public SessionAccess? Create(string? game, string? name)
    {
        var displayName = Name(name);
        if (displayName is null || game is null || !Games.Contains(game)) return null;
        var session = new SessionEntry { Id = Secret(), Game = game };
        var host = new SessionMember(Secret(), displayName, Secret(), true);
        session.Members.Add(host);
        _sessions[session.Id] = session;
        return new SessionAccess(session.Id, host.Id, host.Token, Snapshot(session));
    }

    public (SessionAccess? Access, string? Error) Join(string sessionId, string? name)
    {
        var displayName = Name(name);
        if (displayName is null) return (null, "invalid_name");
        if (!TryFind(sessionId, out var session)) return (null, "not_found");
        lock (session.Gate)
        {
            if (session.Phase != "lobby") return (null, "already_started");
            if (session.Members.Count >= 6) return (null, "session_full");
            var member = new SessionMember(Secret(), displayName, Secret(), false);
            session.Members.Add(member);
            session.Version++;
            session.ExpiresAt = DateTimeOffset.UtcNow.AddHours(2);
            return (new SessionAccess(session.Id, member.Id, member.Token, Snapshot(session)), null);
        }
    }

    public SessionView? Read(string sessionId, string? token)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length != 48 ||
            !TryFind(sessionId, out var entry)) return null;
        lock (entry.Gate)
        {
            if (!entry.Members.Any(member => TokenEquals(member.Token, token))) return null;
            return Snapshot(entry);
        }
    }

    public MutationResult Apply(string sessionId, string? token, string command, long expectedVersion)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length != 48 ||
            !TryFind(sessionId, out var entry)) return new(null, "not_found");
        lock (entry.Gate)
        {
            var member = entry.Members.FirstOrDefault(p => TokenEquals(p.Token, token));
            if (member is null) return new(null, "unauthorized");
            if (entry.Version != expectedVersion) return new(null, "version_conflict");
            if (command == "start")
            {
                if (!member.Host || entry.Phase != "lobby" || entry.Members.Count < 2)
                    return new(null, "not_allowed");
                entry.Phase = "playing";
            }
            else if (command == "next")
            {
                if (entry.Phase != "playing" || (entry.Members[entry.ActiveIndex].Id != member.Id && !member.Host))
                    return new(null, "not_allowed");
                entry.ActiveIndex = (entry.ActiveIndex + 1) % entry.Members.Count;
                entry.Choice = null;
            }
            else if (command is "truth" or "dare")
            {
                if (entry.Game != "truth-or-dare" || entry.Phase != "playing" ||
                    entry.Members[entry.ActiveIndex].Id != member.Id || entry.Choice is not null)
                    return new(null, "not_allowed");
                entry.Choice = command;
            }
            else return new(null, "unknown_command");

            entry.Version++;
            entry.ExpiresAt = DateTimeOffset.UtcNow.AddHours(2);
            return new(Snapshot(entry), null);
        }
    }

    public void RemoveExpired()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var pair in _sessions)
            if (pair.Value.ExpiresAt <= now) _sessions.TryRemove(pair.Key, out _);
    }
}
