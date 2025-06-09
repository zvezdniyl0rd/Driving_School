using Driving_School_API.Models.Admin;

public interface IAdminService
{
    Task<IEnumerable<Admin>> GetAllAdminsAsync(); // получение данных всех администраторов
    Task<Admin> GetAdminByIdAsync(int id); // получение данных администратора по id
    Task AddAdminAsync(Admin student); // добавление нового администратора
    Task UpdateAdminAsync(Admin student); // изменение данных администратора
    Task DeleteAdminAsync(int id); // удаление администратора по id
}