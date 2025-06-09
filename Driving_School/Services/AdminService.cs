using Driving_School_API.Models.Admin;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    // получение данных всех администраторов
    public async Task<IEnumerable<Admin>> GetAllAdminsAsync()
    {
        return await _adminRepository.GetAllAdminsAsync();
    }

    // получить данные администратора по id
    public async Task<Admin> GetAdminByIdAsync(int id)
    {
        return await _adminRepository.GetAdminByIdAsync(id);
    }

    // создание нового администратора
    public async Task AddAdminAsync(Admin admin)
    {
        await _adminRepository.AddAdminAsync(admin);
    }

    // изменение данных администратора
    public async Task UpdateAdminAsync(Admin admin)
    {
        await _adminRepository.UpdateAdminAsync(admin);
    }

    // удаление администратора по id
    public async Task DeleteAdminAsync(int id)
    {
        await _adminRepository.DeleteAdminAsync(id);
    }
}