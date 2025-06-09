using Driving_School_API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

public class AttachmentService : IAttachmentService
{
    private readonly IAttachmentRepository _attachmentRepository;
    private readonly string _uploadPath;
    private readonly ILogger<AttachmentService> _logger;

    public AttachmentService(
        IAttachmentRepository attachmentRepository,
        IConfiguration configuration,
        ILogger<AttachmentService> logger)
    {
        _attachmentRepository = attachmentRepository;
        _logger = logger;

        // Получаем путь из конфигурации
        var uploadPath = configuration.GetSection("UploadSettings:UploadPath").Value;
        if (string.IsNullOrEmpty(uploadPath))
        {
            _logger.LogWarning("Путь для загрузки файлов не указан в конфигурации. Используется путь по умолчанию: 'Uploads'.");
            uploadPath = "Uploads";
        }

        // Формируем полный путь
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), uploadPath);

        // Проверяем и создаём директорию
        CreateUploadDirectory();
    }

    private void CreateUploadDirectory()
    {
        try
        {
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
                _logger.LogInformation($"Директория для загрузки файлов создана: {_uploadPath}");
            }
            else
            {
                _logger.LogInformation($"Директория для загрузки файлов уже существует: {_uploadPath}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Ошибка при создании директории для загрузки файлов: {_uploadPath}");
            throw new InvalidOperationException($"Не удалось создать директорию для загрузки файлов: {_uploadPath}. Ошибка: {ex.Message}", ex);
        }
    }

    public async Task<int> UploadFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            _logger.LogWarning("Попытка загрузки пустого файла.");
            throw new ArgumentException("Файл не выбран или пустой.");
        }

        const long maxFileSize = 10 * 1024 * 1024; // 10 МБ
        if (file.Length > maxFileSize)
        {
            _logger.LogWarning($"Попытка загрузки слишком большого файла: {file.Length} байт");
            throw new ArgumentException("Размер файла не должен превышать 10 МБ.");
        }

        var safeFileName = Path.GetFileName(file.FileName); // Удаляет путь, оставляет только имя файла
        var fileName = $"{Guid.NewGuid()}_{safeFileName}";
        var filePath = Path.Combine(_uploadPath, fileName);

        try
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation($"Файл успешно сохранён: {filePath}");

            var attachment = new Attachment
            {
                Name = $"/Uploads/{fileName}"
            };

            await _attachmentRepository.AddAttachmentAsync(attachment);
            return attachment.ID;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Ошибка при загрузке файла: {fileName}");
            throw;
        }
    }

    public async Task<Attachment> GetAttachmentByIdAsync(int id)
    {
        return await _attachmentRepository.GetAttachmentByIdAsync(id);
    }

    public async Task DeleteAttachmentAsync(int id)
    {
        var attachment = await _attachmentRepository.GetAttachmentByIdAsync(id);
        if (attachment == null)
        {
            _logger.LogWarning($"Попытка удаления несуществующего вложения с ID: {id}");
            throw new KeyNotFoundException("Вложение с указанным ID не найдено.");
        }

        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), attachment.Name.TrimStart('/'));
        try
        {
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation($"Файл успешно удалён: {fullPath}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Ошибка при удалении файла: {fullPath}");
            // Можно решить, продолжать ли удаление записи в базе, если файл не удалось удалить
        }

        await _attachmentRepository.DeleteAttachmentAsync(id);
        _logger.LogInformation($"Вложение с ID {id} успешно удалено из базы данных.");
    }
}