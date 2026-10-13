var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

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
app.MapFallbackToFile("index.html");

app.Run();
