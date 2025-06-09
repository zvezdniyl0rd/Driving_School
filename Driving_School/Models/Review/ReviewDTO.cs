using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

[CustomValidation(typeof(ReviewDto), nameof(ValidateReviewTargets))]
public class ReviewDto
{
    [Range(1, int.MaxValue, ErrorMessage = "ID студента не может быть < 1")]
    [DefaultValue(0)]
    public int Student_ID { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID инструктора не может быть < 1")]
    [DefaultValue(0)]
    public int Instructor_ID { get; set; }

    [Range(1, 2, ErrorMessage = "ID типа отзыва допускает значение 1 (от студента инструктору) или 2 (от инструктора студенту)")]
    [DefaultValue(1)]
    public int Type_ID { get; set; }

    [Range(1, 5, ErrorMessage = "Оценка должна быть от 1 до 5")]
    [Required(ErrorMessage = "Оценка не указана")]
    [DefaultValue(0)]
    public int Mark { get; set; }

    public string? Text { get; set; }

    // Валидация данных    
    public static ValidationResult ValidateReviewTargets(object reviewObj, ValidationContext context)
    {
        if (reviewObj == null)
        {
            return ValidationResult.Success;
        }

        var reviewDto = reviewObj as ReviewDto;
        if (reviewDto == null)
        {
            return new ValidationResult("Некорректный формат данных.");
        }

        return ValidationResult.Success;
    }
}