using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class StudentProgressDto
{
    [Required(ErrorMessage = "ID студента не указан")]
    [DefaultValue(0)]
    public int Student_ID { get; set; }

    [Required(ErrorMessage = "ID вопроса не указан")]
    [DefaultValue(0)]
    public int Question_ID { get; set; }

    [Required(ErrorMessage = "Правильность ответа не указана")]
    [DefaultValue(false)]
    public bool IsCorrect { get; set; }
}