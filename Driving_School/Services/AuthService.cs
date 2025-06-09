using Driving_School_API.Models.Filters;
using Driving_School_API.Models;
using Driving_School_API.Models.Car;
using Driving_School_API.Models.Instructor;
using Driving_School_API.Models.Student;
using Driving_School_API.Models.Admin;

public class AuthService : IAuthService {
    private readonly IAuthRepository _accountRepository;
    private readonly IInstructorRepository _instructorRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly ICarRepository _carRepository;
    private readonly IAdminRepository _adminRepository;

    public AuthService(IAuthRepository accountRepository, IInstructorRepository instructorRepository,
                       IStudentRepository studentRepository, ICarRepository carRepository, IAdminRepository adminRepository) {
        _accountRepository = accountRepository;
        _instructorRepository = instructorRepository;
        _studentRepository = studentRepository;
        _carRepository = carRepository;
        _adminRepository = adminRepository;
    }

    // получение данных всех аккаунтов
    public async Task<IEnumerable<Account>> GetAllAccountsAsync() { return await _accountRepository.GetAllAccountsAsync(); }

    public async Task<(bool, string, Account)> LoginAsync(string login, string password) {
        var account = await _accountRepository.GetAccountByLoginAsync(login, password);
        if (account == null || account.Password != password) { return (false, "Неверный логин или пароль!", null); }
        return (true, "Успешная авторизация", account);
    }

    // получить данные аккаунта по id
    public async Task<Account> GetAccountByIdAsync(int id) { return await _accountRepository.GetAccountByIdAsync(id); }

    // получение отфильтрованных аккаунтов с пагинацией
    public async Task<(IEnumerable<Account> Data, int TotalCount, int TotalPages)> GetFilteredAccountsAsync(AccountFilterDto filter) {
        var (data, totalCount) = await _accountRepository.GetFilteredAccountsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);
        return (data, totalCount, totalPages);
    }

    public async Task<(bool, string, Instructor)> RegisterInstructorAsync(RegisterInstructorDto instructorDto) {
        try {
            // Создать и сохранить машину
            var car = new Car {
                Brand = instructorDto.CarBrand,
                Model = instructorDto.CarModel,
                Color = instructorDto.CarColor,
                Car_Number = instructorDto.CarNumber
            };
            await _carRepository.AddCarAsync(car);

            // Создать и сохранить инструктора
            var instructor = new Instructor {
                Surname = instructorDto.Surname,
                Name = instructorDto.Name,
                Patronymic = instructorDto.Patronymic,
                PhoneNumber = instructorDto.PhoneNumber,
                Email = instructorDto.Email,
                DrivingSchool_ID = instructorDto.DrivingSchool_ID,
                Car_ID = car.Id
            };
            await _instructorRepository.AddInstructorAsync(instructor);

            // Создать и сохранить учетную запись
            var account = new Account {
                User_Type = 1,
                Instructor_ID = instructor.Id,
                Login = instructorDto.PhoneNumber,
                Password = instructorDto.Password
            };
            await _accountRepository.AddAccountAsync(account);
            return (true, "Инструктор успешно зарегистрирован", instructor);
        }
        catch (Exception ex) { return (false, ex.InnerException?.Message ?? ex.Message, null); }
    }

    public async Task<(bool, string, Student)> RegisterStudentAsync(RegisterStudentDto studentDto) {
        try {
            // Создать и сохранить студента
            var student = new Student {
                Surname = studentDto.Surname,
                Name = studentDto.Name,
                Patronymic = studentDto.Patronymic,
                PhoneNumber = studentDto.PhoneNumber,
                Email = studentDto.Email,
                DrivingSchool_ID = studentDto.DrivingSchool_ID,
                Birthdate = studentDto.Birthdate
            };

            // Сохранить студента в базе данных (вызвать метод репозитория)
            await _studentRepository.AddStudentAsync(student);

            // Создать и сохранить учетную запись
            var account = new Account {
                User_Type = 2,
                Student_ID = student.Id,
                Login = studentDto.PhoneNumber,
                Password = studentDto.Password
            };
            await _accountRepository.AddAccountAsync(account);
            return (true, "Студент зарегистрирован успешно.", student);
        }
        catch (Exception ex) { return (false, ex.InnerException?.Message ?? ex.Message, null); }
    }

    public async Task<(bool, string, Admin)> RegisterAdminAsync(RegisterAdminDto adminDto) {
        try {
            // Создать и сохранить студента
            var admin = new Admin {
                Surname = adminDto.Surname,
                Name = adminDto.Name,
                Patronymic = adminDto.Patronymic,
                PhoneNumber = adminDto.PhoneNumber,
                Email = adminDto.Email,
                DrivingSchool_ID = adminDto.DrivingSchool_ID
            };

            // Сохранить студента в базе данных (вызвать метод репозитория)
            await _adminRepository.AddAdminAsync(admin);

            // Создать и сохранить учетную запись
            var account = new Account {
                User_Type = 2,
                Admin_ID = admin.Id,
                Login = adminDto.PhoneNumber,
                Password = adminDto.Password
            };
            await _accountRepository.AddAccountAsync(account);
            return (true, "Администратор зарегистрирован успешно.", admin);
        }
        catch (Exception ex) { return (false, ex.InnerException?.Message ?? ex.Message, null); }
    }

    // изменение данных аккаунта
    public async Task UpdateAccountAsync(Account account) { await _accountRepository.UpdateAccountAsync(account); }

    // удаление аккаунта по id
    public async Task DeleteAccountAsync(int id) { await _accountRepository.DeleteAccountAsync(id); }
}