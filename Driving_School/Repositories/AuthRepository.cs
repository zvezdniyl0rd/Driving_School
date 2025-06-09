using Driving_School_API.Models.Filters;
using Driving_School_API.Models;
using Microsoft.EntityFrameworkCore;

public class AuthRepository : IAuthRepository {
    private readonly ApplicationDbContext _context;
    public AuthRepository(ApplicationDbContext context) { _context = context; }

    // получение данных всех аккаунтов
    public async Task<IEnumerable<Account>> GetAllAccountsAsync() { return await _context.Account.ToListAsync(); }

    // получение данных аккаунта по id
    public async Task<Account> GetAccountByIdAsync(int id) { return await _context.Account.FindAsync(id); }

    // получение отфильтрованных аккаунтов
    public async Task<(IEnumerable<Account> Data, int TotalCount)> GetFilteredAccountsAsync(AccountFilterDto filter) {
        var query = _context.Account
            .AsQueryable();

        // Фильтрация по логину
        if (!string.IsNullOrEmpty(filter.Login)) { query = query.Where(a => a.Login.ToLower().Contains(filter.Login.ToLower())); }

        // Фильтрация по типу пользователя
        if (filter.UserType.HasValue) { query = query.Where(a => a.User_Type == filter.UserType.Value); }

        // Фильтрация по ФИО (присоединяем таблицы Students и Instructors)
        if (!string.IsNullOrEmpty(filter.FullName)) {
            var fullNameLower = filter.FullName.ToLower();
            query = query.Where(a =>
                (a.Student_ID.HasValue && _context.Student
                    .Where(s => s.Id == a.Student_ID)
                    .Any(s => (s.Surname + " " + s.Name + " " + s.Patronymic).ToLower().Contains(fullNameLower))) ||
                (a.Instructor_ID.HasValue && _context.Instructor
                    .Where(i => i.Id == a.Instructor_ID)
                    .Any(i => (i.Surname + " " + i.Name + " " + i.Patronymic).ToLower().Contains(fullNameLower)))
            );
        }

        // Фильтрация по городу и автошколе
        if (filter.CityId.HasValue || filter.DrivingSchoolId.HasValue) {
            query = query.Where(a =>
                (a.Student_ID.HasValue && _context.Student
                    .Where(s => s.Id == a.Student_ID)
                    .Any(s =>
                        (!filter.DrivingSchoolId.HasValue || s.DrivingSchool_ID == filter.DrivingSchoolId.Value) &&
                        (!filter.CityId.HasValue || _context.Driving_School
                            .Where(ds => ds.Id == s.DrivingSchool_ID)
                            .Any(ds => ds.City_ID == filter.CityId.Value)))) ||
                (a.Instructor_ID.HasValue && _context.Instructor
                    .Where(i => i.Id == a.Instructor_ID)
                    .Any(i =>
                        (!filter.DrivingSchoolId.HasValue || i.DrivingSchool_ID == filter.DrivingSchoolId.Value) &&
                        (!filter.CityId.HasValue || _context.Driving_School
                            .Where(ds => ds.Id == i.DrivingSchool_ID)
                            .Any(ds => ds.City_ID == filter.CityId.Value))))
            );
        }

        // Подсчёт общего количества записей
        var totalCount = await query.CountAsync();

        // Применяем пагинацию
        var paginatedData = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (paginatedData, totalCount);
    }

    // получение аккаунта по id
    public async Task<Account> GetAccountByLoginAsync(string login, string password) {
        return await _context.Account.FirstOrDefaultAsync(a => a.Login == login && a.Password == password);
    }

    // создание нового аккаунта
    public async Task AddAccountAsync(Account account) {
        await _context.Account.AddAsync(account);
        await _context.SaveChangesAsync();
    }

    // изменение данных аккаунта
    public async Task UpdateAccountAsync(Account account) {
        _context.Account.Update(account);
        await _context.SaveChangesAsync();
    }

    // удаление аккаунта по id
    public async Task DeleteAccountAsync(int id) {
        var account = await _context.Account.FindAsync(id);
        if (account == null) { throw new KeyNotFoundException("Аккаунт с указанным ID не найден."); }
        _context.Account.Remove(account);
        await _context.SaveChangesAsync();
    }
}