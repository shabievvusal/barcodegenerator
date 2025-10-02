import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import "../ProductList.css";

// Кэш для штрихкодов
const barcodeCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 минут

// Функция для создания ключа кэша
const createCacheKey = (ean, type, size) => {
  if (type === 'qr') {
    return `qr_${ean}_${size}`;
  } else {
    return `code128_${ean}_${size.width}x${size.height}`;
  }
};

// Функция для проверки валидности кэша
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_EXPIRY;
};

// Функция для предзагрузки изображения
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};

const ProductList = ({ products, sapArticle, searchedBarcode, isLoading, defaultPrintType = 'qr', qrSize = 500, code128Size = { width: 500, height: 200 }, textSize = 10, preloadBarcodes = true }) => {
  // Функция получения URL штрихкода с кэшированием
  const getBarcodeUrl = useCallback((ean, type, currentQrSize, currentCode128Size) => {
    const size = type === 'qr' ? currentQrSize : currentCode128Size;
    const cacheKey = createCacheKey(ean, type, size);
    
    // Проверяем кэш
    const cached = barcodeCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.url;
    }
    
    // Создаем URL
    const url = type === 'qr' 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=${currentQrSize}x${currentQrSize}&data=${encodeURIComponent(ean)}`
      : `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(ean)}&code=Code128&translate-esc=on&eclevel=L&width=${currentCode128Size.width}&height=${currentCode128Size.height}&showtext=0`;
    
    // Сохраняем в кэш
    barcodeCache.set(cacheKey, {
      url,
      timestamp: Date.now()
    });
    
    return url;
  }, []);

  // Мемоизируем функцию печати
  const handleBarcodeClick = useCallback((product, barcodeType = 'qr') => {
    // Создаем скрытый iframe для печати в том же окне
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);
    
    const barcodeUrl = getBarcodeUrl(product.ean, barcodeType, qrSize, code128Size);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Печать штрихкода</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              text-align: center;
              background: white;
            }
            .print-container {
              width: 100mm;
              height: 75mm;
              margin: 0 auto;
              padding: 5mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .barcode-container {
              margin: 0;
            }
            .barcode-container img {
              max-width: 100%;
              height: auto;
            }
            .product-info {
              margin: 2mm 0;
              font-size: ${textSize}px;
              color: #000;
              text-align: center;
            }
            .product-name {
              font-size: ${Math.max(6, textSize - 2)}px;
              font-weight: bold;
              margin: 1mm 0;
              color: #000;
            }
            .barcode {
              font-family: monospace;
              font-size: ${Math.max(6, textSize - 2)}px;
              font-weight: bold;
              margin: 1mm 0;
              word-break: break-all;
              color: #000;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .print-container { 
                border: none; 
                box-shadow: none; 
                width: 100mm;
                height: 75mm;
              }
              @page {
                size: 100mm 75mm;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="barcode-container">
              <img src="${barcodeUrl}" 
                   alt="${barcodeType === 'qr' ? 'QR Code' : 'Code-128'}" 
                   onload="console.log('✅ Штрихкод загружен');"
                   onerror="console.log('❌ Ошибка загрузки штрихкода');" />
            </div>
            <div class="product-info">
              <div class="barcode">${product.ean}</div>
              ${product.isUnknown ? '' : `
                <div class="product-name">${product.materialDescription || product.name || 'Товар'}, ${product.counter} шт</div>
              `}
            </div>
          </div>
        </body>
      </html>
    `;
    
    iframe.contentDocument.write(printContent);
    iframe.contentDocument.close();
    
    // Ждем загрузки страницы и изображения
    iframe.onload = () => {
      const img = iframe.contentDocument.querySelector('img');
      if (img.complete) {
        // Изображение уже загружено
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        // Ждем загрузки изображения
        img.onload = () => {
          iframe.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        };
      }
    };
  }, [getBarcodeUrl, qrSize, code128Size, textSize]);

  // Мемоизируем проверку неизвестных товаров
  const hasUnknownProducts = useMemo(() => 
    products.some(product => product.isUnknown), 
    [products]
  );

  // Предзагрузка штрихкодов для найденных товаров
  useEffect(() => {
    if (preloadBarcodes && products.length > 0 && products.length <= 10) { // Предзагружаем только если включено и для небольшого количества товаров
      products.forEach(product => {
        if (!product.isUnknown) {
          // Предзагружаем для текущего типа печати
          const url = getBarcodeUrl(product.ean, defaultPrintType, qrSize, code128Size);
          preloadImage(url).catch(() => {
            console.log(`Не удалось предзагрузить штрихкод для ${product.ean}`);
          });
        }
      });
    }
  }, [preloadBarcodes, products, defaultPrintType, qrSize, code128Size, getBarcodeUrl]);

  if (isLoading) {
    return (
      <div className="loading minimal">Поиск…</div>
    );
  }

  if (!searchedBarcode) return null;

  if (products.length === 0) {
    return (
      <div className="no-results minimal">Ничего не найдено</div>
    );
  }

  return (
    <div className="product-list-container minimal">
      {!hasUnknownProducts && (
        <div className="results-summary minimal">
          Найдено: {products.length} | {sapArticle ? `SAP: ${sapArticle}` : `ШК: ${searchedBarcode}`} | {products.length > 0 && products[0].materialDescription ? products[0].materialDescription : products.length > 0 && products[0].name ? products[0].name : ''}
        </div>
      )}
      
      {hasUnknownProducts && (
        <div className="unknown-product-notice minimal">
          <div className="notice-icon">🤔</div>
          <div className="notice-text">
            <strong>Хм, возможно вы просто хотели распечатать штрихкод</strong>
            <p>Товар не найден в базе, но вы можете распечатать штрихкод</p>
          </div>
        </div>
      )}
      
      <div className="buttons-container minimal">
        {products.map((product, index) => (
          <div key={`${product.ean}-${index}`} className="product-card minimal">
            {product.isUnknown ? (
              <button
                className="product-button minimal"
                onClick={() => handleBarcodeClick(product, defaultPrintType)}
                title={`Клик для печати ${defaultPrintType === 'qr' ? 'QR-кода' : 'Code-128'}`}
              >
                <div className="button-content minimal">
                  <div className="ean-code minimal">{product.ean}</div>
                </div>
              </button>
            ) : (
              <button
                className="product-button minimal"
                onClick={() => handleBarcodeClick(product, defaultPrintType)}
                title={`Клик для печати ${defaultPrintType === 'qr' ? 'QR-кода' : 'Code-128'}`}
              >
                <div className="button-content minimal">
                  <div className="ean-code minimal">{product.ean}</div>
                  <div className="counter-badge minimal">{product.counter} ШТ</div>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;