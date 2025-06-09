using Driving_School_API.Models.Instructor;
using Driving_School_API.Models.Student;
using Microsoft.EntityFrameworkCore;

public class StudentRepository : IStudentRepository {
    private readonly ApplicationDbContext _context;

    public StudentRepository(ApplicationDbContext context) { _context = context; }

    // получение данных всех студентов
    public async Task<IEnumerable<Student>> GetAllStudentsAsync() { return await _context.Student.ToListAsync(); }

    // получение данных студента по id
    public async Task<Student> GetStudentByIdAsync(int id) { return await _context.Student.FindAsync(id); }

    // получение отфильтрованных студентов
    public async Task<(IEnumerable<Student> Data, int TotalCount)> GetFilteredStudentsAsync(StudentFilterDto filter) {
        var query = _context.Student.AsQueryable();

        // Фильтрация по фамилии сиудента
        if (!string.IsNullOrEmpty(filter.Surname)) { query = query.Where(s => s.Surname.ToLower().Contains(filter.Surname.ToLower())); }

        // Фильтрация по имени студента
        if (!string.IsNullOrEmpty(filter.Name)) { query = query.Where(s => s.Name.ToLower().Contains(filter.Name.ToLower())); }

        // Фильтрация по отчеству студента
        if (!string.IsNullOrEmpty(filter.Patronymic)) { query = query.Where(s => s.Patronymic.ToLower().Contains(filter.Patronymic.ToLower())); }

        // Фильтрация по номеру телефона студента
        if (!string.IsNullOrEmpty(filter.PhoneNumber)) { query = query.Where(s => s.PhoneNumber.Contains(filter.PhoneNumber)); }

        // Фильтрация по эл. почте студента
        if (!string.IsNullOrEmpty(filter.Email)) { query = query.Where(s => s.Email.Contains(filter.Email)); }

        // Фильтрация по автошколе
        if (filter.DrivingSchool_ID.HasValue) { query = query.Where(s => s.DrivingSchool_ID == filter.DrivingSchool_ID); }

        // Фильтрация по городу
        if (filter.City_ID.HasValue) {
            query = query.Where(s => (!filter.City_ID.HasValue || _context.Driving_School
                            .Where(ds => ds.Id == s.DrivingSchool_ID)
                            .Any(ds => ds.City_ID == filter.City_ID.Value)));
        }

        // Подсчёт общего количества записей
        var totalCount = await query.CountAsync();

        // Применяем пагинацию
        var paginatedData = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (paginatedData, totalCount);
    }

    // добавление нового студента
    public async Task AddStudentAsync(Student student) {
        await _context.Student.AddAsync(student);
        await _context.SaveChangesAsync();
    }

    // изменение данных студента
    public async Task UpdateStudentAsync(Student student) {
        _context.Student.Update(student);
        await _context.SaveChangesAsync();
    }

    // удаление студента по id
    public async Task DeleteStudentAsync(int id) {
        var student = await _context.Student.FindAsync(id);
        if (student == null) { throw new KeyNotFoundException("Студент с указанным ID не найден."); }
        _context.Student.Remove(student);
        await _context.SaveChangesAsync();
    }
}