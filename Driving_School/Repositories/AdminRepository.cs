using Driving_School_API.Models.Admin;
using Microsoft.EntityFrameworkCore;

public class AdminRepository : IAdminRepository
{
    private readonly ApplicationDbContext _context;

    public AdminRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех администраторов
    public async Task<IEnumerable<Admin>> GetAllAdminsAsync()
    {
        return await _context.Admin.ToListAsync();
    }

    // получение данных администратора по id
    public async Task<Admin> GetAdminByIdAsync(int id)
    {
        return await _context.Admin.FindAsync(id);
    }

    // добавление нового администратора
    public async Task AddAdminAsync(Admin admin)
    {
        await _context.Admin.AddAsync(admin);
        await _context.SaveChangesAsync();
    }

    // изменение данных администратора
    public async Task UpdateAdminAsync(Admin admin)
    {
        _context.Admin.Update(admin);
        await _context.SaveChangesAsync();
    }

    // удаление администратора по id
    public async Task DeleteAdminAsync(int id)
    {
        var admin = await _context.Admin.FindAsync(id);
        if (admin == null)
        {
            throw new KeyNotFoundException("Администратор с указанным ID не найден");
        }

        _context.Admin.Remove(admin);
        await _context.SaveChangesAsync();
    }
}