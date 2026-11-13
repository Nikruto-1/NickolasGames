using System.Threading.RateLimiting;
using NickolasGames.Sessions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddSingleton<SessionStore>();
builder.Services.AddHostedService<SessionCleanupService>();
builder.Services.AddCors(options => options.AddPolicy("GamesClient", policy =>
    policy.WithOrigins("https://games.nickolasspace.com", "http://localhost:5173", "https://localhost:5173")
        .WithHeaders("Content-Type", "X-Session-Token")
        .WithMethods("GET", "POST")
));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("sessions", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment()) app.UseHsts();
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    await next();
});
app.UseHttpsRedirection();
app.UseCors("GamesClient");
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var fileName = context.File.Name;
        var headers = context.Context.Response.Headers;

        if (fileName is "index.html" or "sw.js" or "robots.txt" or "sitemap.xml" or "manifest.webmanifest")
        {
            headers.CacheControl = "no-cache";
            return;
        }

        headers.CacheControl = context.Context.Request.Path.StartsWithSegments("/assets")
            ? "public,max-age=31536000,immutable"
            : "public,max-age=3600";
    }
});
app.UseAuthorization();

app.MapControllers();
app.MapSessionEndpoints();
app.MapHub<SessionHub>("/hubs/game");
app.MapFallbackToFile("index.html");

app.Run();
