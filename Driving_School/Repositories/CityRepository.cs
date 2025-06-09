using Driving_School_API.Models.Car;
using Driving_School_API.Models.City;
using Microsoft.EntityFrameworkCore;

public class CityRepository : ICityRepository
{
    private readonly ApplicationDbContext _context;

    public CityRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех городов
    public async Task<IEnumerable<City>> GetAllCitysAsync()
    {
        return await _context.City.ToListAsync();
    }

    // получение данных города по id
    public async Task<City> GetCityByIdAsync(int id)
    {
        return await _context.City.FindAsync(id);
    }

    // добавление нового города
    public async Task AddCityAsync(City city)
    {
        await _context.City.AddAsync(city);
        await _context.SaveChangesAsync();
    }

    // изменение данных города
    public async Task UpdateCityAsync(City city)
    {
        _context.City.Update(city);
        await _context.SaveChangesAsync();
    }

    // удаление города по id
    public async Task DeleteCityAsync(int id)
    {
        var city = await _context.City.FindAsync(id);
        if (city == null)
        {
            throw new KeyNotFoundException("Город с указанным ID не найден.");
        }

        _context.City.Remove(city);
        await _context.SaveChangesAsync();
    }
}