using Driving_School_API.Models.Car;

public interface ICarRepository
{
    Task<IEnumerable<Car>> GetAllCarsAsync(); // получение всех авто
    Task<Car> GetCarByIdAsync(int id); // получение авто по id
    Task AddCarAsync(Car car); // добавление авто
    Task UpdateCarAsync(Car Car); // изменение данных авто
    Task DeleteCarAsync(int id); // удаление авто по id
}