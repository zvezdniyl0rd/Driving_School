using System.ComponentModel.DataAnnotations;

namespace Driving_School_API.Models.Car;

public class Car
{
    public int Id { get; set; }
    public string Brand { get; set; }
    public string Model { get; set; }
    public string Color { get; set; }
    public string Car_Number { get; set; }
    public int? Attachment_ID { get; set; }
}