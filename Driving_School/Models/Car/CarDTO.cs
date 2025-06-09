using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class CarDto
{
    [Required(ErrorMessage = "Марка авто не указана")]
    [MaxLength(50, ErrorMessage = "Марка авто не должна превышать 50 символов")]
    public string Brand { get; set; }

    [Required(ErrorMessage = "Модель авто не указана")]
    [MaxLength(50, ErrorMessage = "Модель авто не должна превышать 50 символов")]
    public string Model { get; set; }

    [Required(ErrorMessage = "Цвет не указан")]
    [MaxLength(50, ErrorMessage = "Цвет не должен превышать 50 символов")]
    public string Color { get; set; }

    [Required(ErrorMessage = "Регистрационный номер не указан")]
    [RegularExpression(@"^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$",
    ErrorMessage = "Некорректный формат номера автомобиля")]
    [DefaultValue("А001АА77")]
    public string Car_Number { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID вложения не может быть < 1")]
    public int? Attachment_ID { get; set; }
}