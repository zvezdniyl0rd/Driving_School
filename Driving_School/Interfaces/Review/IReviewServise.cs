using Driving_School_API.Models.Review;

public interface IReviewService
{
    Task<IEnumerable<Review>> GetAllReviewsAsync(); // получение данных всех отзывов
    Task<Review> GetReviewByIdAsync(int id); // получение данных отзыва по id
    Task<IEnumerable<Review>> GetReviewsToInstructorAsync(int instructorId); // получение всех отзывов, адресованных конкретному инструктору
    Task<IEnumerable<Review>> GetReviewsToStudentAsync(int studentId); // получение всех отзывов, адресованных конкретному студенту
    Task<IEnumerable<Review>> GetReviewsFromStudentAsync(int studentId); // получение всех отзывов, оставленных конкретным студентом
    Task<IEnumerable<Review>> GetReviewsFromInstructorAsync(int instructorId); // получение всех отзывов, оставленных конкретным инструктором
    Task AddReviewAsync(Review review); // добавление нового отзыва
    Task DeleteReviewAsync(int id); // удаление отзыва по id
}