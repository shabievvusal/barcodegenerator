# Barcode Generator

Приложение для генерации штрих-кодов и QR-кодов на основе данных из Excel файлов.

## Архитектура

- **Backend**: ASP.NET Core 9.0 Web API
- **Frontend**: React 19 + Vite
- **База данных**: Файловая система (Excel файлы)

## Запуск с Docker

### Быстрый старт

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd barcode-generator

# Запустите все сервисы
docker-compose up --build

# Приложение будет доступно по адресу:
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

### Отдельный запуск сервисов

#### Backend
```bash
cd barcode-generator-backend
docker build -f BarcodeGenerator/Dockerfile -t barcode-backend .
docker run -p 8080:80 -v $(pwd)/BarcodeGenerator/wwwroot/uploads:/app/wwwroot/uploads barcode-backend
```

#### Frontend
```bash
cd barcode-generator-frontend
docker build -f Dockerfile.frontend -t barcode-frontend .
docker run -p 80:80 barcode-frontend
```

## Разработка

### Backend (ASP.NET Core)

```bash
cd barcode-generator-backend/BarcodeGenerator
dotnet restore
dotnet run
```

Backend будет доступен по адресу: `http://localhost:5146`

### Frontend (React)

```bash
cd barcode-generator-frontend
npm install
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:3000`

## API Endpoints

- `GET /api/excel/health` - Health check
- `GET /api/excel/status` - Статус загруженного файла
- `POST /api/excel/upload` - Загрузка Excel файла
- `GET /api/excel/products` - Получение списка товаров
- `GET /api/excel/search?barcode={barcode}` - Поиск по штрих-коду
- `GET /api/excel/search-sap?sap={sap}` - Поиск по SAP артикулу
- `DELETE /api/excel/delete` - Удаление загруженного файла

## Структура проекта

```
barcode-generator/
├── barcode-generator-backend/          # ASP.NET Core API
│   └── BarcodeGenerator/
│       ├── Controllers/                # API контроллеры
│       ├── Models/                     # Модели данных
│       ├── Services/                   # Бизнес-логика
│       └── Dockerfile                 # Dockerfile для бэкенда
├── barcode-generator-frontend/         # React приложение
│   ├── src/
│   │   ├── components/                # React компоненты
│   │   └── services/                  # API клиент
│   ├── Dockerfile.frontend           # Dockerfile для фронтенда
│   └── nginx.conf                     # Конфигурация Nginx
├── docker-compose.yml                 # Docker Compose конфигурация
└── README.md
```

## Требования

- Docker и Docker Compose
- .NET 9.0 SDK (для разработки)
- Node.js 18+ (для разработки)

## Особенности

- Поддержка загрузки Excel файлов (.xlsx, .xls)
- Генерация штрих-кодов и QR-кодов
- Поиск товаров по штрих-коду и SAP артикулу
- Responsive дизайн
- Docker контейнеризация
- Health checks для мониторинга
