var builder = WebApplication.CreateBuilder(args);

// Добавляем поддержку статических файлов
var app = builder.Build();

// Настройка middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Логируем запросы
app.Use(async (context, next) =>
{
    Console.WriteLine($"Запрос: {context.Request.Path}");
    await next.Invoke();
});

// Перенаправляем корневой запрос на main.html
app.MapGet("/", async context =>
{
    Console.WriteLine("Редирект на /main.html");
    context.Response.Redirect("/main.html", permanent: false);
    await Task.CompletedTask;
});

// Обрабатываем остальные запросы как статические файлы
app.MapFallbackToFile("main.html", new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        Console.WriteLine($"Отображение main.html для пути: {ctx.Context.Request.Path}");
    }
});

app.Run();