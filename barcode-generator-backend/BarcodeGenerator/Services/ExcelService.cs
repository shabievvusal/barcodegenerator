using BarcodeGenerator.Models;
using ClosedXML.Excel;

namespace BarcodeGenerator.Services
{
    public class ExcelService
    {
        public List<Product> ReadProductsFromExcel(string filePath)
        {
            var products = new List<Product>();

            try
            {
                using (var workbook = new XLWorkbook(filePath))
                {
                    var worksheet = workbook.Worksheets.First(); // Берем первый лист
                    var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1); // Пропускаем заголовок

                    if (rows == null)
                        return products;

                    foreach (var row in rows)
                    {
                        var ean = row.Cell(4).GetValue<string>().Trim();
                        if (string.IsNullOrEmpty(ean) || ean.Length < 8)
                            continue;

                        var product = new Product
                        {
                            SapArticle = row.Cell(1).GetValue<string>().Trim(),        // Артикул SAP
                            MaterialDescription = row.Cell(7).GetValue<string>().Trim(), // Краткий текст материала
                            EAN = ean.Replace(" ", string.Empty).Replace("-", string.Empty).Trim().ToUpperInvariant(), // нормализованный EAN
                            Counter = row.Cell(5).GetValue<int>()                        // Кол-во
                        };

                        products.Add(product);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка чтения Excel файла: {ex.Message}", ex);
            }

            return products;
        }
    }
}