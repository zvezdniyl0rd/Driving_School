using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Connection")));

builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IInstructorRepository, InstructorRepository>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddScoped<ICarService, CarService>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
//builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
//builder.Services.AddScoped<IQuestionService, QuestionService>();
//builder.Services.AddScoped<IStudentProgressRepository, StudentProgressRepository>();
//builder.Services.AddScoped<IStudentProgressService, StudentProgressService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDriving_SchoolRepository, Driving_SchoolRepository>();
builder.Services.AddScoped<IDriving_SchoolService, Driving_SchoolService>();
builder.Services.AddScoped<ICityRepository, CityRepository>();
builder.Services.AddScoped<ICityService, CityService>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAttachmentRepository, AttachmentRepository>();
builder.Services.AddScoped<IAttachmentService, AttachmentService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDrivingSchoolWeb", builder =>
    {
        builder.WithOrigins("https://localhost:7072") // Порт фронтенда
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Получаем путь для загрузки из конфигурации
var uploadPath = builder.Configuration.GetSection("UploadSettings:UploadPath").Value ?? "Uploads";
var fullUploadPath = Path.Combine(Directory.GetCurrentDirectory(), uploadPath);

// Создаём директорию Uploads, если она не существует
try
{
    if (!Directory.Exists(fullUploadPath))
    {
        Directory.CreateDirectory(fullUploadPath);
        app.Logger.LogInformation($"Директория для загрузки файлов создана: {fullUploadPath}");
    }
    else
    {
        app.Logger.LogInformation($"Директория для загрузки файлов уже существует: {fullUploadPath}");
    }
}
catch (Exception ex)
{
    app.Logger.LogError(ex, $"Ошибка при создании директории для загрузки файлов: {fullUploadPath}");
    throw; // Прерываем запуск приложения, если директория не может быть создана
}

// Настраиваем middleware для статических файлов
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(fullUploadPath),
    RequestPath = "/Uploads"
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        if (exceptionHandlerPathFeature?.Error is not null)
        {
            var errorResponse = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Произошла ошибка на сервере.",
                Detailed = exceptionHandlerPathFeature.Error.Message
            };

            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(errorResponse);
            await context.Response.WriteAsync(jsonResponse);
        }
    });
});

// Настройка middleware
app.UseHttpsRedirection();
app.UseRouting();

// Применяем политику CORS
app.UseCors("AllowDrivingSchoolWeb");

app.UseAuthorization();

app.MapControllers();

app.Run();