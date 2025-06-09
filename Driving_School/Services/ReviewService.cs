using Driving_School_API.Models.Review;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<IEnumerable<Review>> GetAllReviewsAsync()
    {
        return await _reviewRepository.GetAllReviewsAsync();
    }

    public async Task<Review> GetReviewByIdAsync(int id)
    {
        return await _reviewRepository.GetReviewByIdAsync(id);
    }

    public async Task<IEnumerable<Review>> GetReviewsToInstructorAsync(int instructorId)
    {
        return await _reviewRepository.GetReviewsToInstructorAsync(instructorId);
    }

    public async Task<IEnumerable<Review>> GetReviewsToStudentAsync(int studentId)
    {
        return await _reviewRepository.GetReviewsToStudentAsync(studentId);
    }

    public async Task<IEnumerable<Review>> GetReviewsFromStudentAsync(int studentId)
    {
        return await _reviewRepository.GetReviewsFromStudentAsync(studentId);
    }

    public async Task<IEnumerable<Review>> GetReviewsFromInstructorAsync(int instructorId)
    {
        return await _reviewRepository.GetReviewsFromInstructorAsync(instructorId);
    }

    public async Task AddReviewAsync(Review review)
    {
        await _reviewRepository.AddReviewAsync(review);
    }

    public async Task DeleteReviewAsync(int id)
    {
        await _reviewRepository.DeleteReviewAsync(id);
    }
}