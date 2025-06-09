using Driving_School_API.Models.Question;

public class QuestionService : IQuestionService
{
    private readonly IQuestionRepository _questionRepository;

    public QuestionService(IQuestionRepository questionRepository)
    {
        _questionRepository = questionRepository;
    }

    // получение данных всех вопросов
    public async Task<IEnumerable<Question>> GetAllQuestionsAsync()
    {
        return await _questionRepository.GetAllQuestionsAsync();
    }

    // получить данные вопроса по id
    public async Task<Question> GetQuestionByIdAsync(int id)
    {
        return await _questionRepository.GetQuestionByIdAsync(id);
    }

    // создание нового вопроса
    public async Task AddQuestionAsync(Question question)
    {
        if (!question.Answers.Any(a => a.IsCorrect))
            throw new ArgumentException("Хотя бы один ответ должен быть помечен как правильный.");

        await _questionRepository.AddQuestionAsync(question);
    }

    // изменение данных вопроса
    public async Task UpdateQuestionAsync(Question question)
    {
        if (!question.Answers.Any(a => a.IsCorrect))
            throw new ArgumentException("Хотя бы один ответ должен быть помечен как правильный.");

        await _questionRepository.UpdateQuestionAsync(question);
    }

    // удаление вопроса по id
    public async Task DeleteQuestionAsync(int id)
    {
        await _questionRepository.DeleteQuestionAsync(id);
    }
}