using Driving_School_API.Models.Schedule;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DrivingSchoolApi.Tests.Services
{
    public class ScheduleServiceTests
    {
        private readonly Mock<IScheduleRepository> _mockScheduleRepository;
        private readonly ScheduleService _scheduleService;

        public ScheduleServiceTests()
        {
            _mockScheduleRepository = new Mock<IScheduleRepository>();
            _scheduleService = new ScheduleService(_mockScheduleRepository.Object);
        }

        // Получение всех расписаний
        [Fact]
        public async Task GetAllSchedulesAsync_CallsRepository_ReturnsSchedules()
        {
            // Создание списка расписаний с тестовыми данными
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1 },
                new Schedule { Id = 2, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(11, 0), Instructor_ID = 1 }
            };
            _mockScheduleRepository.Setup(r => r.GetAllSchedulesAsync()).ReturnsAsync(schedules);

            // Выполнение запроса на получение занятий: вызов метода сервиса, который обращается к репозиторию для получения списка всех записей расписания.
            var result = await _scheduleService.GetAllSchedulesAsync();

            // Проверка корректности результата
            // Проверка взаимодействия с репозиторием
            Assert.Equal(schedules, result);
            _mockScheduleRepository.Verify(r => r.GetAllSchedulesAsync(), Times.Once());
        }

        // Получение расписания по существующему ID
        [Fact]
        public async Task GetScheduleByIdAsync_ExistingId_ReturnsSchedule()
        {
            var schedule = new Schedule { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1 };
            _mockScheduleRepository.Setup(r => r.GetScheduleByIdAsync(1)).ReturnsAsync(schedule);

            var result = await _scheduleService.GetScheduleByIdAsync(1);

            Assert.Equal(schedule, result);
            _mockScheduleRepository.Verify(r => r.GetScheduleByIdAsync(1), Times.Once());
        }

        // Получение расписания по несуществующему ID
        [Fact]
        public async Task GetScheduleByIdAsync_NonExistingId_ReturnsNull()
        {
            _mockScheduleRepository.Setup(r => r.GetScheduleByIdAsync(999)).ReturnsAsync((Schedule)null);

            var result = await _scheduleService.GetScheduleByIdAsync(999);

            Assert.Null(result);
            _mockScheduleRepository.Verify(r => r.GetScheduleByIdAsync(999), Times.Once());
        }

        // Получение расписаний по ID инструктора
        [Fact]
        public async Task GetScheduleByInstructorIdAsync_ReturnsFilteredSchedules()
        {
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Instructor_ID = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0) },
                new Schedule { Id = 2, Instructor_ID = 2, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(11, 0) }
            };
            _mockScheduleRepository.Setup(r => r.GetScheduleByInstructorIdAsync(1)).ReturnsAsync(schedules.Where(s => s.Instructor_ID == 1).ToList());

            var result = await _scheduleService.GetScheduleByInstructorIdAsync(1);

            Assert.Single(result);
            Assert.All(result, s => Assert.Equal(1, s.Instructor_ID));
            _mockScheduleRepository.Verify(r => r.GetScheduleByInstructorIdAsync(1), Times.Once());
        }

        // Получение расписаний по ID студента
        [Fact]
        public async Task GetScheduleByStudentIdAsync_ReturnsFilteredSchedules()
        {
            var schedules = new List<Schedule>
            {
                new Schedule { Id = 1, Student_ID = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0) },
                new Schedule { Id = 2, Student_ID = 2, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(11, 0) }
            };
            _mockScheduleRepository.Setup(r => r.GetScheduleByStudentIdAsync(1)).ReturnsAsync(schedules.Where(s => s.Student_ID == 1).ToList());

            var result = await _scheduleService.GetScheduleByStudentIdAsync(1);

            Assert.Single(result);
            Assert.All(result, s => Assert.Equal(1, s.Student_ID));
            _mockScheduleRepository.Verify(r => r.GetScheduleByStudentIdAsync(1), Times.Once());
        }

        // Добавление нового расписания
        [Fact]
        public async Task AddScheduleAsync_CallsRepository()
        {
            var schedule = new Schedule { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1 };
            _mockScheduleRepository.Setup(r => r.AddScheduleAsync(It.IsAny<Schedule>())).Returns(Task.CompletedTask);

            await _scheduleService.AddScheduleAsync(schedule);

            _mockScheduleRepository.Verify(r => r.AddScheduleAsync(schedule), Times.Once());
        }

        // Обработка ошибки базы данных при добавлении расписания
        [Fact]
        public async Task AddScheduleAsync_DbError_ThrowsDbUpdateException()
        {
            var schedule = new Schedule { Id = 1, Instructor_ID = 1 };
            _mockScheduleRepository.Setup(r => r.AddScheduleAsync(It.IsAny<Schedule>())).ThrowsAsync(new DbUpdateException("Database error", new Exception()));

            await Assert.ThrowsAsync<DbUpdateException>(() => _scheduleService.AddScheduleAsync(schedule));
        }

        // Обновление существующего расписания
        [Fact]
        public async Task UpdateScheduleAsync_CallsRepository()
        {
            var schedule = new Schedule { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1 };
            _mockScheduleRepository.Setup(r => r.UpdateScheduleAsync(It.IsAny<Schedule>())).Returns(Task.CompletedTask);

            await _scheduleService.UpdateScheduleAsync(schedule);

            _mockScheduleRepository.Verify(r => r.UpdateScheduleAsync(schedule), Times.Once());
        }

        // Удаление существующего расписания
        [Fact]
        public async Task DeleteScheduleAsync_ExistingId_CallsRepository()
        {
            var schedule = new Schedule { Id = 1, Date = DateOnly.FromDateTime(DateTime.Now), SlotTime = new TimeOnly(10, 0), Instructor_ID = 1 };
            _mockScheduleRepository.Setup(r => r.GetScheduleByIdAsync(1)).ReturnsAsync(schedule);
            _mockScheduleRepository.Setup(r => r.DeleteScheduleAsync(1)).Returns(Task.CompletedTask);

            await _scheduleService.DeleteScheduleAsync(1);

            _mockScheduleRepository.Verify(r => r.DeleteScheduleAsync(1), Times.Once());
        }

        // Обработка ошибки удаления несуществующего расписания
        [Fact]
        public async Task DeleteScheduleAsync_NonExistingId_ThrowsKeyNotFoundException()
        {
            _mockScheduleRepository.Setup(r => r.DeleteScheduleAsync(999)).ThrowsAsync(new KeyNotFoundException());

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _scheduleService.DeleteScheduleAsync(999));
        }
    }
}