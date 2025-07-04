﻿using Driving_School_API.Models.Student;

public interface IStudentService
{
    Task<IEnumerable<Student>> GetAllStudentsAsync(); // получение данных всех студентов
    Task<Student> GetStudentByIdAsync(int id); // получение данных студента по id
    Task AddStudentAsync(Student student); // добавление нового студента
    Task UpdateStudentAsync(Student student); // изменение данных студента
    Task DeleteStudentAsync(int id); // удаление студента по id
    Task<(IEnumerable<Student> Data, int TotalCount, int TotalPages)> GetFilteredStudentsAsync(StudentFilterDto filter); // фильтрация и пагинация
}