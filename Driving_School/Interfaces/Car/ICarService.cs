using Driving_School_API.Models.Car;

public interface ICarService
{
    Task<IEnumerable<Car>> GetAllCarsAsync(); // получение данных всех авто
    Task<Car> GetCarByIdAsync(int id); // получение данных авто по id
    Task AddCarAsync(Car car); // добавление нового авто
    Task UpdateCarAsync(Car Car); // изменение данных авто
    Task DeleteCarAsync(int id); // удаление авто по id
}