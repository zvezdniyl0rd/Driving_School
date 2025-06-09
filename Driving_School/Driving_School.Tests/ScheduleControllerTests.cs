using Xunit;
using Moq;
using FluentAssertions;
using Driving_School_API.Models.Schedule;
using Microsoft.AspNetCore.Mvc;
using Xunit.Abstractions;

namespace DrivingSchoolApi.Tests.Controller
{
    public class ScheduleControllerTests
    {
        private readonly Mock<IScheduleService> _mockService;
        private readonly SchedulesController _controller;
        private readonly ITestOutputHelper _output;

        private readonly Dictionary<int, Schedule> _fakeDb = new();
        private int ID = 1;

        public ScheduleControllerTests(ITestOutputHelper output)
        {
            _mockService = new Mock<IScheduleService>();
            _controller = new SchedulesController(_mockService.Object);
            _output = output;

            SetupMocks();
        }

        private void SetupMocks()
        {
            _mockService.Setup(s => s.GetScheduleByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((int id) =>
                {
                    _fakeDb.TryGetValue(id, out var schedule);
                    return schedule;
                });

            _mockService.Setup(s => s.AddScheduleAsync(It.IsAny<Schedule>()))
                .Callback<Schedule>(s =>
                {
                    s.Id = ID++;
                    s.CreatedAt = DateTime.Now;
                    _fakeDb[s.Id] = s;
                })
                .Returns(Task.CompletedTask);

            _mockService.Setup(s => s.UpdateScheduleAsync(It.IsAny<Schedule>()))
                .Callback<Schedule>(s =>
                {
                    _fakeDb[s.Id] = s;
                })
                .Returns(Task.CompletedTask);

            _mockService.Setup(s => s.DeleteScheduleAsync(It.IsAny<int>()))
                .Callback<int>(id =>
                {
                    _fakeDb.Remove(id);
                })
                .Returns(Task.CompletedTask);
        }

        private ScheduleDto CreateScheduleDto()
        {
            return new ScheduleDto
            {
                Date = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                SlotTime = new TimeOnly(9, 0),
                IsAvailable = true,
                Instructor_ID = 1,
                Student_ID = null
            };
        }

        private Schedule AddFakeSchedule(int? studentId, bool isAvailable)
        {
            var schedule = new Schedule
            {
                Id = ID,
                Date = DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                SlotTime = new TimeOnly(11, 0),
                Instructor_ID = 1,
                Student_ID = studentId,
                IsAvailable = isAvailable,
                CreatedAt = DateTime.Now
            };
            _fakeDb[ID] = schedule;
            return schedule;
        }

        [Fact]
        public async Task CreateSchedule()
        {
            var dto = CreateScheduleDto();
            var result = await _controller.AddSchedule(dto);

            result.Should().BeOfType<CreatedAtActionResult>();
            var created = (result as CreatedAtActionResult)!.Value as Schedule;
            created.Should().NotBeNull();

            _fakeDb.Should().ContainKey(created!.Id);
            _fakeDb[created.Id].Instructor_ID.Should().Be(1);

            _output.WriteLine($"Занятие создано\nID занятия: {created.Id},\nID инструктора: {created.Instructor_ID}");
        }

        [Fact]
        public async Task UpdateSchedule_AddStudentId()
        {
            AddFakeSchedule(studentId: null, isAvailable: true);

            var dto = new ScheduleEditDto
            {
                Student_ID = 99,
                IsAvailable = false
            };

            var result = await _controller.UpdateSchedule(ID, dto);

            result.Should().BeOfType<OkObjectResult>();
            _fakeDb[ID].Student_ID.Should().Be(99);
            _fakeDb[ID].IsAvailable.Should().BeFalse();

            _output.WriteLine($"Студент записался на занятие\nID студента: {_fakeDb[ID].Student_ID},\nСвободно: {_fakeDb[ID].IsAvailable}");
        }

        [Fact]
        public async Task CancelScheduleByStudent()
        {
            AddFakeSchedule(studentId: 55, isAvailable: false);

            var cancelDto = new ScheduleEditDto
            {
                Student_ID = null,
                IsAvailable = true
            };

            var result = await _controller.UpdateSchedule(ID, cancelDto);

            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();
            var updated = ok!.Value as Schedule;

            _fakeDb[ID].Student_ID.Should().BeNull();
            _fakeDb[ID].IsAvailable.Should().BeTrue();

            _output.WriteLine($"Студент отменил запись\nID студента: {updated.Student_ID},\nСвободно: {updated.IsAvailable}");
        }

        [Fact]
        public async Task DeleteSchedule()
        {
            AddFakeSchedule(studentId: null, isAvailable: true);

            var result = await _controller.DeleteSchedule(ID);

            result.Should().BeOfType<NoContentResult>();
            _fakeDb.Should().NotContainKey(ID);

            _output.WriteLine($"Удалено занятие с ID: {ID}");
        }

        [Fact]
        public async Task FullLifecycle()
        {
            // Создание
            var dto = CreateScheduleDto();
            var createResult = await _controller.AddSchedule(dto);
            var created = (createResult as CreatedAtActionResult)!.Value as Schedule;

            created.Should().NotBeNull();
            var scheduleId = created!.Id;
            _output.WriteLine($"Создано занятие с ID: {scheduleId}\n");

            // Запись
            var editDto = new ScheduleEditDto
            {
                Student_ID = 123,
                IsAvailable = false
            };
            var updateResult = await _controller.UpdateSchedule(scheduleId, editDto);
            var updated = (updateResult as OkObjectResult)!.Value as Schedule;

            updated!.Student_ID.Should().Be(123);
            _output.WriteLine($"Студент записался\nID занятия: {updated.Id},\nID студента: {updated.Student_ID},\nСвободно: {updated.IsAvailable}\n");

            // Отмена записи
            editDto = new ScheduleEditDto
            {
                Student_ID = null,
                IsAvailable = true
            };
            updateResult = await _controller.UpdateSchedule(scheduleId, editDto);
            updated = (updateResult as OkObjectResult)!.Value as Schedule;

            updated!.Student_ID.Should().Be(null);
            _output.WriteLine($"Студент отменил запись\nID занятия: {updated.Id},\nID студента: {updated.Student_ID},\nСвободно: {updated.IsAvailable}\n");

            // Удаление
            var deleteResult = await _controller.DeleteSchedule(scheduleId);
            deleteResult.Should().BeOfType<NoContentResult>();
            _fakeDb.Should().NotContainKey(scheduleId);

            _output.WriteLine($"Занятие с ID {scheduleId} удалено.");
        }
    }
}