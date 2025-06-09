using Driving_School_API.Models.StudentProgress;
using Microsoft.EntityFrameworkCore;

public class StudentProgressRepository : IStudentProgressRepository
{
    private readonly ApplicationDbContext _context;

    public StudentProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех прогрессов студентов
    public async Task<IEnumerable<StudentProgress>> GetAllStudentProgresssAsync()
    {
        return await _context.StudentProgress.ToListAsync();
    }

    // получение данных прогресса студента по id
    public async Task<StudentProgress> GetStudentProgressByIdAsync(int id)
    {
        return await _context.StudentProgress.FindAsync(id);
    }

    // получение данных прогресса студента по id студента
    public async Task<List<StudentProgress>> GetStudentProgressByStudentIdAsync(int studentId)
    {
        return await _context.StudentProgress
                             .Where(sp => sp.Student_ID == studentId)
                             .ToListAsync();
    }

    // добавление нового прогресса студента
    public async Task AddStudentProgressAsync(StudentProgress studentProgress)
    {
        await _context.StudentProgress.AddAsync(studentProgress);
        await _context.SaveChangesAsync();
    }

    // изменение данных прогресса студента
    public async Task UpdateStudentProgressAsync(StudentProgress studentProgress)
    {
        _context.StudentProgress.Update(studentProgress);
        await _context.SaveChangesAsync();
    }

    // удаление прогресса студента по id
    public async Task DeleteStudentProgressAsync(int id)
    {
        var studentProgress = await _context.StudentProgress.FindAsync(id);
        if (studentProgress == null)
        {
            throw new KeyNotFoundException("Прогресс студента с указанным ID не найдено.");
        }

        _context.StudentProgress.Remove(studentProgress);
        await _context.SaveChangesAsync();
    }
}