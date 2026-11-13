using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;

namespace NickolasGames.Sessions;

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/sessions").RequireRateLimiting("sessions");

        group.MapPost("/", ([FromBody] CreateSessionRequest request, SessionStore store) =>
        {
            var result = store.Create(request.Game, request.DisplayName);
            return result is null ? Results.BadRequest(new { error = "invalid_game_or_name" })
                : Results.Created($"/api/sessions/{result.SessionId}", result);
        });

        group.MapPost("/{id}/join", async (string id, [FromBody] JoinSessionRequest request,
            SessionStore store, IHubContext<SessionHub> hub) =>
        {
            var result = store.Join(id, request.DisplayName);
            if (result.Access is null) return Results.BadRequest(new { error = result.Error });
            await hub.Clients.Group("session:" + id).SendAsync("SessionUpdated", result.Access.Session);
            return Results.Ok(result.Access);
        });

        group.MapGet("/{id}", (string id, HttpContext context, SessionStore store) =>
        {
            var snapshot = store.Read(id, context.Request.Headers["X-Session-Token"].ToString());
            return snapshot is null ? Results.NotFound(new { error = "not_found" })
                : Results.Ok(snapshot);
        });

        return routes;
    }
}
