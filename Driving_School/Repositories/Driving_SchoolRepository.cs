using Driving_School_API.Models.City;
using Driving_School_API.Models.Driving_School;
using Microsoft.EntityFrameworkCore;
using System.Linq;

public class Driving_SchoolRepository : IDriving_SchoolRepository
{
    private readonly ApplicationDbContext _context;

    public Driving_SchoolRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех автошкол
    public async Task<IEnumerable<Driving_School>> GetAllDriving_SchoolsAsync()
    {
        return await _context.Driving_School.ToListAsync();
    }

    // получение данных автошколы по id
    public async Task<Driving_School> GetDriving_SchoolByIdAsync(int id)
    {
        return await _context.Driving_School.FindAsync(id);
    }

    // получение отфильтрованных автошкол
    public async Task<(IEnumerable<Driving_School> Data, int TotalCount)> GetFilteredDriving_SchoolsAsync(Driving_SchoolFilterDto filter)
    {
        var query = _context.Driving_School
            .AsQueryable();

        // Фильтрация по адресу автошколы
        if (!string.IsNullOrEmpty(filter.Address))
        {
            query = query.Where(ds => ds.Address.ToLower().Contains(filter.Address.ToLower()));
        }

        // Фильтрация по городу
        if (filter.CityId.HasValue)
        {
            query = query.Where(ds => ds.City_ID == filter.CityId);
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

    // добавление новой автошколы
    public async Task AddDriving_SchoolAsync(Driving_School driving_School)
    {
        await _context.Driving_School.AddAsync(driving_School);
        await _context.SaveChangesAsync();
    }

    // изменение данных автошколы
    public async Task UpdateDriving_SchoolAsync(Driving_School driving_School)
    {
        _context.Driving_School.Update(driving_School);
        await _context.SaveChangesAsync();
    }

    // удаление автошколы по id
    public async Task DeleteDriving_SchoolAsync(int id)
    {
        var driving_School = await _context.Driving_School.FindAsync(id);
        if (driving_School == null)
        {
            throw new KeyNotFoundException("Автошкола с указанным ID не найдена.");
        }

        _context.Driving_School.Remove(driving_School);
        await _context.SaveChangesAsync();
    }
}