using System.ComponentModel;
namespace Driving_School_API.Models.Filters;

public class AccountFilterDto {
    public string Login { get; set; } = string.Empty;
    public int? UserType { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int? CityId { get; set; }
    public int? DrivingSchoolId { get; set; }

    [DefaultValue(1)]
    public int Page { get; set; } = 1;

    [DefaultValue(10)]
    public int PageSize { get; set; } = 10;
}