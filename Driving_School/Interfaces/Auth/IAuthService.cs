using Driving_School_API.Models.Filters;
using Driving_School_API.Models;
using Driving_School_API.Models.Instructor;
using Driving_School_API.Models.Student;
using Driving_School_API.Models.Admin;

public interface IAuthService {
    Task<(bool, string, Account)> LoginAsync(string login, string password); // авторизация
    Task<(bool, string, Instructor)> RegisterInstructorAsync(RegisterInstructorDto instructorDto); // регистрация инструктора
    Task<(bool, string, Student)> RegisterStudentAsync(RegisterStudentDto studentDto); // регистрация студента
    Task<(bool, string, Admin)> RegisterAdminAsync(RegisterAdminDto adminDto); // регистрация администратора
    Task<IEnumerable<Account>> GetAllAccountsAsync(); // вывод всех аккаунтов
    Task<Account> GetAccountByIdAsync(int id); // получение данных аккаунта по id
    Task UpdateAccountAsync(Account Account); // изменение данных аккаунта
    Task DeleteAccountAsync(int id); // удаление аккаунта по id
    Task<(IEnumerable<Account> Data, int TotalCount, int TotalPages)> GetFilteredAccountsAsync(AccountFilterDto filter); // фильтрация и пагинация
}