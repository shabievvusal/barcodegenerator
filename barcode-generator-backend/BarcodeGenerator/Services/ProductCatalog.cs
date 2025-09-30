using System.Collections.Concurrent;
using BarcodeGenerator.Models;

namespace BarcodeGenerator.Services
{
    public class ProductCatalog
    {
        private readonly ExcelService _excelService;
        private readonly IWebHostEnvironment _environment;
        private readonly object _reloadLock = new object();

        private volatile List<Product> _products = new List<Product>();
        private volatile Dictionary<string, List<Product>> _sapToProducts = new Dictionary<string, List<Product>>();
        private volatile Dictionary<string, List<Product>> _eanToProducts = new Dictionary<string, List<Product>>();

        public ProductCatalog(ExcelService excelService, IWebHostEnvironment environment)
        {
            _excelService = excelService;
            _environment = environment;
        }

        private string GetUploadsPath()
        {
            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsPath = Path.Combine(webRoot, "uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);
            return uploadsPath;
        }

        private string? FindProductsFile()
        {
            var uploadsPath = GetUploadsPath();
            var excelFiles = Directory.GetFiles(uploadsPath, "products.*");
            return excelFiles.FirstOrDefault();
        }

        private static string NormalizeBarcode(string? barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode)) return string.Empty;
            return barcode.Replace(" ", string.Empty)
                          .Replace("-", string.Empty)
                          .Trim()
                          .ToUpperInvariant();
        }

        public void Refresh(string? filePath = null)
        {
            lock (_reloadLock)
            {
                var path = filePath ?? FindProductsFile();
                if (string.IsNullOrWhiteSpace(path) || !System.IO.File.Exists(path))
                {
                    _products = new List<Product>();
                    _sapToProducts = new Dictionary<string, List<Product>>();
                    _eanToProducts = new Dictionary<string, List<Product>>();
                    return;
                }

                var products = _excelService.ReadProductsFromExcel(path);

                // Build new indexes
                var sapIndex = new Dictionary<string, List<Product>>();
                var eanIndex = new Dictionary<string, List<Product>>();

                foreach (var p in products)
                {
                    var sap = p.SapArticle ?? string.Empty;
                    if (!sapIndex.TryGetValue(sap, out var listBySap))
                    {
                        listBySap = new List<Product>();
                        sapIndex[sap] = listBySap;
                    }
                    listBySap.Add(p);

                    var normalizedEan = NormalizeBarcode(p.EAN);
                    if (!string.IsNullOrEmpty(normalizedEan))
                    {
                        if (!eanIndex.TryGetValue(normalizedEan, out var listByEan))
                        {
                            listByEan = new List<Product>();
                            eanIndex[normalizedEan] = listByEan;
                        }
                        listByEan.Add(p);
                    }
                }

                // Atomically swap references
                _products = products;
                _sapToProducts = sapIndex;
                _eanToProducts = eanIndex;
            }
        }

        private void EnsureLoaded()
        {
            if (_products.Count > 0) return;
            Refresh();
        }

        public List<Product> GetAll()
        {
            EnsureLoaded();
            // Return a copy to avoid external mutation
            return _products.ToList();
        }

        public (string Sap, List<Product> Related) SearchByBarcode(string barcode)
        {
            EnsureLoaded();
            var normalized = NormalizeBarcode(barcode);
            if (string.IsNullOrEmpty(normalized))
                return (string.Empty, new List<Product>());

            if (!_eanToProducts.TryGetValue(normalized, out var productsByEan) || productsByEan.Count == 0)
                return (string.Empty, new List<Product>());

            var sap = productsByEan[0].SapArticle ?? string.Empty;
            if (string.IsNullOrEmpty(sap))
                return (string.Empty, new List<Product>());

            if (_sapToProducts.TryGetValue(sap, out var related))
                return (sap, related.ToList());

            return (sap, new List<Product>());
        }

        public List<Product> SearchBySap(string sap)
        {
            EnsureLoaded();
            if (string.IsNullOrWhiteSpace(sap)) return new List<Product>();
            return _sapToProducts.TryGetValue(sap, out var related)
                ? related.ToList()
                : new List<Product>();
        }
    }
}


