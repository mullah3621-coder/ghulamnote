using System.ComponentModel.DataAnnotations;

namespace Amanote.Api.DTOs
{
    public class NoteDto
    {
        [Required]
        public int PageNumber { get; set; }

        public string ContentHtml { get; set; } = string.Empty;
    }
}
