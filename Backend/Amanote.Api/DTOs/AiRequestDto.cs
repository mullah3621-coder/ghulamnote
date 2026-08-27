using System.ComponentModel.DataAnnotations;

namespace Amanote.Api.DTOs
{
    public class AiRequestDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
    }

    public class AiChatDto
    {
        [Required]
        public string Question { get; set; } = string.Empty;

        public string PdfText { get; set; } = string.Empty;
    }

    public class AiResponseDto
    {
        public string Response { get; set; } = string.Empty;
    }
}
