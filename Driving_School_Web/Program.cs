var builder = WebApplication.CreateBuilder(args);

// ��������� ��������� ����������� ������
var app = builder.Build();

// ��������� middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// �������� �������
app.Use(async (context, next) =>
{
    Console.WriteLine($"������: {context.Request.Path}");
    await next.Invoke();
});

// �������������� �������� ������ �� main.html
app.MapGet("/", async context =>
{
    Console.WriteLine("�������� �� /main.html");
    context.Response.Redirect("/main.html", permanent: false);
    await Task.CompletedTask;
});

// ������������ ��������� ������� ��� ����������� �����
app.MapFallbackToFile("main.html", new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        Console.WriteLine($"����������� main.html ��� ����: {ctx.Context.Request.Path}");
    }
});

app.Run();