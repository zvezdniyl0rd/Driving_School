using Driving_School_API.Models.Admin;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/admins")]
public class AdminsController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminsController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAdmins()
    {
        try
        {
            var admins = await _adminService.GetAllAdminsAsync();
            return Ok(admins);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAdminById(int id)
    {
        var admin = await _adminService.GetAdminByIdAsync(id);
        if (admin == null)
        {
            return NotFound(new { Message = $"Администратор с id {id} не найден" });
        }

        return Ok(admin);
    }

    [HttpPost]
    public async Task<IActionResult> AddAdmin([FromBody] AdminDto adminDto)
    {
        // Валидация входных данных
        if (!ModelState.IsValid)
        {
            // Если валидация не прошла, возвращаем 400 с подробными ошибками
            return BadRequest(ModelState);
        }

        // Преобразуем DTO в сущность модели
        var admin = new Admin
        {
            Surname = adminDto.Surname,
            Name = adminDto.Name,
            Patronymic = adminDto.Patronymic,
            PhoneNumber = adminDto.PhoneNumber,
            Email = adminDto.Email,
            DrivingSchool_ID = adminDto.DrivingSchool_ID
        };

        try
        {
            await _adminService.AddAdminAsync(admin);
            return CreatedAtAction(nameof(GetAdminById), new { id = admin.Id }, admin);
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
    public async Task<IActionResult> UpdateAdmin(int id, [FromBody] AdminDto adminDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Проверяем, существует ли авто
            var existingAdmin = await _adminService.GetAdminByIdAsync(id);
            if (existingAdmin == null)
            {
                return NotFound(new { Message = $"Администратор с Id {id} не найден" });
            }

            // Обновляем данные авто
            existingAdmin.Surname = adminDto.Surname;
            existingAdmin.Name = adminDto.Name;
            existingAdmin.Patronymic = adminDto.Patronymic;
            existingAdmin.PhoneNumber = adminDto.PhoneNumber;
            existingAdmin.Email = adminDto.Email;
            existingAdmin.DrivingSchool_ID = adminDto.DrivingSchool_ID;
            existingAdmin.Attachment_ID = adminDto.Attachment_ID;

            // Вызываем метод для сохранения изменений
            await _adminService.UpdateAdminAsync(existingAdmin);

            return Ok(existingAdmin);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка при обновлении данных администратора", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAdmin(int id)
    {
        try
        {
            var admin = await _adminService.GetAdminByIdAsync(id);
            if (admin == null)
            {
                return NotFound(new { Message = "Администратор не найден" });
            }

            await _adminService.DeleteAdminAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении администратора: {ex.Message}" });
        }
    }
}


