import React from 'react';
import "../ProductList.css";

const ProductList = ({ products, sapArticle, searchedBarcode, isLoading, defaultPrintType = 'qr' }) => {
  const handleBarcodeClick = (product, barcodeType = 'qr') => {
    // Создаем скрытый iframe для печати
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Печать QR-кода</title>
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
            }
            .barcode-container img[alt="QR Code"] {
              width: 50mm;
              height: 50mm;
            }
            .barcode-container img[alt="Code-128"] {
              width: 50mm;
              height: 20mm;
            }
            .product-info {
              margin: 2mm 0;
              font-size: 10px;
              color: #000;
              text-align: center;
            }
            .product-name {
              font-size: 8px;
              font-weight: bold;
              margin: 1mm 0;
              color: #000;
            }
            .barcode {
              font-family: monospace;
              font-size: 8px;
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
              ${barcodeType === 'qr' ? 
                `<img src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(product.ean)}" 
                     alt="QR Code" 
                     onload="console.log('✅ QR код загружен через QR Server API (ProductList)');"
                     onerror="console.log('❌ Ошибка QR Server API (ProductList)');" />` :
                `<img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(product.ean)}&code=Code128&translate-esc=on&eclevel=L&width=500&height=200&showtext=0" 
                     alt="Code-128" 
                     onload="console.log('✅ Code-128 загружен через TEC-IT API (ProductList)');"
                     onerror="console.log('❌ Ошибка TEC-IT API (ProductList)');" />`
              }
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
  };

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

  // Проверяем, есть ли неизвестные товары
  const hasUnknownProducts = products.some(product => product.isUnknown);

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
                onClick={() => handleBarcodeClick(product, 'code128')}
                title="Клик для печати штрихкода"
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