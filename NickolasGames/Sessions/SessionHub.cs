using Microsoft.AspNetCore.SignalR;

namespace NickolasGames.Sessions;

public sealed class SessionHub(SessionStore store) : Hub
{
    private const string SessionKey = "session-id";
    private const string TokenKey = "session-token";
    private static string Group(string id) => "session:" + id;

    public async Task<SessionView> JoinSession(string id, string token)
    {
        var snapshot = store.Read(id, token);
        if (snapshot is null) throw new HubException("unauthorized");
        if (Context.Items.TryGetValue(SessionKey, out var oldId) && oldId is string previous)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, Group(previous));
        Context.Items[SessionKey] = id;
        Context.Items[TokenKey] = token;
        await Groups.AddToGroupAsync(Context.ConnectionId, Group(id));
        return snapshot;
    }

    public async Task LeaveSession()
    {
        if (Context.Items.TryGetValue(SessionKey, out var id) && id is string session)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, Group(session));
        Context.Items.Remove(SessionKey);
        Context.Items.Remove(TokenKey);
    }

    public Task Start(long expectedVersion) => Execute("start", expectedVersion);
    public Task NextTurn(long expectedVersion) => Execute("next", expectedVersion);
    public Task ChooseTruthDare(string choice, long expectedVersion) =>
        Execute(choice is "truth" or "dare" ? choice : "invalid", expectedVersion);

    private async Task Execute(string command, long expectedVersion)
    {
        if (Context.Items.TryGetValue(SessionKey, out var s) is false || s is not string id ||
            Context.Items.TryGetValue(TokenKey, out var t) is false || t is not string token)
            throw new HubException("join_required");
        var result = store.Apply(id, token, command, expectedVersion);
        if (!result.Success) throw new HubException(result.Error ?? "invalid_action");
        await Clients.Group(Group(id)).SendAsync("SessionUpdated", result.Session);
    }
}
