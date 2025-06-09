using Driving_School_API.Models.Car;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/cars")]
public class CarsController : ControllerBase
{
    private readonly ICarService _carService;

    public CarsController(ICarService carService)
    {
        _carService = carService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCars()
    {
        try
        {
            var cars = await _carService.GetAllCarsAsync();
            return Ok(cars);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCarById(int id)
    {
        var car = await _carService.GetCarByIdAsync(id);
        if (car == null)
        {
            return NotFound(new { Message = $"Авто с id {id} не найден" });
        }

        return Ok(car);
    }

    [HttpPost]
    public async Task<IActionResult> AddCar([FromBody] CarDto carDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var car = new Car
        {
            Brand = carDto.Brand,
            Model = carDto.Model,
            Color = carDto.Color,
            Car_Number = carDto.Car_Number,
            Attachment_ID = carDto.Attachment_ID
        };

        try
        {
            await _carService.AddCarAsync(car);
            return CreatedAtAction(nameof(GetCarById), new { id = car.Id }, car);
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
    public async Task<IActionResult> UpdateCar(int id, [FromBody] CarDto carDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли авто
            var existingCar = await _carService.GetCarByIdAsync(id);
            if (existingCar == null)
            {
                return NotFound(new { Message = $"Авто с Id {id} не найден" });
            }

            // Обновляем данные авто
            existingCar.Brand = carDto.Brand;
            existingCar.Model = carDto.Model;
            existingCar.Color = carDto.Color;
            existingCar.Car_Number = carDto.Car_Number;
            existingCar.Attachment_ID = carDto.Attachment_ID;

            // Вызываем метод для сохранения изменений
            await _carService.UpdateCarAsync(existingCar);

            return Ok(existingCar);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении данных авто", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCar(int id)
    {
        try
        {
            var car = await _carService.GetCarByIdAsync(id);
            if (car == null)
            {
                return NotFound(new { Message = "Авто не найдено" });
            }

            await _carService.DeleteCarAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении авто: {ex.Message}" });
        }
    }
}


