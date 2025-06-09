using Driving_School_API.Models.Driving_School;

public class Driving_SchoolService : IDriving_SchoolService
{
    private readonly IDriving_SchoolRepository _driving_SchoolRepository;

    public Driving_SchoolService(IDriving_SchoolRepository driving_SchoolRepository)
    {
        _driving_SchoolRepository = driving_SchoolRepository;
    }

    // получение данных всех автошкол
    public async Task<IEnumerable<Driving_School>> GetAllDriving_SchoolsAsync()
    {
        return await _driving_SchoolRepository.GetAllDriving_SchoolsAsync();
    }

    // получить данные автошколы по id
    public async Task<Driving_School> GetDriving_SchoolByIdAsync(int id)
    {
        return await _driving_SchoolRepository.GetDriving_SchoolByIdAsync(id);
    }

    // получение отфильтрованных автошкол с пагинацией
    public async Task<(IEnumerable<Driving_School> Data, int TotalCount, int TotalPages)> GetFilteredDriving_SchoolsAsync(Driving_SchoolFilterDto filter)
    {
        var (data, totalCount) = await _driving_SchoolRepository.GetFilteredDriving_SchoolsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);
        return (data, totalCount, totalPages);
    }

    // создание новой автошколы
    public async Task AddDriving_SchoolAsync(Driving_School driving_School)
    {
        await _driving_SchoolRepository.AddDriving_SchoolAsync(driving_School);
    }

    // изменение данных автошколы
    public async Task UpdateDriving_SchoolAsync(Driving_School driving_School)
    {
        await _driving_SchoolRepository.UpdateDriving_SchoolAsync(driving_School);
    }

    // удаление автошколы по id
    public async Task DeleteDriving_SchoolAsync(int id)
    {
        await _driving_SchoolRepository.DeleteDriving_SchoolAsync(id);
    }
}