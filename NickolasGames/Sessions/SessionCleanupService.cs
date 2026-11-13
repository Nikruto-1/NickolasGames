namespace NickolasGames.Sessions;

public sealed class SessionCleanupService(SessionStore store) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        try
        {
            while (await timer.WaitForNextTickAsync(cancellationToken))
                store.RemoveExpired();
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    }
}
