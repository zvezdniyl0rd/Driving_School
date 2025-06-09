using Driving_School_API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("/attachment")]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }


    [HttpPost]
    [ApiExplorerSettings(IgnoreApi = true)] // Скрываем метод из Swagger
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
    {
        try
        {
            var attachmentId = await _attachmentService.UploadFileAsync(file);
            return Ok(new { AttachmentId = attachmentId });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpGet("/attachment/{id}")]
    public async Task<IActionResult> GetAttachment(int id)
    {
        try
        {
            var attachment = await _attachmentService.GetAttachmentByIdAsync(id);
            if (attachment == null)
            {
                return NotFound(new { Message = $"Вложение с ID {id} не найдено" });
            }
            return Ok(attachment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }

    [HttpDelete("/attachment/{id}")]
    public async Task<IActionResult> DeleteAttachment(int id)
    {
        try
        {
            await _attachmentService.DeleteAttachmentAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Произошла ошибка на сервере", Details = ex.Message });
        }
    }
}