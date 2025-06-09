using Driving_School_API.Models.City;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/city")]
public class CityController : ControllerBase
{
    private readonly ICityService _cityService;

    public CityController(ICityService cityService)
    {
        _cityService = cityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCitys()
    {
        try
        {
            var citys = await _cityService.GetAllCitysAsync();
            return Ok(citys);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCityById(int id)
    {
        var city = await _cityService.GetCityByIdAsync(id);
        if (city == null)
        {
            return NotFound(new { Message = $"Город с id {id} не найден" });
        }

        return Ok(city);
    }

    [HttpPost]
    public async Task<IActionResult> AddCity([FromBody] CityDto cityDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var city = new City
        {
            Name = cityDto.Name
        };

        try
        {
            await _cityService.AddCityAsync(city);
            return CreatedAtAction(nameof(GetCityById), new { id = city.Id }, city);
        }
        catch (DbUpdateException dbEx)
        {
            // Если проблема связана с БД, например, некорректный внешний ключ
            return BadRequest(new { Message = "Ошибка целостности данных: проверьте корректность данных", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            // Для других исключений
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCity(int id, [FromBody] CityDto cityDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли город
            var existingCity = await _cityService.GetCityByIdAsync(id);
            if (existingCity == null)
            {
                return NotFound(new { Message = $"Город с Id {id} не найден" });
            }

            // Обновляем данные город
            existingCity.Name = cityDto.Name;

            // Вызываем метод для сохранения изменений
            await _cityService.UpdateCityAsync(existingCity);

            return Ok(existingCity);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении данных город", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCity(int id)
    {
        try
        {
            var city = await _cityService.GetCityByIdAsync(id);
            if (city == null)
            {
                return NotFound(new { Message = "Город не найдено" });
            }

            await _cityService.DeleteCityAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении города: {ex.Message}" });
        }
    }
}