using Driving_School_API.Models.Schedule;

public class ScheduleService : IScheduleService
{
    private readonly IScheduleRepository _scheduleRepository;

    public ScheduleService(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    // получение данных всех расписаний
    public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync()
    {
        return await _scheduleRepository.GetAllSchedulesAsync();
    }

    // получить данные расписания по id
    public async Task<Schedule> GetScheduleByIdAsync(int id)
    {
        return await _scheduleRepository.GetScheduleByIdAsync(id);
    }

    // получить записи по id инструктора
    public async Task<List<Schedule>> GetScheduleByInstructorIdAsync(int instructor_id)
    {
        return await _scheduleRepository.GetScheduleByInstructorIdAsync(instructor_id);
    }

    // получить записи по id студента
    public async Task<List<Schedule>> GetScheduleByStudentIdAsync(int student_id)
    {
        return await _scheduleRepository.GetScheduleByStudentIdAsync(student_id);
    }

    // создание нового расписания
    public async Task AddScheduleAsync(Schedule schedule)
    {
        await _scheduleRepository.AddScheduleAsync(schedule);
    }

    // изменение данных расписания
    public async Task UpdateScheduleAsync(Schedule schedule)
    {
        await _scheduleRepository.UpdateScheduleAsync(schedule);
    }

    // удаление расписания по id
    public async Task DeleteScheduleAsync(int id)
    {
        await _scheduleRepository.DeleteScheduleAsync(id);
    }
}