using Driving_School_API.Models.City;

public interface ICityRepository
{
    Task<IEnumerable<City>> GetAllCitysAsync(); // получение всех городов
    Task<City> GetCityByIdAsync(int id); // получение города по id
    Task AddCityAsync(City city); // добавление города
    Task UpdateCityAsync(City City); // изменение данных города
    Task DeleteCityAsync(int id); // удаление города по id
}