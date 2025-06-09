using Driving_School_API.Models.Instructor;
using Driving_School_API.Models.Student;

public class StudentService : IStudentService
{
    private readonly IStudentRepository _studentRepository;

    public StudentService(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    // получение данных всех студентов
    public async Task<IEnumerable<Student>> GetAllStudentsAsync()
    {
        return await _studentRepository.GetAllStudentsAsync();
    }

    // получить данные студента по id
    public async Task<Student> GetStudentByIdAsync(int id)
    {
        return await _studentRepository.GetStudentByIdAsync(id);
    }

    // получение отфильтрованных студентов с пагинацией
    public async Task<(IEnumerable<Student> Data, int TotalCount, int TotalPages)> GetFilteredStudentsAsync(StudentFilterDto filter)
    {
        var (data, totalCount) = await _studentRepository.GetFilteredStudentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);
        return (data, totalCount, totalPages);
    }

    // создание нового студента
    public async Task AddStudentAsync(Student student)
    {
        await _studentRepository.AddStudentAsync(student);
    }

    // изменение данных студента
    public async Task UpdateStudentAsync(Student student)
    {
        await _studentRepository.UpdateStudentAsync(student);
    }

    // удаление студента по id
    public async Task DeleteStudentAsync(int id)
    {
        await _studentRepository.DeleteStudentAsync(id);
    }
}