using BarcodeGenerator.Models;
using BarcodeGenerator.Services;
using Microsoft.AspNetCore.Mvc;

namespace BarcodeGenerator.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExcelController : ControllerBase
    {
        private readonly ExcelService _excelService;
        private readonly IWebHostEnvironment _environment;
        private readonly ProductCatalog _catalog;
        private readonly AppDbContext _db;
        private const string UploadsFolder = "uploads";

        public ExcelController(ExcelService excelService, IWebHostEnvironment environment, ProductCatalog catalog, AppDbContext db)
        {
            _excelService = excelService;
            _environment = environment;
            _catalog = catalog;
            _db = db;
        }

        private string GetUploadsPath()
        {
            // Безопасно получаем путь к wwwroot/uploads
            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsPath = Path.Combine(webRoot, UploadsFolder);
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);
            return uploadsPath;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<FileUploadResponse>> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new FileUploadResponse { Success = false, Message = "Файл не выбран" });

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
                return BadRequest(new FileUploadResponse { Success = false, Message = "Только файлы Excel (.xlsx, .xls)" });

            if (file.Length > 50 * 1024 * 1024)
                return BadRequest(new FileUploadResponse { Success = false, Message = "Файл слишком большой (макс. 50MB)" });

            try
            {
                var uploadsPath = GetUploadsPath();

                // Удаляем старые файлы (игнорируем ошибки)
                try
                {
                    foreach (var existingFile in Directory.GetFiles(uploadsPath, "products.*"))
                    {
                        try
                        {
                            System.IO.File.Delete(existingFile);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Не удалось удалить старый файл {existingFile}: {ex.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ошибка при удалении старых файлов: {ex.Message}");
                }

                var fileName = $"products{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Создаем файл с правильными правами
                await using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await file.CopyToAsync(stream);
                }

                // Устанавливаем права на файл после создания
                try
                {
                    System.IO.File.SetAttributes(filePath, FileAttributes.Normal);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Не удалось установить атрибуты файла: {ex.Message}");
                }

                var products = _excelService.ReadProductsFromExcel(filePath);
                // Импортируем в БД: очищаем и вставляем
                var existing = _db.Products.ToList();
                if (existing.Count > 0)
                {
                    _db.Products.RemoveRange(existing);
                    _db.SaveChanges();
                }
                _db.Products.AddRange(products);
                _db.SaveChanges();

                // Обновляем кэш по желанию (оставляем для обратной совместимости)
                _catalog.Refresh(filePath);

                return Ok(new FileUploadResponse
                {
                    Success = true,
                    Message = $"Успешно загружено {products.Count} товаров",
                    Products = products
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex); // логируем для отладки
                return StatusCode(500, new FileUploadResponse
                {
                    Success = false,
                    Message = $"Ошибка при обработке файла: {ex.Message}"
                });
            }
        }

        [HttpDelete("delete")]
        public IActionResult DeleteExcel()
        {
            try
            {
                var uploadsPath = GetUploadsPath();

                var files = Directory.GetFiles(uploadsPath, "products.*");
                if (files.Length == 0)
                {
                    return Ok(new { Success = true, Message = "Файлы не найдены" });
                }

                foreach (var existingFile in files)
                {
                    try
                    {
                        // Простое удаление файла
                        System.IO.File.Delete(existingFile);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Не удалось удалить файл {existingFile}: {ex.Message}");
                        // Не возвращаем ошибку, просто логируем и продолжаем
                    }
                }

                return Ok(new { Success = true, Message = "Операция удаления завершена" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("products")]
        public ActionResult<List<Product>> GetProducts()
        {
            try
            {
                var uploadsPath = GetUploadsPath();
                var excelFiles = Directory.GetFiles(uploadsPath, "products.*");
                if (excelFiles.Length == 0)
                    return Ok(new List<Product>()); // вместо 500 — пустой список

                var filePath = excelFiles[0];
                // Возвращаем из БД
                var products = _db.Products.ToList();
                return Ok(products);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { Message = ex.Message });
            }
        }
        
        [HttpGet("search")]
        public ActionResult SearchProduct([FromQuery] string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return BadRequest(new { Message = "Штрихкод не указан" });

            try
            {
                var uploadsPath = GetUploadsPath();
                var excelFiles = Directory.GetFiles(uploadsPath, "products.*");

                if (excelFiles.Length == 0)
                    return Ok(new { Sap = string.Empty, RelatedProducts = new List<Product>() });

                var filePath = excelFiles[0];
                // Поиск по EAN в БД (нормализуем как раньше)
                var normalized = barcode.Replace(" ", "").Replace("-", "").Trim().ToUpperInvariant();
                var found = _db.Products.FirstOrDefault(p => p.EAN == normalized);
                if (found == null)
                    return Ok(new { Sap = string.Empty, RelatedProducts = new List<Product>() });
                var sap = found.SapArticle;
                var related = _db.Products.Where(p => p.SapArticle == sap).ToList();
                return Ok(new { Sap = sap, RelatedProducts = related });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { Message = ex.Message });
            }
        }
        
        
        [HttpGet("search-sap")]
        public ActionResult SearchBySap([FromQuery] string sap)
        {
            if (string.IsNullOrWhiteSpace(sap))
                return BadRequest(new { Message = "SAP артикул не указан" });

            try
            {
                var uploadsPath = GetUploadsPath();
                var excelFiles = Directory.GetFiles(uploadsPath, "products.*");

                if (excelFiles.Length == 0)
                    return Ok(new { RelatedProducts = new List<Product>() });

                var filePath = excelFiles[0];
                var relatedProducts = _db.Products.Where(p => p.SapArticle == sap).ToList();
                return Ok(new { RelatedProducts = relatedProducts });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { Message = ex.Message });
            }
        }




        [HttpGet("status")]
        public IActionResult GetFileStatus()
        {
            try
            {
                var uploadsPath = GetUploadsPath();
                var hasFile = Directory.GetFiles(uploadsPath, "products.*").Length > 0;
                return Ok(new { HasFile = hasFile });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
        }
    }
}
