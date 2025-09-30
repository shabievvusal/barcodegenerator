# Используем более легкий базовый образ
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
EXPOSE 80

# Оптимизированная сборка
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Копируем только файл проекта для кэширования слоев
COPY ["BarcodeGenerator/BarcodeGenerator.csproj", "BarcodeGenerator/"]

# Восстанавливаем зависимости (кэшируется если .csproj не изменился)
RUN dotnet restore "BarcodeGenerator/BarcodeGenerator.csproj"

# Копируем остальные файлы
COPY . .

# Собираем проект
WORKDIR "/src/BarcodeGenerator"
RUN dotnet build "BarcodeGenerator.csproj" -c Release -o /app/build --no-restore

# Публикуем приложение
FROM build AS publish
RUN dotnet publish "BarcodeGenerator.csproj" -c Release -o /app/publish

# Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Устанавливаем права для Alpine
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Создаем директорию для загрузок и устанавливаем права
RUN mkdir -p /app/wwwroot/uploads && \
    chown -R appuser:appgroup /app && \
    chmod -R 777 /app/wwwroot/uploads
USER appuser

ENTRYPOINT ["dotnet", "BarcodeGenerator.dll"]
