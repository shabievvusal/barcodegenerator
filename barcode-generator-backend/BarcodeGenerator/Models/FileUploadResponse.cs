namespace BarcodeGenerator.Models;

public class FileUploadResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<Product> Products { get; set; } = new List<Product>();
}