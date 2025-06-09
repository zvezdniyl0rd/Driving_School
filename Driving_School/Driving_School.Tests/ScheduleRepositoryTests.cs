using Driving_School_API.Models.Schedule;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DrivingSchoolApi.Tests.Repositories
{
    public class ScheduleRepositoryTests
    {
        private readonly ApplicationDbContext _context;
        private readonly ScheduleRepository _repository;

        public ScheduleRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _repository = new ScheduleRepository(_context);
        }

        // Получение всех расписаний
        [Fact]
        public async Task GetAllSchedulesAsync_ReturnsAllSchedules()
        {
            // Подготовка тестового окружения
            // Добавление данных в In-Memory Database и сохранение изменений (имитация реальной БД)
            var now = DateTime.Now;
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1, CreatedAt = now },
                new Schedule { Id = 2, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(11, 0), Instructor_ID = 1, CreatedAt = now }
            };
            await _context.Schedule.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();

            // Выполнение запроса на получение всех занятий
            var result = await _repository.GetAllSchedulesAsync();

            // Проверка корректности результата
            Assert.Equal(2, result.Count());
            Assert.Contains(result, s => s.Id == 1);
            Assert.Contains(result, s => s.Id == 2);
        }

        // Получение расписания по существующему ID
        [Fact]
        public async Task GetScheduleByIdAsync_ExistingId_ReturnsSchedule()
        {
            var now = DateTime.Now;
            var schedule = new Schedule { Id = 1, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1, CreatedAt = now };
            await _context.Schedule.AddAsync(schedule);
            await _context.SaveChangesAsync();

            var result = await _repository.GetScheduleByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(now, result.CreatedAt, TimeSpan.FromSeconds(1));
        }

        // Получение расписания по несуществующему ID
        [Fact]
        public async Task GetScheduleByIdAsync_NonExistingId_ReturnsNull()
        {
            var result = await _repository.GetScheduleByIdAsync(999);

            Assert.Null(result);
        }

        // Получение расписаний по ID инструктора
        [Fact]
        public async Task GetScheduleByInstructorIdAsync_ReturnsFilteredSchedules()
        {
            var now = DateTime.Now;
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Instructor_ID = 1, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(10, 0), CreatedAt = now },
                new Schedule { Id = 2, Instructor_ID = 2, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(11, 0), CreatedAt = now }
            };
            await _context.Schedule.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();

            var result = await _repository.GetScheduleByInstructorIdAsync(1);

            Assert.Single(result);
            Assert.All(result, s => Assert.Equal(1, s.Instructor_ID));
        }

        // Получение расписаний по ID студента
        [Fact]
        public async Task GetScheduleByStudentIdAsync_ReturnsFilteredSchedules()
        {
            var now = DateTime.Now;
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Student_ID = 1, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(10, 0), CreatedAt = now },
                new Schedule { Id = 2, Student_ID = 2, Date = DateOnly.FromDateTime(now), SlotTime = new TimeOnly(11, 0), CreatedAt = now }
            };
            await _context.Schedule.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();

            var result = await _repository.GetScheduleByStudentIdAsync(1);

            Assert.Single(result);
            Assert.All(result, s => Assert.Equal(1, s.Student_ID));
        }

        // Добавление нового расписания
        [Fact]
        public async Task AddScheduleAsync_AddsScheduleWithCreatedAt()
        {
            var now = DateTime.Now;
            var schedule = new Schedule
            {
                Id = 1,
                Date = DateOnly.FromDateTime(now),
                SlotTime = new TimeOnly(10, 0),
                Instructor_ID = 1,
                CreatedAt = now
            };

            await _repository.AddScheduleAsync(schedule);
            var result = await _context.Schedule.FindAsync(1);

            Assert.NotNull(result);
            Assert.Equal(schedule.Id, result.Id);
            Assert.Equal(schedule.Date, result.Date);
            Assert.Equal(schedule.SlotTime, result.SlotTime);
            Assert.Equal(schedule.CreatedAt, result.CreatedAt, TimeSpan.FromSeconds(1));
        }

        // Обновление существующего расписания
        [Fact]
        public async Task UpdateScheduleAsync_UpdatesSchedule()
        {
            var now = DateTime.Now;
            var schedule = new Schedule
            {
                Id = 1,
                Date = DateOnly.FromDateTime(now),
                SlotTime = new TimeOnly(10, 0),
                Instructor_ID = 1,
                IsAvailable = true,
                CreatedAt = now
            };
            await _context.Schedule.AddAsync(schedule);
            await _context.SaveChangesAsync();

            schedule.IsAvailable = false;
            schedule.Student_ID = 2;

            await _repository.UpdateScheduleAsync(schedule);
            var result = await _context.Schedule.FindAsync(1);

            Assert.False(result.IsAvailable);
            Assert.Equal(2, result.Student_ID);
            Assert.Equal(now, result.CreatedAt, TimeSpan.FromSeconds(1));
        }

        // Удаление существующего расписания
        [Fact]
        public async Task DeleteScheduleAsync_ExistingId_DeletesSchedule()
        {
            var now = DateTime.Now;
            var schedule = new Schedule
            {
                Id = 1,
                Date = DateOnly.FromDateTime(now),
                SlotTime = new TimeOnly(10, 0),
                Instructor_ID = 1,
                CreatedAt = now
            };
            await _context.Schedule.AddAsync(schedule);
            await _context.SaveChangesAsync();

            await _repository.DeleteScheduleAsync(1);
            var result = await _context.Schedule.FindAsync(1);

            Assert.Null(result);
        }

        // Обработка ошибки удаления несуществующего расписания
        [Fact]
        public async Task DeleteScheduleAsync_NonExistingId_ThrowsKeyNotFoundException()
        {
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _repository.DeleteScheduleAsync(999));
        }
    }
}