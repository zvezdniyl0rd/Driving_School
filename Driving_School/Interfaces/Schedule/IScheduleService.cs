using Driving_School_API.Models.Schedule;

public interface IScheduleService
{
    Task<IEnumerable<Schedule>> GetAllSchedulesAsync(); // получение данных всех расписаний
    Task<Schedule> GetScheduleByIdAsync(int id); // получение данных расписания по id
    Task<List<Schedule>> GetScheduleByInstructorIdAsync(int instructor_id); // получение занятий по id инструктора
    Task<List<Schedule>> GetScheduleByStudentIdAsync(int student_id); // получение занятий по id студента
    Task AddScheduleAsync(Schedule schedule); // добавление нового расписания
    Task UpdateScheduleAsync(Schedule schedule); // изменение данных расписания
    Task DeleteScheduleAsync(int id); // удаление расписания по id
}