using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class ScheduleDto
{
    [Required(ErrorMessage = "Дата не указана")]
    [DataType(DataType.Date, ErrorMessage = "Некорректный формат даты")]
    public DateOnly Date { get; set; }

    [Required(ErrorMessage = "Время не указано")]
    [DataType(DataType.Time, ErrorMessage = "Некорректный формат времени")]
    [CustomValidation(typeof(ScheduleDto), nameof(ValidateSlotTime))]
    [DefaultValue("08:00")]
    public TimeOnly SlotTime { get; set; }

    [Required(ErrorMessage = "Доступность слота не указана")]
    [DefaultValue(true)]
    public bool IsAvailable { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID инструктора не может быть < 1")]
    [Required(ErrorMessage = "ID инструктора не указан")]
    [DefaultValue(0)]
    public int Instructor_ID { get; set; }

    [DefaultValue("null")]
    public int? Student_ID { get; set; }

    public DateTime CreatedAt { get; private set; }

    // Метод для проверки корректности времени (время должно быть в интервале 08:00–20:00)
    public static ValidationResult? ValidateSlotTime(TimeOnly slotTime, ValidationContext context)
    {
        var start = new TimeOnly(8, 0); // 08:00
        var end = new TimeOnly(20, 0); // 20:00

        if (slotTime < start || slotTime > end)
        {
            return new ValidationResult("Время должно быть в промежутке с 08:00 до 20:00");
        }

        return ValidationResult.Success;
    }
}

public class ScheduleEditDto
{    
    [Required(ErrorMessage = "Доступность слота не указана")]
    [DefaultValue(true)]
    public bool IsAvailable { get; set; }

    [DefaultValue("null")]
    public int? Student_ID { get; set; }
}