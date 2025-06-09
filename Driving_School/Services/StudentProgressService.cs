using Driving_School_API.Models.StudentProgress;

public class StudentProgressService : IStudentProgressService
{
    private readonly IStudentProgressRepository _studentProgressRepository;

    public StudentProgressService(IStudentProgressRepository studentProgressRepository)
    {
        _studentProgressRepository = studentProgressRepository;
    }

    // получение данных всех прогрессов студентов
    public async Task<IEnumerable<StudentProgress>> GetAllStudentProgressAsync()
    {
        return await _studentProgressRepository.GetAllStudentProgresssAsync();
    }

    // получить данные прогресса студента по id
    public async Task<StudentProgress> GetStudentProgressByIdAsync(int id)
    {
        return await _studentProgressRepository.GetStudentProgressByIdAsync(id);
    }

    // получить данные прогресса студента по id студента
    public async Task<List<StudentProgress>> GetStudentProgressByStudentIdAsync(int studentId)
    {
        return await _studentProgressRepository.GetStudentProgressByStudentIdAsync(studentId);
    }

    // создание нового прогресса студента
    public async Task AddStudentProgressAsync(StudentProgress studentProgress)
    {
        await _studentProgressRepository.AddStudentProgressAsync(studentProgress);
    }

    // изменение данных прогресса студента
    public async Task UpdateStudentProgressAsync(StudentProgress studentProgress)
    {
        await _studentProgressRepository.UpdateStudentProgressAsync(studentProgress);
    }

    // удаление прогресса студента по id
    public async Task DeleteStudentProgressAsync(int id)
    {
        await _studentProgressRepository.DeleteStudentProgressAsync(id);
    }
}