using Driving_School_API.Models.Instructor;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/instructors")]
public class InstructorsController : ControllerBase {
    private readonly IInstructorService _instructorService;

    public InstructorsController(IInstructorService instructorService) { _instructorService = instructorService; }

    [HttpGet]
    public async Task<IActionResult> GetAllInstructors() {
        try {
            var instructors = await _instructorService.GetAllInstructorsAsync();
            return Ok(instructors);
        }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetInstructorById(int id) {
        var instructor = await _instructorService.GetInstructorByIdAsync(id);
        if (instructor == null) { return NotFound(new { Message = $"Инструктор c Id {id} не найден" }); }
        return Ok(instructor);
    }

    // Фильтрация инструкторов
    [HttpPost("/instructors")]
    public async Task<IActionResult> GetFilteredInstructors([FromBody] InstructorFilterDto filter) {
        try {
            var (data, totalCount, totalPages) = await _instructorService.GetFilteredInstructorsAsync(filter);

            return Ok(new {
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                Data = data
            });
        }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpPost("/instructor")]
    public async Task<IActionResult> AddInstructor([FromBody] InstructorDto instructorDto) {
        // Валидация входных данных
        if (!ModelState.IsValid) { return BadRequest(ModelState); }

        // Преобразуем DTO в сущность модели
        var instructor = new Instructor {
            Surname = instructorDto.Surname,
            Name = instructorDto.Name,
            Patronymic = instructorDto.Patronymic,
            PhoneNumber = instructorDto.PhoneNumber,
            Email = instructorDto.Email,
            DrivingSchool_ID = instructorDto.DrivingSchool_ID,
            Car_ID = instructorDto.Car_ID,
            Attachment_ID = instructorDto.Attachment_ID
        };

        try {
            await _instructorService.AddInstructorAsync(instructor);
            return CreatedAtAction(nameof(GetInstructorById), new { id = instructor.Id }, instructor);
        }
        catch (DbUpdateException dbEx) { return BadRequest(new { Message = "Ошибка целостности данных: проверьте корректность передаваемых данных", Details = dbEx.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }        
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInstructor(int id, [FromBody] InstructorDto instructorDto) {
        if (!ModelState.IsValid) { return BadRequest(ModelState); }

        try {
            // Проверка, существует ли инструктор
            var existingInstructor = await _instructorService.GetInstructorByIdAsync(id);
            if (existingInstructor == null) { return NotFound(new { Message = $"Инструктор с Id {id} не найден" }); }

            // Обновление данныхх инструктора
            existingInstructor.Surname = instructorDto.Surname;
            existingInstructor.Name = instructorDto.Name;
            existingInstructor.Patronymic = instructorDto.Patronymic;
            existingInstructor.PhoneNumber = instructorDto.PhoneNumber;
            existingInstructor.Email = instructorDto.Email;
            existingInstructor.DrivingSchool_ID = instructorDto.DrivingSchool_ID;
            existingInstructor.Car_ID = instructorDto.Car_ID;
            existingInstructor.Attachment_ID = instructorDto.Attachment_ID;

            // Вызов метода для сохранения изменений
            await _instructorService.UpdateInstructorAsync(existingInstructor);

            return Ok(existingInstructor);
        }
        catch (DbUpdateException dbEx) { return BadRequest(new { Message = "Ошибка при обновлении данных инструктора", Details = dbEx.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInstructor(int id) {
        try {
            var instructor = await _instructorService.GetInstructorByIdAsync(id);
            if (instructor == null) { return NotFound(new { Message = "Инструктор не найден" }); }
            await _instructorService.DeleteInstructorAsync(id);
            return NoContent();
        }
        catch (Exception ex) { return StatusCode(500, new { Message = $"Ошибка при удалении инструктора: {ex.Message}" }); }
    }
}