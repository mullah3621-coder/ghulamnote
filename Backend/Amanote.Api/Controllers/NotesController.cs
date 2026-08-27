using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Amanote.Api.Data;
using Amanote.Api.DTOs;
using Amanote.Api.Models;

namespace Amanote.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/notes/document/{documentId}/page/{pageNumber}
        [HttpGet("document/{documentId}/page/{pageNumber}")]
        public async Task<IActionResult> GetNote(int documentId, int pageNumber)
        {
            var userId = GetUserId();

            // Verify document belongs to user
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.DocumentId == documentId && n.PageNumber == pageNumber);

            if (note == null)
                return Ok(new NoteDto { PageNumber = pageNumber, ContentHtml = "" });

            return Ok(new NoteDto
            {
                PageNumber = note.PageNumber,
                ContentHtml = note.ContentHtml
            });
        }

        // POST: api/notes/document/{documentId}/page/{pageNumber} (Upsert)
        [HttpPost("document/{documentId}/page/{pageNumber}")]
        public async Task<IActionResult> SaveNote(int documentId, int pageNumber, [FromBody] NoteDto dto)
        {
            var userId = GetUserId();

            // Verify document belongs to user
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            // Find existing note
            var existingNote = await _context.Notes
                .FirstOrDefaultAsync(n => n.DocumentId == documentId && n.PageNumber == pageNumber);

            if (existingNote != null)
            {
                // Update existing note
                existingNote.ContentHtml = dto.ContentHtml;
                existingNote.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                // Create new note
                var note = new Note
                {
                    DocumentId = documentId,
                    PageNumber = pageNumber,
                    ContentHtml = dto.ContentHtml,
                    LastUpdated = DateTime.UtcNow
                };
                _context.Notes.Add(note);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Note saved successfully" });
        }

        // --- Helper: Extract UserId from JWT ---
        private int GetUserId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
    }
}
