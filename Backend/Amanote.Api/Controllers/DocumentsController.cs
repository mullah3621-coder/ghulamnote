using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Amanote.Api.Data;
using Amanote.Api.Models;

namespace Amanote.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DocumentsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/documents
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var documents = await _context.Documents
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.UploadDate)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.FilePath,
                    d.UploadDate
                })
                .ToListAsync();

            return Ok(documents);
        }

        // POST: api/documents/upload
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Only PDF files are allowed" });

            var userId = GetUserId();

            // Create uploads folder if not exists
            var uploadsPath = Path.Combine(_env.ContentRootPath, "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var uniqueName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsPath, uniqueName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Save record to database
            var document = new Document
            {
                UserId = userId,
                FileName = file.FileName,
                FilePath = uniqueName,
                UploadDate = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "File uploaded successfully",
                document = new
                {
                    document.Id,
                    document.FileName,
                    document.FilePath,
                    document.UploadDate
                }
            });
        }

        // GET: api/documents/{id}/file - Serve the PDF file
        [HttpGet("{id}/file")]
        public async Task<IActionResult> GetFile(int id)
        {
            var userId = GetUserId();
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            var filePath = Path.Combine(_env.ContentRootPath, "uploads", document.FilePath);
            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "File not found on disk" });

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/pdf", document.FileName);
        }

        // DELETE: api/documents/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

            if (document == null)
                return NotFound(new { message = "Document not found" });

            // Delete physical file
            var filePath = Path.Combine(_env.ContentRootPath, "uploads", document.FilePath);
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            // Delete from database (cascade will delete notes too)
            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Document deleted successfully" });
        }

        // --- Helper: Extract UserId from JWT ---
        private int GetUserId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            return int.Parse(claim!.Value);
        }
    }
}
