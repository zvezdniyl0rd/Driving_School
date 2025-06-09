namespace Driving_School_API.Models.Student;

public class Student
{
    public int Id { get; set; }
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public int DrivingSchool_ID { get; set; }
    public double Rating { get; set; }
    public DateOnly Birthdate { get; set; }
    public int? Attachment_ID { get; set; }
}