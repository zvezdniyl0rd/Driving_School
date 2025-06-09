using Driving_School_API.Models.Question;

public interface IQuestionRepository
{
    Task<IEnumerable<Question>> GetAllQuestionsAsync(); // получение данных всех вопросов
    Task<Question> GetQuestionByIdAsync(int id); // получение данных вопроса по id
    Task AddQuestionAsync(Question question); // добавление нового вопроса
    Task UpdateQuestionAsync(Question question); // изменение данных вопроса
    Task DeleteQuestionAsync(int id); // удаление вопроса по id
}