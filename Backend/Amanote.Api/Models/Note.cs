using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Amanote.Api.Models
{
    public class Note
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DocumentId { get; set; }

        [Required]
        public int PageNumber { get; set; }

        public string ContentHtml { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Foreign Key
        [ForeignKey("DocumentId")]
        public Document? Document { get; set; }
    }
}
