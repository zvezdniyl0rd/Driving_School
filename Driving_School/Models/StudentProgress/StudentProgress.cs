namespace Driving_School_API.Models.StudentProgress;

public class StudentProgress
{
    public int Id { get; set; }
    public int Student_ID { get; set; }
    public int Question_ID { get; set; }
    public bool IsCorrect { get; set; }
}