namespace Driving_School_API.Models.Schedule;

public record class Schedule
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly SlotTime { get; set; }
    public bool IsAvailable { get; set; }
    public int Instructor_ID { get; set; }
    public int? Student_ID { get; set; }
    public DateTime CreatedAt { get; set; }
}