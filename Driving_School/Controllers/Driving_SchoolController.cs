using Driving_School_API.Models.Driving_School;
using Driving_School_API.Models.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/driving_Schools")]
public class Driving_SchoolsController : ControllerBase
{
    private readonly IDriving_SchoolService _driving_SchoolService;

    public Driving_SchoolsController(IDriving_SchoolService driving_SchoolService)
    {
        _driving_SchoolService = driving_SchoolService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDriving_Schools()
    {
        try
        {
            var driving_Schools = await _driving_SchoolService.GetAllDriving_SchoolsAsync();
            return Ok(driving_Schools);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    // Фильтрация автошкол
    [HttpPost("/driving_Schools")]
    public async Task<IActionResult> GetFilteredDriving_Schools([FromBody] Driving_SchoolFilterDto filter)
    {
        try
        {
            var (data, totalCount, totalPages) = await _driving_SchoolService.GetFilteredDriving_SchoolsAsync(filter);

            return Ok(new
            {
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                Data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDriving_SchoolById(int id)
    {
        var driving_School = await _driving_SchoolService.GetDriving_SchoolByIdAsync(id);
        if (driving_School == null)
        {
            return NotFound(new { Message = $"Автошкола с id {id} не найдена" });
        }

        return Ok(driving_School);
    }

    // Добавление новой автошколы
    [HttpPost("/driving_School")]
    public async Task<IActionResult> AddDriving_School([FromBody] Driving_SchoolDto driving_SchoolDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var driving_School = new Driving_School
        {
            Address = driving_SchoolDto.Address,
            PhoneNumber = driving_SchoolDto.PhoneNumber,
            Email = driving_SchoolDto.Email,
            City_ID = driving_SchoolDto.City_ID
        };

        try
        {
            await _driving_SchoolService.AddDriving_SchoolAsync(driving_School);
            return CreatedAtAction(nameof(GetDriving_SchoolById), new { id = driving_School.Id }, driving_School);
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
    public async Task<IActionResult> UpdateDriving_School(int id, [FromBody] Driving_SchoolDto driving_SchoolDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли автошкола
            var existingDriving_School = await _driving_SchoolService.GetDriving_SchoolByIdAsync(id);
            if (existingDriving_School == null)
            {
                return NotFound(new { Message = $"Автошкола с Id {id} не найдена" });
            }

            // Обновляем данные автошколы
            existingDriving_School.Address = driving_SchoolDto.Address;
            existingDriving_School.PhoneNumber = driving_SchoolDto.PhoneNumber;
            existingDriving_School.Email = driving_SchoolDto.Email;
            existingDriving_School.City_ID = driving_SchoolDto.City_ID;

            // Вызываем метод для сохранения изменений
            await _driving_SchoolService.UpdateDriving_SchoolAsync(existingDriving_School);

            return Ok(existingDriving_School);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении данных автошколы", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDriving_School(int id)
    {
        try
        {
            var driving_School = await _driving_SchoolService.GetDriving_SchoolByIdAsync(id);
            if (driving_School == null)
            {
                return NotFound(new { Message = "Автошкола не найдена" });
            }

            await _driving_SchoolService.DeleteDriving_SchoolAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении автошколы: {ex.Message}" });
        }
    }
}


