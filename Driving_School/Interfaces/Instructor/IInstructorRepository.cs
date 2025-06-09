using Driving_School_API.Models.Instructor;

public interface IInstructorRepository {
    Task<IEnumerable<Instructor>> GetAllInstructorsAsync(); // получение всех инструкторов
    Task<Instructor> GetInstructorByIdAsync(int id); // получение инструктора по id
    Task AddInstructorAsync(Instructor instructor); // добавление инструктора
    Task UpdateInstructorAsync(Instructor instructor); // изменение данных инструктора
    Task DeleteInstructorAsync(int id); // удаление инструктора по id
    Task<(IEnumerable<Instructor> Data, int TotalCount)> GetFilteredInstructorsAsync(InstructorFilterDto filter); // фильтрация
}