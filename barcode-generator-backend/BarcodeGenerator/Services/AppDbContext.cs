using BarcodeGenerator.Models;
using Microsoft.EntityFrameworkCore;

namespace BarcodeGenerator.Services
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.HasKey(p => p.Id);

                entity.Property(p => p.SapArticle).HasMaxLength(100);
                entity.Property(p => p.EAN).HasMaxLength(64);
                entity.Property(p => p.MaterialDescription).HasMaxLength(512);

                entity.HasIndex(p => p.SapArticle).HasDatabaseName("ix_products_sap");
                entity.HasIndex(p => p.EAN).HasDatabaseName("ix_products_ean");
            });
        }
    }
}


