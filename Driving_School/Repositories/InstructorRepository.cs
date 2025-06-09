using Driving_School_API.Models.Instructor;
using Microsoft.EntityFrameworkCore;

public class InstructorRepository : IInstructorRepository {
    private readonly ApplicationDbContext _context;
    public InstructorRepository(ApplicationDbContext context) { _context = context; }

    // получение данных всех инструкторов
    public async Task<IEnumerable<Instructor>> GetAllInstructorsAsync() { return await _context.Instructor.ToListAsync(); }

    // получение данных инструктора по id
    public async Task<Instructor> GetInstructorByIdAsync(int id) { return await _context.Instructor.FirstOrDefaultAsync(s => s.Id == id); }

    // получение отфильтрованных инструкторов
    public async Task<(IEnumerable<Instructor> Data, int TotalCount)> GetFilteredInstructorsAsync(InstructorFilterDto filter) {
        var query = _context.Instructor.AsQueryable();

        // Фильтрация по фамилии инструктора
        if (!string.IsNullOrEmpty(filter.Surname)) { query = query.Where(i => i.Surname.ToLower().Contains(filter.Surname.ToLower())); }

        // Фильтрация по имени инструктора
        if (!string.IsNullOrEmpty(filter.Name)) { query = query.Where(i => i.Name.ToLower().Contains(filter.Name.ToLower())); }

        // Фильтрация по отчеству инструктора
        if (!string.IsNullOrEmpty(filter.Patronymic)) { query = query.Where(i => i.Patronymic.ToLower().Contains(filter.Patronymic.ToLower())); }

        // Фильтрация по номеру телефона инструктора
        if (!string.IsNullOrEmpty(filter.PhoneNumber)) { query = query.Where(i => i.PhoneNumber.Contains(filter.PhoneNumber)); }

        // Фильтрация по эл. почте инструктора
        if (!string.IsNullOrEmpty(filter.Email)) { query = query.Where(i => i.Email.Contains(filter.Email)); }

        // Фильтрация по городу
        if (filter.City_ID.HasValue) {
            query = query.Where(i => (!filter.City_ID.HasValue || _context.Driving_School
                            .Where(ds => ds.Id == i.DrivingSchool_ID)
                            .Any(ds => ds.City_ID == filter.City_ID.Value)));
        }

        // Фильтрация по автошколе
        if (filter.DrivingSchool_ID.HasValue) { query = query.Where(i => i.DrivingSchool_ID == filter.DrivingSchool_ID); }

        // Подсчёт общего количества записей
        var totalCount = await query.CountAsync();

        // Применяем пагинацию
        var paginatedData = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (paginatedData, totalCount);
    }

    // добавление нового инструктора
    public async Task AddInstructorAsync(Instructor instructor) {
        await _context.Instructor.AddAsync(instructor);
        await _context.SaveChangesAsync();
    }

    // изменение данных инструктора
    public async Task UpdateInstructorAsync(Instructor instructor) {
        _context.Instructor.Update(instructor);
        await _context.SaveChangesAsync();
    }

    // удаление инструктора по id
    public async Task DeleteInstructorAsync(int id) {
        var instructor = await _context.Instructor.FindAsync(id);
        if (instructor == null) { throw new KeyNotFoundException("Инструктор с указанным ID не найден."); }
        _context.Instructor.Remove(instructor);
        await _context.SaveChangesAsync();
    }
}