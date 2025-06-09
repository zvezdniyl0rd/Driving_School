namespace Driving_School_API.Models.Review;

public class Review
{
    public int Id { get; set; }
    public int Student_ID { get; set; }
    public int Instructor_ID { get; set; }
    public int Type_ID { get; set; }
    public int Mark { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }
}
