using Driving_School_API.Models.Car;

public class CarService : ICarService
{
    private readonly ICarRepository _carRepository;

    public CarService(ICarRepository carRepository)
    {
        _carRepository = carRepository;
    }

    // получение данных всех авто
    public async Task<IEnumerable<Car>> GetAllCarsAsync()
    {
        return await _carRepository.GetAllCarsAsync();
    }

    // получить данные авто по id
    public async Task<Car> GetCarByIdAsync(int id)
    {
        return await _carRepository.GetCarByIdAsync(id);
    }

    // создание нового авто
    public async Task AddCarAsync(Car car)
    {
        await _carRepository.AddCarAsync(car);
    }

    // изменение данных авто
    public async Task UpdateCarAsync(Car car)
    {
        await _carRepository.UpdateCarAsync(car);
    }

    // удаление авто по id
    public async Task DeleteCarAsync(int id)
    {
        await _carRepository.DeleteCarAsync(id);
    }
}