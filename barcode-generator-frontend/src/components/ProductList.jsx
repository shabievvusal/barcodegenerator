import React, { useCallback, useMemo } from 'react';
import "../ProductList.css";

const ProductList = ({ products, sapArticle, searchedBarcode, isLoading, defaultPrintType = 'qr', qrSize = 500, code128Size = { width: 500, height: 200 }, textSize = 10 }) => {
  // Мемоизируем функцию печати
  const handleBarcodeClick = useCallback((product, barcodeType = 'qr') => {
    // Используем более эффективный подход - создаем новое окно вместо iframe
    const printWindow = window.open('', '_blank', 'width=1,height=1');
    
    if (!printWindow) {
      console.error('Не удалось открыть окно для печати');
      return;
    }

    const barcodeUrl = barcodeType === 'qr' 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(product.ean)}`
      : `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(product.ean)}&code=Code128&translate-esc=on&eclevel=L&width=${code128Size.width}&height=${code128Size.height}&showtext=0`;
    
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
                   onload="window.print(); window.close();"
                   onerror="console.log('Ошибка загрузки изображения'); window.close();" />
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
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  }, [qrSize, code128Size, textSize]);

  // Мемоизируем проверку неизвестных товаров
  const hasUnknownProducts = useMemo(() => 
    products.some(product => product.isUnknown), 
    [products]
  );

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