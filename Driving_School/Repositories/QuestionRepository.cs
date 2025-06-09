using Driving_School_API.Models.Question;
using Microsoft.EntityFrameworkCore;

public class QuestionRepository : IQuestionRepository
{
    private readonly ApplicationDbContext _context;

    public QuestionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // получение данных всех вопросов
    public async Task<IEnumerable<Question>> GetAllQuestionsAsync()
    {
        return await _context.Question
            .Include(q => q.Answers)
            .ToListAsync();
    }

    // получение данных вопроса по id
    public async Task<Question> GetQuestionByIdAsync(int id)
    {
        return await _context.Question
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    // добавление нового вопроса
    public async Task AddQuestionAsync(Question question)
    {        
        await _context.Question.AddAsync(question);
        await _context.SaveChangesAsync();
    }

    // изменение данных вопроса
    public async Task UpdateQuestionAsync(Question question)
    {
        var existingQuestion = await _context.Question
           .Include(q => q.Answers)
           .FirstOrDefaultAsync(q => q.Id == question.Id);

        if (existingQuestion == null)
        {
            throw new KeyNotFoundException($"Вопрос с ID {question.Id} не найден.");
        }

        // Обновляем поля вопроса
        existingQuestion.Topic_ID = question.Topic_ID;
        existingQuestion.QuestionText = question.QuestionText;
        existingQuestion.IsMultipleChoice = question.IsMultipleChoice;

        // Удаляем старые ответы
        _context.Answer.RemoveRange(existingQuestion.Answers);

        // Добавляем новые ответы
        existingQuestion.Answers = question.Answers;

        await _context.SaveChangesAsync();
    }

    // удаление вопроса по id
    public async Task DeleteQuestionAsync(int id)
    {
        var question = await _context.Question.FindAsync(id);
        if (question == null)
        {
            throw new KeyNotFoundException("Вопрос с указанным ID не найден.");
        }

        _context.Question.Remove(question);
        await _context.SaveChangesAsync();
    }
}