using Driving_School_API.Models;

public class AttachmentRepository : IAttachmentRepository
{
    private readonly ApplicationDbContext _context;

    public AttachmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Получение вложения по ID
    public async Task<Attachment> GetAttachmentByIdAsync(int id)
    {
        return await _context.Attachment.FindAsync(id);
    }

    // Добавление нового вложения
    public async Task AddAttachmentAsync(Attachment attachment)
    {
        await _context.Attachment.AddAsync(attachment);
        await _context.SaveChangesAsync();
    }

    // Удаление вложения по ID
    public async Task DeleteAttachmentAsync(int id)
    {
        var attachment = await _context.Attachment.FindAsync(id);
        if (attachment == null)
        {
            throw new KeyNotFoundException("Вложение с указанным ID не найдено.");
        }

        // Обнуляем Attachment_ID в связанных таблицах
        var cars = _context.Car.Where(c => c.Attachment_ID == id).ToList();
        var students = _context.Student.Where(s => s.Attachment_ID == id).ToList();
        var instructors = _context.Instructor.Where(i => i.Attachment_ID == id).ToList();

        foreach (var car in cars) car.Attachment_ID = null;
        foreach (var student in students) student.Attachment_ID = null;
        foreach (var instructor in instructors) instructor.Attachment_ID = null;

        _context.Attachment.Remove(attachment);
        await _context.SaveChangesAsync();
    }
}