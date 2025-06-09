using Driving_School_API.Models;

public interface IAttachmentRepository
{
    Task<Attachment> GetAttachmentByIdAsync(int id); // Получение вложения по ID
    Task AddAttachmentAsync(Attachment attachment); // Добавление вложения
    Task DeleteAttachmentAsync(int id); // Удаление вложения по ID
}