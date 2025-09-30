using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BarcodeGenerator.Models;

public class Product
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string SapArticle { get; set; } = string.Empty;        // Артикул SAP
    public string MaterialDescription { get; set; } = string.Empty; // Краткий текст материала
    public string EAN { get; set; } = string.Empty;               // EAN БЕИ/АЕИ (нормализованный)
    public int Counter { get; set; }              // Счетчик
}