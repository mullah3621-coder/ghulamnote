using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Amanote.Api.Models
{
    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        // Foreign Key
        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Navigation Property
        public ICollection<Note> Notes { get; set; } = new List<Note>();
    }
}
