using Driving_School_API.Models.Filters;
using Driving_School_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("")] 
[ApiController]
public class AuthController : ControllerBase {
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) { _authService = authService; }

    [HttpGet("/accounts")]
    public async Task<IActionResult> GetAllAccounts([FromQuery] int page = 1, [FromQuery] int pageSize = 10) {
        try {
            var accounts = await _authService.GetAllAccountsAsync();
            var totalCount = accounts.Count();
            var paginatedAccounts = accounts
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                Data = paginatedAccounts
            });
        }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    [HttpPost("/accounts")]
    public async Task<IActionResult> GetFilteredAccounts([FromBody] AccountFilterDto filter) {
        try {
            var (data, totalCount, totalPages) = await _authService.GetFilteredAccountsAsync(filter);

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

    [HttpPut("/account/{id}")]
    public async Task<IActionResult> UpdateAccount(int id, [FromBody] LoginDto accountDto) {
        if (!ModelState.IsValid) { return BadRequest(ModelState); }
        try {
            var existingAccount = await _authService.GetAccountByIdAsync(id);
            if (existingAccount == null) { return NotFound(new { Message = $"Авто с Id {id} не найден" }); }
            existingAccount.Login = accountDto.Login;
            existingAccount.Password = accountDto.Password;
            await _authService.UpdateAccountAsync(existingAccount);
            return Ok(existingAccount);
        }
        catch (DbUpdateException dbEx) { return BadRequest(new { Message = "Ошибка при обновлении данных аккаунта", Details = dbEx.Message }); }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }

    // авторизация
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto) {
        var (isSuccess, message, account) = await _authService.LoginAsync(loginDto.Login, loginDto.Password);
        if (!isSuccess) { return Unauthorized(new { Message = message }); }
   
        if (account.Student_ID.HasValue && account.Instructor_ID.HasValue)
            return BadRequest(new { Message = "Аккаунт не может быть связан одновременно со студентом и инструктором" });

        return Ok(new { account.Id, account.User_Type, account.Student_ID, account.Instructor_ID, account.Admin_ID });
    }

    // регистрация инструктора
    [HttpPost("register/instructor")]
    public async Task<IActionResult> RegisterInstructor([FromBody] RegisterInstructorDto instructorDto) {
        var (isSuccess, message, instructor) = await _authService.RegisterInstructorAsync(instructorDto);
        if (!isSuccess) { return BadRequest(new { Message = message }); }
        return Ok(new { Message = message, instructor });
    }

    // регистрация студента
    [HttpPost("register/student")]
    public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentDto studentDto) {
        var (isSuccess, message, student) = await _authService.RegisterStudentAsync(studentDto);
        if (!isSuccess) { return BadRequest(new { Message = message }); }
        return Ok(new { Message = message, student });
    }

    // регистрация администратора
    [HttpPost("register/admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto adminDto) {
        var (isSuccess, message, admin) = await _authService.RegisterAdminAsync(adminDto);
        if (!isSuccess) { return BadRequest(new { Message = message }); }
        return Ok(new { Message = message, admin });
    }

    // получение данных аккаунта по id
    [HttpGet("accounts/{id}")]
    public async Task<IActionResult> GetAccountById(int id) {
        var account = await _authService.GetAccountByIdAsync(id);
        if (account == null) { return NotFound(new { Message = $"Аккаунт с id {id} не найден" }); }
        return Ok(account);
    }

    // удаление аккаунта
    [HttpDelete("accounts/{id}")]
    public async Task<IActionResult> DeleteAccount(int id) {
        try {
            var account = await _authService.GetAccountByIdAsync(id);
            if (account == null) { return NotFound(new { Message = "Аккаунт не найден" }); }
            await _authService.DeleteAccountAsync(id);
            return Ok(new { Message = "Аккаунт успешно удалён" });
        }
        catch (Exception ex) { return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message }); }
    }
}