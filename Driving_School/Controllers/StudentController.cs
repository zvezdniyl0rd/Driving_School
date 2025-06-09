using Driving_School_API.Models.Student;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

[ApiController]
[Route("/students")]
public class StudentsController : ControllerBase {
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService) {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStudents() {
        try { return Ok(await _studentService.GetAllStudentsAsync()); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentById(int id) {
        var student = await _studentService.GetStudentByIdAsync(id);
        if (student == null) return NotFound(new { Message = $"Студент с id {id} не найден" });
        return Ok(student);
    }

    // Фильтрация студентов
    [HttpPost("/students")]
    public async Task<IActionResult> GetFilteredStudents([FromBody] StudentFilterDto filter) {
        try {
            var (data, totalCount, totalPages) = await _studentService.GetFilteredStudentsAsync(filter);

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

    [HttpPost("/student")]
    public async Task<IActionResult> AddStudent([FromBody] StudentDto studentDto) {
        // Валидация входных данных
        if (!ModelState.IsValid)  { return BadRequest(ModelState); }

        // Преобразуем DTO в сущность модели
        var student = new Student {
            Surname = studentDto.Surname,
            Name = studentDto.Name,
            Patronymic = studentDto.Patronymic,
            PhoneNumber = studentDto.PhoneNumber,
            Email = studentDto.Email,
            DrivingSchool_ID = studentDto.DrivingSchool_ID,
            Birthdate = studentDto.Birthdate,
            Attachment_ID = studentDto.Attachment_ID
        };

        try {
            await _studentService.AddStudentAsync(student);
            return CreatedAtAction(nameof(GetStudentById), new { id = student.Id }, student);
        }
        catch (DbUpdateException dbEx) { return BadRequest(new { Message = "Ошибка целостности данных: проверьте корректность ID автошколы", Details = dbEx.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudent(int id, [FromBody] StudentDto studentDto) {
        if (!ModelState.IsValid) { return BadRequest(ModelState); }

        try {
            // Проверяем, существует ли студент
            var existingStudent = await _studentService.GetStudentByIdAsync(id);
            if (existingStudent == null) {
                return NotFound(new { Message = $"Студент с Id {id} не найден" });
            }

            // Обновляем данные студента
            existingStudent.Surname = studentDto.Surname;
            existingStudent.Name = studentDto.Name;
            existingStudent.Patronymic = studentDto.Patronymic;
            existingStudent.PhoneNumber = studentDto.PhoneNumber;
            existingStudent.Email = studentDto.Email;
            existingStudent.DrivingSchool_ID = studentDto.DrivingSchool_ID;
            existingStudent.Birthdate = studentDto.Birthdate;
            existingStudent.Attachment_ID = studentDto.Attachment_ID;

            // Вызываем метод для сохранения изменений
            await _studentService.UpdateStudentAsync(existingStudent);

            return Ok(existingStudent);
        }
        catch (DbUpdateException dbEx) { return BadRequest(new { Message = "Ошибка при обновлении данных студента", Details = dbEx.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id) {
        try {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null) { return NotFound(new { Message = $"Студент с Id {id} не найден" }); }

            await _studentService.DeleteStudentAsync(id);
            return NoContent();
        }
        catch (Exception ex) { return StatusCode(500, new { Message = $"Ошибка при удалении студента: {ex.Message}" }); }
    }
}