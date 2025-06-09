using Driving_School_API.Models.StudentProgress;

public interface IStudentProgressRepository
{
    Task<IEnumerable<StudentProgress>> GetAllStudentProgresssAsync(); // получение данных всех прогрессов студентов
    Task<StudentProgress> GetStudentProgressByIdAsync(int id); // получение данных прогресса студента по id
    Task<List<StudentProgress>> GetStudentProgressByStudentIdAsync(int studentId); // получение данных прогресса студента по id студента
    Task AddStudentProgressAsync(StudentProgress studentProgress); // добавление нового прогресса студента
    Task UpdateStudentProgressAsync(StudentProgress studentProgress); // изменение данных прогресса студента
    Task DeleteStudentProgressAsync(int id); // удаление прогресса студента по id
}