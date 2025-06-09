using Driving_School_API.Models.Car;
using Driving_School_API.Models.City;

public class CityService : ICityService
{
    private readonly ICityRepository _cityRepository;

    public CityService(ICityRepository cityRepository)
    {
        _cityRepository = cityRepository;
    }

    // получение данных всех городов
    public async Task<IEnumerable<City>> GetAllCitysAsync()
    {
        return await _cityRepository.GetAllCitysAsync();
    }

    // получить данные города по id
    public async Task<City> GetCityByIdAsync(int id)
    {
        return await _cityRepository.GetCityByIdAsync(id);
    }

    // создание нового города
    public async Task AddCityAsync(City city)
    {
        await _cityRepository.AddCityAsync(city);
    }

    // изменение данных города
    public async Task UpdateCityAsync(City city)
    {
        await _cityRepository.UpdateCityAsync(city);
    }

    // удаление города по id
    public async Task DeleteCityAsync(int id)
    {
        await _cityRepository.DeleteCityAsync(id);
    }
}