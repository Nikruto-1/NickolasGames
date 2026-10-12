var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var fileName = context.File.Name;
        var headers = context.Context.Response.Headers;

        if (string.Equals(fileName, "index.html", StringComparison.OrdinalIgnoreCase))
        {
            headers.CacheControl = "no-cache";
            return;
        }

        headers.CacheControl = "public,max-age=31536000,immutable";
    }
});
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
