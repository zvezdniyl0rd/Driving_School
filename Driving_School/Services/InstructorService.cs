using Driving_School_API.Models.Instructor;

public class InstructorService : IInstructorService {
    private readonly IInstructorRepository _instructorRepository;
    public InstructorService(IInstructorRepository instructorRepository) { _instructorRepository = instructorRepository; }

    // получение данных всех инструкторов
    public async Task<IEnumerable<Instructor>> GetAllInstructorsAsync() { return await _instructorRepository.GetAllInstructorsAsync(); }

    // получение данных инструктора по id
    public async Task<Instructor> GetInstructorByIdAsync(int id) { return await _instructorRepository.GetInstructorByIdAsync(id); }

    // получение отфильтрованных инструкторов с пагинацией
    public async Task<(IEnumerable<Instructor> Data, int TotalCount, int TotalPages)> GetFilteredInstructorsAsync(InstructorFilterDto filter) {
        var (data, totalCount) = await _instructorRepository.GetFilteredInstructorsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);
        return (data, totalCount, totalPages);
    }

    // добавление нового инструктора
    public async Task AddInstructorAsync(Instructor instructor) { await _instructorRepository.AddInstructorAsync(instructor); }

    // изменение данных инструктора
    public async Task UpdateInstructorAsync(Instructor instructor) { await _instructorRepository.UpdateInstructorAsync(instructor); }

    // удаление инструктора по id
    public async Task DeleteInstructorAsync(int id) { await _instructorRepository.DeleteInstructorAsync(id); }
}