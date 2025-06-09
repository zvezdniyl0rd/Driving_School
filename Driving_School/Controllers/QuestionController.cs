using Driving_School_API.Models.Question;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[ApiController]
[Route("/questions")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllQuestions()
    {
        try
        {
            // Получаем все вопросы из сервиса
            var questions = await _questionService.GetAllQuestionsAsync();

            // Формируем DTO с десериализацией JSON-строк
            var questionsDto = questions.Select(question => new QuestionGetDto
            {
                Id = question.Id,
                Topic_ID = question.Topic_ID,
                QuestionText = question.QuestionText,
                Answers = question.Answers,
                IsMultipleChoice = question.IsMultipleChoice
            }).ToList();

            return Ok(questionsDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "Произошла ошибка на сервере",
                Details = ex.Message
            });
        }
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuestionById(int id)
    {
        var question = await _questionService.GetQuestionByIdAsync(id);
        if (question == null)
        {
            return NotFound(new { Message = $"Вопрос с Id {id} не найден" });
        }

        var questionDto = new QuestionGetDto
        {
            Id = question.Id,
            Topic_ID = question.Topic_ID,
            QuestionText = question.QuestionText,
            Answers = question.Answers,
            IsMultipleChoice = question.IsMultipleChoice
        };

        return Ok(questionDto);
    }



    [HttpPost]
    public async Task<IActionResult> AddQuestion([FromBody] QuestionDto questionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Создаем объект для сохранения
            var question = new Question
            {
                Topic_ID = questionDto.Topic_ID,
                QuestionText = questionDto.QuestionText,
                IsMultipleChoice = questionDto.IsMultipleChoice,
                Answers = questionDto.Answers.Select(a => new Answer
                {
                    AnswerText = a.AnswerText,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };

            await _questionService.AddQuestionAsync(question);

            return CreatedAtAction(nameof(GetQuestionById), new { id = question.Id }, question);
        }
        catch (DbUpdateException dbEx)
        {
            return BadRequest(new
            {
                Message = "Ошибка сохранения данных в базу данных",
                Details = dbEx.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "Произошла внутренняя ошибка сервера",
                Details = ex.Message
            });
        }
    }



    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionDto questionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var existingQuestion = await _questionService.GetQuestionByIdAsync(id);
            if (existingQuestion == null)
            {
                return NotFound(new { Message = $"Вопрос с Id {id} не найден" });
            }

            existingQuestion.Topic_ID = questionDto.Topic_ID;
            existingQuestion.QuestionText = questionDto.QuestionText;
            existingQuestion.IsMultipleChoice = questionDto.IsMultipleChoice;
            existingQuestion.Answers = questionDto.Answers.Select(a => new Answer
            {
                AnswerText = a.AnswerText,
                IsCorrect = a.IsCorrect
            }).ToList();

            await _questionService.UpdateQuestionAsync(existingQuestion);

            return Ok(existingQuestion);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = "Ошибка сохранения данных в базу данных",
                Details = ex.InnerException?.Message ?? ex.Message
            });
        }
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        try
        {
            var question = await _questionService.GetQuestionByIdAsync(id);
            if (question == null)
            {
                return NotFound(new { Message = $"Вопрос с Id {id} не найден" });
            }

            await _questionService.DeleteQuestionAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"Ошибка при удалении вопрос: {ex.Message}" });
        }
    }
}


