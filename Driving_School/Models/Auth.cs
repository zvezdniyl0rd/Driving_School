using System.ComponentModel.DataAnnotations;
namespace Driving_School_API.Models;

public class Account {
    public int Id { get; set; }
    public int User_Type { get; set; }
    public string Password { get; set; }
    public string Login { get; set; }
    public int? Student_ID { get; set; }
    public int? Instructor_ID { get; set; }
    public int? Admin_ID { get; set; }
}

public class LoginDto {
    [Required(ErrorMessage = "Логин не указан")]
    public string Login { get; set; }

    [Required(ErrorMessage = "Пароль не указан")]
    public string Password { get; set; }
}

public class RegisterInstructorDto {
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public int DrivingSchool_ID { get; set; }
    public string CarBrand { get; set; }
    public string CarModel { get; set; }
    public string CarColor { get; set; }
    public string CarNumber { get; set; }
    public string Password { get; set; }
}

public class RegisterStudentDto {
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public int DrivingSchool_ID { get; set; }
    public DateOnly Birthdate { get; set; }
    public string Password { get; set; }
}

public class RegisterAdminDto {
    public string Surname { get; set; }
    public string Name { get; set; }
    public string? Patronymic { get; set; }
    public string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public int DrivingSchool_ID { get; set; }
    public string Password { get; set; }
}