using Microsoft.EntityFrameworkCore;
using Amanote.Api.Models;

namespace Amanote.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Note> Notes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> Documents (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Documents)
                .WithOne(d => d.User)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Document -> Notes (One-to-Many)
            modelBuilder.Entity<Document>()
                .HasMany(d => d.Notes)
                .WithOne(n => n.Document)
                .HasForeignKey(n => n.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint on User Email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Composite unique constraint on DocumentId + PageNumber (one note per page per document)
            modelBuilder.Entity<Note>()
                .HasIndex(n => new { n.DocumentId, n.PageNumber })
                .IsUnique();
        }
    }
}
