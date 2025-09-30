namespace BarcodeGenerator.Models;

public class Product
{
    public string SapArticle { get; set; } = string.Empty;        // Артикул SAP
    public string MaterialDescription { get; set; } = string.Empty; // Краткий текст материала
    public string EAN { get; set; } = string.Empty;               // EAN БЕИ/АЕИ
    public int Counter { get; set; }              // Счетчик
    
}