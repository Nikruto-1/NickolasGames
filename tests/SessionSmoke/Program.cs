using NickolasGames.Sessions;

static void Check(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}

var store = new SessionStore();
Check(store.Create("invalid", "Holmes") is null, "Invalid game must be rejected");
Check(store.Create("alias", "  ") is null, "Blank host name must be rejected");
Check(store.Create("alias", new string('a', 41)) is null, "Overlong host name must be rejected");

var host = store.Create("truth-or-dare", "Holmes")!;
Check(host.Session.Players.Count == 1 && host.Session.Phase == "lobby", "Host creates lobby");
Check(host.Token.Length == 48, "Token has 192 bits of entropy");
Check(host.SessionId.Length == 48, "Session id has 192 bits of entropy");
Check(store.Read(host.SessionId, "invalid") is null, "Bad token cannot access session");
Check(store.Read("unknown", host.Token) is null, "Unknown session is not accessible");
Check(store.Read(host.SessionId, host.Token) is not null, "Host can read state");

var guest = store.Join(host.SessionId, "Anastasia").Access!;
Check(guest.Session.Players.Count == 2, "Guest joins lobby");
Check(guest.Session.Version == 1, "Join increments version");

Check(store.Apply(host.SessionId, host.Token, "start", 0).Error == "version_conflict",
    "Stale commands must not overwrite state");
Check(store.Apply(host.SessionId, guest.Token, "start", 1).Error == "not_allowed",
    "Only host can start");
Check(store.Apply(host.SessionId, host.Token, "start", 1).Success, "Host starts game");

var current = store.Read(host.SessionId, host.Token)!;
Check(current.Phase == "playing" && current.ActivePlayerId == host.PlayerId,
    "Host has first turn");
Check(store.Apply(host.SessionId, guest.Token, "truth", current.Version).Error == "not_allowed",
    "Inactive player cannot select");
Check(store.Apply(host.SessionId, host.Token, "truth", current.Version).Success,
    "Active player can select truth");
current = store.Read(host.SessionId, guest.Token)!;
Check(current.Choice == "truth", "Choice visible to authorized participant");
Check(store.Apply(host.SessionId, host.Token, "dare", current.Version).Error == "not_allowed",
    "Cannot choose twice");

Check(store.Apply(host.SessionId, host.Token, "next", current.Version).Success,
    "Host can advance");
current = store.Read(host.SessionId, guest.Token)!;
Check(current.ActivePlayerId == guest.PlayerId && current.Choice is null,
    "Turn advances and selection clears");
Check(store.Apply(host.SessionId, guest.Token, "dare", current.Version).Success,
    "Second player can choose dare");

Check(store.Join(host.SessionId, "Late").Error == "already_started",
    "Late joins disabled after starting");

var other = store.Create("alias", "Host")!;
Check(store.Apply(other.SessionId, other.Token, "start", 0).Error == "not_allowed",
    "Cannot start with one participant");
for (var i = 0; i < 5; i++)
    Check(store.Join(other.SessionId, "P" + i).Access is not null,
        "Players up to six can join");
Check(store.Join(other.SessionId, "Too many").Error == "session_full",
    "Maximum player limit is six");
Check(store.Apply(other.SessionId, other.Token, "truth", 5).Error == "not_allowed",
    "Truth/Dare actions are unavailable in unrelated games");
Console.WriteLine("SessionStore smoke checks passed.");
