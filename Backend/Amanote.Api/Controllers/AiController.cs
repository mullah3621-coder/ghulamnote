using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Amanote.Api.Data;
using Amanote.Api.DTOs;
using Amanote.Api.Services;

namespace Amanote.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IGeminiService _geminiService;
        private readonly ApplicationDbContext _context;

        public AiController(IGeminiService geminiService, ApplicationDbContext context)
        {
            _geminiService = geminiService;
            _context = context;
        }

        // POST: api/ai/summarize
        [HttpPost("summarize")]
        public async Task<IActionResult> Summarize([FromBody] AiRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                return BadRequest(new { message = "Text is required" });

            var result = await _geminiService.SummarizeAsync(dto.Text);

            return Ok(new AiResponseDto { Response = result });
        }

        // POST: api/ai/chat
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AiChatDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Question))
                return BadRequest(new { message = "Question is required" });

            var context = "No document content available.";

            // Use PDF text sent from frontend
            if (!string.IsNullOrWhiteSpace(dto.PdfText))
            {
                context = $"Document Content:\n{dto.PdfText}";
            }

            var result = await _geminiService.ChatAsync(dto.Question, context);

            return Ok(new AiResponseDto { Response = result });
        }

        private int GetUserId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
    }
}
