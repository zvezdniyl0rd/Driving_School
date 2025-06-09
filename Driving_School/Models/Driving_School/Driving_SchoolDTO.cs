using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


public class Driving_SchoolDto
{
    [Required(ErrorMessage = "Адрес автошколы не указан")]
    [MaxLength(100, ErrorMessage = "Адрес не должен превышать 100 символов")]
    public string Address { get; set; }

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

    [Required(ErrorMessage = "Id города не указан")]
    public int City_ID { get; set; }
}

public class Driving_SchoolFilterDto
{
    public string Address { get; set; } = string.Empty;
    public int? CityId { get; set; }

    [DefaultValue(1)]
    public int Page { get; set; } = 1;

    [DefaultValue(10)]
    public int PageSize { get; set; } = 10;
}