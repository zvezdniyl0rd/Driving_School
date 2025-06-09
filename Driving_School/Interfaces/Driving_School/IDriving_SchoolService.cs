using Driving_School_API.Models.Driving_School;

public interface IDriving_SchoolService
{
    Task<IEnumerable<Driving_School>> GetAllDriving_SchoolsAsync(); // получение данных всех автошкол
    Task<Driving_School> GetDriving_SchoolByIdAsync(int id); // получение данных автошколы по id
    Task AddDriving_SchoolAsync(Driving_School driving_School); // добавление нового автошколы
    Task UpdateDriving_SchoolAsync(Driving_School Driving_School); // изменение данных автошколы
    Task DeleteDriving_SchoolAsync(int id); // удаление автошколы по id
    Task<(IEnumerable<Driving_School> Data, int TotalCount, int TotalPages)> GetFilteredDriving_SchoolsAsync(Driving_SchoolFilterDto filter); // фильтрация и пагинация
}