using Driving_School_API.Models.Driving_School;

public interface IDriving_SchoolRepository
{
    Task<IEnumerable<Driving_School>> GetAllDriving_SchoolsAsync(); // получение всех автошкол
    Task<Driving_School> GetDriving_SchoolByIdAsync(int id); // получение автошколы по id
    Task AddDriving_SchoolAsync(Driving_School car); // добавление автошколы
    Task UpdateDriving_SchoolAsync(Driving_School Driving_School); // изменение данных автошколы
    Task DeleteDriving_SchoolAsync(int id); // удаление автошколы по id
    Task<(IEnumerable<Driving_School> Data, int TotalCount)> GetFilteredDriving_SchoolsAsync(Driving_SchoolFilterDto filter); // фильтрация
}