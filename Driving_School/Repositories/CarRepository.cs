using Driving_School_API.Models.Car;
using Microsoft.EntityFrameworkCore;

public class CarRepository : ICarRepository
{
    private readonly ApplicationDbContext _context;

    public CarRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех авто
    public async Task<IEnumerable<Car>> GetAllCarsAsync()
    {
        return await _context.Car.ToListAsync();
    }

    // получение данных авто по id
    public async Task<Car> GetCarByIdAsync(int id)
    {
        return await _context.Car.FindAsync(id);
    }

    // добавление нового авто
    public async Task AddCarAsync(Car car)
    {
        await _context.Car.AddAsync(car);
        await _context.SaveChangesAsync();
    }

    // изменение данных авто
    public async Task UpdateCarAsync(Car car)
    {
        _context.Car.Update(car);
        await _context.SaveChangesAsync();
    }

    // удаление авто по id
    public async Task DeleteCarAsync(int id)
    {
        var car = await _context.Car.FindAsync(id);
        if (car == null)
        {
            throw new KeyNotFoundException("Авто с указанным ID не найдено.");
        }

        _context.Car.Remove(car);
        await _context.SaveChangesAsync();
    }
}