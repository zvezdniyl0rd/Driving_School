using Driving_School_API.Models;

public interface IAttachmentService
{
    Task<int> UploadFileAsync(IFormFile file); // Загрузка файла и создание записи в базе
    Task<Attachment> GetAttachmentByIdAsync(int id); // Получение вложения по ID
    Task DeleteAttachmentAsync(int id); // Удаление вложения
}