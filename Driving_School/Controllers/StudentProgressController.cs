using Driving_School_API.Models.StudentProgress;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/studentProgress")]
public class StudentProgressController : ControllerBase
{
    private readonly IStudentProgressService _studentProgressService;

    public StudentProgressController(IStudentProgressService studentProgressService)
    {
        _studentProgressService = studentProgressService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStudentProgress()
    {
        try
        {
            var studentProgress = await _studentProgressService.GetAllStudentProgressAsync();
            return Ok(studentProgress);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentProgressById(int id)
    {
        var studentProgress = await _studentProgressService.GetStudentProgressByIdAsync(id);
        if (studentProgress == null)
        {
            return NotFound(new { Message = $"Прогресс с id {id} не найден" });
        }

        return Ok(studentProgress);
    }

    [HttpGet("/studentProgress/student/{studentId}")]
    public async Task<IActionResult> GetStudentProgressByStudentId(int studentId)
    {
        var studentProgress = await _studentProgressService.GetStudentProgressByStudentIdAsync(studentId);
        if (studentProgress == null)
        {
            return NotFound(new { Message = $"Прогресс студента с id {studentId} не найден" });
        }

        return Ok(studentProgress);
    }

    [HttpPost]
    public async Task<IActionResult> AddStudentProgress([FromBody] StudentProgressDto studentProgressDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var studentProgress = new StudentProgress
        {
            Student_ID = studentProgressDto.Student_ID,
            Question_ID = studentProgressDto.Question_ID,
            IsCorrect = studentProgressDto.IsCorrect
        };

        try
        {
            await _studentProgressService.AddStudentProgressAsync(studentProgress);
            return CreatedAtAction(nameof(GetStudentProgressById), new { id = studentProgress.Id }, studentProgress);
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
    public async Task<IActionResult> UpdateStudentProgress(int id, [FromBody] StudentProgressDto studentProgressDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли прогресс студента
            var existingStudentProgress = await _studentProgressService.GetStudentProgressByIdAsync(id);
            if (existingStudentProgress == null)
            {
                return NotFound(new { Message = $"Прогресс студента с Id {id} не найден" });
            }

            // Обновляем данные прогресса студента
            existingStudentProgress.Student_ID = studentProgressDto.Student_ID;
            existingStudentProgress.Question_ID = studentProgressDto.Question_ID;
            existingStudentProgress.IsCorrect = studentProgressDto.IsCorrect;

            // Вызываем метод для сохранения изменений
            await _studentProgressService.UpdateStudentProgressAsync(existingStudentProgress);

            return Ok(existingStudentProgress);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении данных прогресс студента", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudentProgress(int id)
    {
        try
        {
            var studentProgress = await _studentProgressService.GetStudentProgressByIdAsync(id);
            if (studentProgress == null)
            {
                return NotFound(new { Message = $"Прогресс студента с Id {id} не найден" });
            }

            await _studentProgressService.DeleteStudentProgressAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении прогресса студента: {ex.Message}" });
        }
    }
}


