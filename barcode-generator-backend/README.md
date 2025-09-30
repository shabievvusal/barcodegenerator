# BarcodeGenerator API

ASP.NET Core API для работы с Excel файлами и генерации штрихкодов.

## 🚀 Быстрый запуск с Docker

### 1. Сборка и запуск
```bash
# Сборка и запуск контейнера
docker-compose up --build -d

# Просмотр логов
docker-compose logs -f barcode-api

# Остановка
docker-compose down
```

### 2. Доступ к API
- **Swagger UI**: http://localhost:8080/swagger
- **API Base URL**: http://localhost:8080/api

## 📡 API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/excel/upload` | Загрузка Excel файла |
| GET | `/api/excel/products` | Получение всех товаров |
| GET | `/api/excel/search?barcode=...` | Поиск по штрихкоду |
| GET | `/api/excel/search-sap?sap=...` | Поиск по SAP артикулу |
| DELETE | `/api/excel/delete` | Удаление файла |
| GET | `/api/excel/status` | Статус загруженного файла |

## 🔧 Конфигурация

### Переменные окружения
- `ASPNETCORE_ENVIRONMENT=Production`
- `ASPNETCORE_URLS=http://+:80`

### Порты
- **Внешний**: 8080 (localhost:8080)
- **Внутренний**: 80 (внутри контейнера)

### Volumes
- `./BarcodeGenerator/wwwroot/uploads:/app/wwwroot/uploads` - папка для загруженных файлов

## 📁 Структура проекта
```
BarcodeGenerator/
├── Controllers/
│   └── ExcelController.cs      # API контроллер
├── Services/
│   └── ExcelService.cs         # Сервис для работы с Excel
├── Models/
│   ├── Product.cs              # Модель товара
│   └── FileUploadResponse.cs   # Ответ загрузки
├── wwwroot/uploads/            # Загруженные файлы
├── Dockerfile                  # Docker образ
└── Program.cs                  # Точка входа
```

## 🛠 Разработка

### Локальный запуск (без Docker)
```bash
cd BarcodeGenerator
dotnet run
```

### Тестирование API
```bash
# Проверка статуса
curl http://localhost:8080/api/excel/status

# Загрузка файла
curl -X POST -F "file=@products.xlsx" http://localhost:8080/api/excel/upload
```
