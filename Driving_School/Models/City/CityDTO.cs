using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class CityDto
{
    [Required(ErrorMessage = "Название города не указано")]
    public string Name { get; set; }
}