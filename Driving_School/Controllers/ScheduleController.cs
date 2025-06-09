using Driving_School_API.Models;
using Driving_School_API.Models.Schedule;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/schedules")]
public class SchedulesController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public SchedulesController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSchedules([FromQuery] int? month = null, [FromQuery] int? year = null, [FromQuery] int? day = null)
    {
        try
        {
            var schedules = await _scheduleService.GetAllSchedulesAsync();

            // Фильтрация по месяцу и году, если параметры указаны
            if (month.HasValue && year.HasValue)
            {
                schedules = schedules.Where(s => s.Date.Month == month.Value && s.Date.Year == year.Value).ToList();

                // Дополнительная фильтрация по дню, если параметр указан
                if (day.HasValue)
                {
                    schedules = schedules.Where(s => s.Date.Day == day.Value).ToList();
                }
            }

            return Ok(schedules);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("/schedule/{id}")]
    public async Task<IActionResult> GetScheduleById(int id)
    {
        var schedule = await _scheduleService.GetScheduleByIdAsync(id);
        if (schedule == null) return NotFound(new { Message = $"Расписание с id {id} не найдено" });
        return Ok(schedule);
    }

    [HttpGet("/schedules/instructor/{instructor_id}")]
    public async Task<IActionResult> GetScheduleByInstructorId(int instructor_id)
    {
        var schedule = await _scheduleService.GetScheduleByInstructorIdAsync(instructor_id);
        if (schedule == null) return NotFound(new { Message = $"Записей для инструктора с id {instructor_id} не найдено" });
        return Ok(schedule);
    }

    [HttpGet("/schedules/student/{student_id}")]
    public async Task<IActionResult> GetScheduleByStudentId(int student_id)
    {
        var schedule = await _scheduleService.GetScheduleByStudentIdAsync(student_id);
        if (schedule == null) return NotFound(new { Message = $"Записей для студента с id {student_id} не найдено" });
        return Ok(schedule);
    }

    [HttpPost("/schedule")]
    public async Task<IActionResult> AddSchedule([FromBody] ScheduleDto scheduleDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var schedule = new Schedule
        {
            Date = scheduleDto.Date,
            SlotTime = scheduleDto.SlotTime,
            IsAvailable = scheduleDto.IsAvailable,
            Instructor_ID = scheduleDto.Instructor_ID,
            Student_ID = scheduleDto.Student_ID,
            CreatedAt = DateTime.Now
        };

        try
        {
            await _scheduleService.AddScheduleAsync(schedule);
            return CreatedAtAction(nameof(GetScheduleById), new { id = schedule.Id }, schedule);
        }
        catch (DbUpdateException dbEx)
        {
            // Если проблема связана с БД, например, некорректный внешний ключ
            return BadRequest(new { Message = "Ошибка целостности данных: проверьте корректность ID инструктора и студента", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            // Для других исключений
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] ScheduleEditDto scheduleDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли расписание
            var existingSchedule = await _scheduleService.GetScheduleByIdAsync(id);
            if (existingSchedule == null)
            {
                return NotFound(new { Message = $"Расписание с Id {id} не найдено" });
            }

            // Обновляем данные расписания
            existingSchedule.IsAvailable = scheduleDto.IsAvailable;
            existingSchedule.Student_ID = scheduleDto.Student_ID;

            // Вызываем метод для сохранения изменений
            await _scheduleService.UpdateScheduleAsync(existingSchedule);

            return Ok(existingSchedule);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении расписания", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        try
        {
            var schedule = await _scheduleService.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound(new { Message = $"Расписание с Id {id} не найдено" });
            }

            await _scheduleService.DeleteScheduleAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении расписания: ${ex.Message}" });
        }
    }
}