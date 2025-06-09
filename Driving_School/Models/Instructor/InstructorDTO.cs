using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class InstructorDto {
    [Required(ErrorMessage = "Фамилия не указана")]
    [MaxLength(50, ErrorMessage = "Фамилия не должна превышать 50 символов")]
    public string Surname { get; set; }

    [Required(ErrorMessage = "Имя не указано")]
    [MaxLength(50, ErrorMessage = "Имя не должно превышать 50 символов")]
    public string Name { get; set; }

    [MaxLength(50, ErrorMessage = "Отчество не должно превышать 50 символов")]
    public string? Patronymic { get; set; }

    [Required(ErrorMessage = "Номер телефона не указан")]
    [Phone(ErrorMessage = "Некорректный формат номера телефона")]
    [MinLength(11, ErrorMessage = "Номер телефона не должен быть меньше 11 символов")]
    [MaxLength(12, ErrorMessage = "Номер телефона не должен превышать 12 символов")]
    [DefaultValue(89001002030)]
    public string PhoneNumber { get; set; }

    [Required(ErrorMessage = "E-Mail не указан")]
    [EmailAddress(ErrorMessage = "Некорректный формат email")]
    [MaxLength(100, ErrorMessage = "Email не должен превышать 100 символов")]
    public string Email { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID автошколы не может быть < 1")]
    [Required(ErrorMessage = "ID автошколы не указан")]
    [DefaultValue(0)]
    public int DrivingSchool_ID { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID автомобиля не может быть < 1")]
    [Required(ErrorMessage = "ID автомобиля не указан")]
    [DefaultValue(0)]
    public int Car_ID { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ID вложения не может быть < 1")]
    public int? Attachment_ID { get; set; }
}

public class InstructorFilterDto {
    public string Surname { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Patronymic { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public int? DrivingSchool_ID { get; set; }
    public int? City_ID { get; set; }

    [DefaultValue(1)]
    public int Page { get; set; } = 1;

    [DefaultValue(10)]
    public int PageSize { get; set; } = 10;
}