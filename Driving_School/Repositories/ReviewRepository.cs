using Driving_School_API.Models.Review;
using Microsoft.EntityFrameworkCore;

public class ReviewRepository : IReviewRepository
{
    private readonly ApplicationDbContext _context;

    public ReviewRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Review>> GetAllReviewsAsync()
    {
        return await _context.Review.ToListAsync();
    }

    public async Task<Review> GetReviewByIdAsync(int id)
    {
        return await _context.Review.FindAsync(id);
    }

    public async Task<IEnumerable<Review>> GetReviewsToInstructorAsync(int instructorId)
    {
        return await _context.Review
            .Where(r => r.Instructor_ID == instructorId && r.Type_ID == 1)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsToStudentAsync(int studentId)
    {
        return await _context.Review
            .Where(r => r.Student_ID == studentId && r.Type_ID == 2)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsFromStudentAsync(int studentId)
    {
        return await _context.Review
            .Where(r => r.Student_ID == studentId && r.Type_ID == 1)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsFromInstructorAsync(int instructorId)
    {
        return await _context.Review
            .Where(r => r.Instructor_ID == instructorId && r.Type_ID == 2)
            .ToListAsync();
    }

    public async Task AddReviewAsync(Review review)
    {
        var studentExists = await _context.Student.AnyAsync(s => s.Id == review.Student_ID);
        if (!studentExists)
            throw new ArgumentException($"Студент с ID {review.Student_ID} не найден");

        var instructorExists = await _context.Instructor.AnyAsync(i => i.Id == review.Instructor_ID);
        if (!instructorExists)
            throw new ArgumentException($"Инструктор с ID {review.Instructor_ID} не найден");

        await _context.Review.AddAsync(review);
        await _context.SaveChangesAsync();

        // После добавления отзыва — пересчёт рейтинга
        if (review.Type_ID == 1) // Отзыв от студента инструктору
        {
            var instructorReviews = await _context.Review
                .Where(r => r.Instructor_ID == review.Instructor_ID && r.Type_ID == 1)
                .ToListAsync();

            double averageRating = instructorReviews.Any() ? instructorReviews.Average(r => r.Mark) : 0;

            var instructor = await _context.Instructor.FindAsync(review.Instructor_ID);
            if (instructor != null)
            {
                instructor.Rating = averageRating;
            }
        }
        else if (review.Type_ID == 2) // Отзыв от инструктора студенту
        {
            var studentReviews = await _context.Review
                .Where(r => r.Student_ID == review.Student_ID && r.Type_ID == 2)
                .ToListAsync();

            double averageRating = studentReviews.Any() ? studentReviews.Average(r => r.Mark) : 0;

            var student = await _context.Student.FindAsync(review.Student_ID);
            if (student != null)
            {
                student.Rating = averageRating;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteReviewAsync(int id)
    {
        var review = await _context.Review.FindAsync(id);
        if (review == null)
        {
            throw new KeyNotFoundException("Отзыв с указанным ID не найден.");
        }

        _context.Review.Remove(review);
        await _context.SaveChangesAsync();
    }
}