using Driving_School_API.Models.Schedule;
using Microsoft.EntityFrameworkCore;

    public class ScheduleRepository : IScheduleRepository
    {
        private readonly ApplicationDbContext _context;

        public ScheduleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // получение данных всех расписаний
        public async Task<IEnumerable<Schedule>> GetAllSchedulesAsync()
        {
            return await _context.Schedule.ToListAsync();
        }

        // получение данных расписания по id
        public async Task<Schedule> GetScheduleByIdAsync(int id)
        {
            return await _context.Schedule.FindAsync(id);
        }

        // получение занятий по id инструктора
        public async Task<List<Schedule>> GetScheduleByInstructorIdAsync(int instructor_id)
        {
            return await _context.Schedule.Where(s => s.Instructor_ID == instructor_id).ToListAsync(); ;
        }

        // получение занятий по id студента
        public async Task<List<Schedule>> GetScheduleByStudentIdAsync(int student_id)
        {
            return await _context.Schedule.Where(s => s.Student_ID == student_id).ToListAsync(); ;
        }

        // добавление нового расписания
        public async Task AddScheduleAsync(Schedule schedule)
        {
            await _context.Schedule.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        // изменение данных расписания
        public async Task UpdateScheduleAsync(Schedule schedule)
        {
            _context.Schedule.Update(schedule);
            await _context.SaveChangesAsync();
        }

        // удаление расписания по id
        public async Task DeleteScheduleAsync(int id)
        {
            var schedule = await _context.Schedule.FindAsync(id);
            if (schedule == null)
            {
                throw new KeyNotFoundException("Студент с указанным ID не найден.");
            }

            _context.Schedule.Remove(schedule);
            await _context.SaveChangesAsync();
        }
    }