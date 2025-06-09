using Driving_School_API.Models.Review;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// Получает список всех отзывов.
    /// </summary>
    /// <returns>Список отзывов.</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllReviews()
    {
        try
        {
            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Получает отзыв по ID.
    /// </summary>
    /// <param name="id">ID отзыва.</param>
    /// <returns>Отзыв с указанным ID.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReviewById(int id)
    {
        var review = await _reviewService.GetReviewByIdAsync(id);
        if (review == null)
        {
            return NotFound(new { Message = $"Отзыв с id {id} не найден" });
        }

        return Ok(review);
    }

    /// <summary>
    /// Получает все отзывы, адресованные конкретному инструктору.
    /// </summary>
    /// <param name="instructorId">ID инструктора.</param>
    /// <returns>Список отзывов.</returns>
    [HttpGet("to-instructor/{instructorId}")]
    public async Task<IActionResult> GetReviewsToInstructor(int instructorId)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsToInstructorAsync(instructorId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Получает все отзывы, адресованные конкретному студенту.
    /// </summary>
    /// <param name="studentId">ID студента.</param>
    /// <returns>Список отзывов.</returns>
    [HttpGet("to-student/{studentId}")]
    public async Task<IActionResult> GetReviewsToStudent(int studentId)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsToStudentAsync(studentId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Получает все отзывы, оставленные конкретным студентом.
    /// </summary>
    /// <param name="studentId">ID студента.</param>
    /// <returns>Список отзывов.</returns>
    [HttpGet("from-student/{studentId}")]
    public async Task<IActionResult> GetReviewsFromStudent(int studentId)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsFromStudentAsync(studentId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Получает все отзывы, оставленные конкретным инструктором.
    /// </summary>
    /// <param name="instructorId">ID инструктора.</param>
    /// <returns>Список отзывов.</returns>
    [HttpGet("from-instructor/{instructorId}")]
    public async Task<IActionResult> GetReviewsFromInstructor(int instructorId)
    {
        try
        {
            var reviews = await _reviewService.GetReviewsFromInstructorAsync(instructorId);
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Добавляет новый отзыв.
    /// </summary>
    /// <param name="reviewDto">Данные отзыва.</param>
    /// <returns>Созданный отзыв.</returns>
    [HttpPost("/review")]
    public async Task<IActionResult> AddReview([FromBody] ReviewDto reviewDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var review = new Review
        {
            Student_ID = reviewDto.Student_ID,
            Instructor_ID = reviewDto.Instructor_ID,
            Type_ID = reviewDto.Type_ID,
            Mark = reviewDto.Mark,
            Text = reviewDto.Text,
            CreatedAt = DateTime.Now
        };

        try
        {
            await _reviewService.AddReviewAsync(review);
            return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, review);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new { Message = "Ошибка целостности данных: проверьте корректность введённых данных", Details = dbEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    /// <summary>
    /// Удаляет отзыв по ID.
    /// </summary>
    /// <param name="id">ID отзыва.</param>
    /// <returns>Статус операции.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        try
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound(new { Message = "Отзыв не найден" });
            }

            await _reviewService.DeleteReviewAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении отзыва: {ex.Message}" });
        }
    }
}


