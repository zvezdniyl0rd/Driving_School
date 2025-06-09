using Driving_School_API.Models.Filters;
using Driving_School_API.Models;

public interface IAuthRepository {
    Task<Account> GetAccountByLoginAsync(string login, string password);
    Task AddAccountAsync(Account account);
    Task<IEnumerable<Account>> GetAllAccountsAsync(); // вывод всех аккаунтов
    Task<Account> GetAccountByIdAsync(int id); // получение данных аккаунта по id
    Task UpdateAccountAsync(Account Account); // изменение данных аккаунта
    Task DeleteAccountAsync(int id); // удаление аккаунта по id
    Task<(IEnumerable<Account> Data, int TotalCount)> GetFilteredAccountsAsync(AccountFilterDto filter); // фильтрация
}