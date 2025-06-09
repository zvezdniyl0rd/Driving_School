using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Driving_School_API.Models.Question;

public class QuestionDto
{
    [Range(1, int.MaxValue, ErrorMessage = "ID темы не может быть < 1")]
    [Required(ErrorMessage = "ID темы не указан")]
    public int Topic_ID { get; set; }

    [Required(ErrorMessage = "Текст вопроса не указан")]
    public string QuestionText { get; set; }

    [Required(ErrorMessage = "Ответы не указаны")]
    public List<Answer> Answers { get; set; } = new List<Answer>();

    [Required(ErrorMessage = "Не указан флаг нескольких ответов")]
    public bool IsMultipleChoice { get; set; }
}

public class QuestionGetDto
{
    public int Id { get; set; }
    public int Topic_ID { get; set; }
    public string QuestionText { get; set; }
    public List<Answer> Answers { get; set; } = new List<Answer>();
    public bool IsMultipleChoice { get; set; }
}