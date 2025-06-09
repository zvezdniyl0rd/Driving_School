using Driving_School_API.Models.Instructor;

public interface IInstructorService
{
    Task<IEnumerable<Instructor>> GetAllInstructorsAsync(); // получение данных всех инструкторов
    Task<Instructor> GetInstructorByIdAsync(int id); // получение данных инструктора по id
    Task AddInstructorAsync(Instructor instructor); // добавление нового инструктора
    Task UpdateInstructorAsync(Instructor instructor); // изменение данных инструктора
    Task DeleteInstructorAsync(int id); // удаление инструктора по id
    Task<(IEnumerable<Instructor> Data, int TotalCount, int TotalPages)> GetFilteredInstructorsAsync(InstructorFilterDto filter); // фильтрация и пагинация
}