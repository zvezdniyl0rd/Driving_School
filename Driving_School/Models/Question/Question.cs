using System.Text.Json.Serialization;

namespace Driving_School_API.Models.Question;

public class Question
{
    public int Id { get; set; }
    public int Topic_ID { get; set; }
    public string QuestionText { get; set; }
    public bool IsMultipleChoice { get; set; }
    public List<Answer> Answers { get; set; } = new List<Answer>();
}

public class Answer
{
    public int Id { get; set; }
    public int Question_ID { get; set; }
    public string AnswerText { get; set; }
    public bool IsCorrect { get; set; }
}