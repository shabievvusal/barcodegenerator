import React from 'react';
import QRCode from './QRCode';

const PrintModal = ({ isOpen, onClose, product, quantity = 1 }) => {
  if (!isOpen || !product) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
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
            .qr-code {
              margin: 0;
            }
            .qr-code img {
              width: 50mm;
              height: 50mm;
              max-width: 100%;
            }
            .product-info {
              margin: 3mm 0;
              font-size: 14px;
              color: #000;
              text-align: center;
            }
            .product-name {
              font-size: 12px;
              font-weight: bold;
              margin: 2mm 0;
              color: #000;
            }
            .barcode {
              font-family: monospace;
              font-size: 12px;
              font-weight: bold;
              margin: 2mm 0;
              word-break: break-all;
              color: #000;
            }
            .quantity {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin: 2mm 0;
            }
            .generated-info {
              font-size: 10px;
              color: #666;
              margin-top: 2mm;
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
            <div class="qr-code">
              <img src="https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(product.ean)}" 
                   alt="QR Code" 
                   onload="console.log('✅ QR код загружен через Google Charts API (PrintModal)');"
                   onerror="console.log('❌ Ошибка Google Charts API, переключаемся на QR Server API (PrintModal)'); this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent('${product.ean}'); this.onload=function(){console.log('✅ QR код загружен через QR Server API (PrintModal)');}; this.onerror=function(){console.log('❌ Ошибка и QR Server API (PrintModal)');};" />
            </div>
            <div class="product-info">
              <div class="product-name">${product.materialDescription || product.name || 'Товар'}</div>
              <div class="barcode">${product.ean}</div>
              <div class="quantity">${quantity} шт</div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Ждем загрузки страницы и изображения
    printWindow.onload = () => {
      const img = printWindow.document.querySelector('img');
      if (img.complete) {
        // Изображение уже загружено
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        // Ждем загрузки изображения
        img.onload = () => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };
      }
    };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content print-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Печать QR-кода</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="print-preview">
            <div className="product-info">
              <div className="product-description" style={{color: '#000', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px'}}>
                {product.materialDescription || product.name || 'Товар'}
              </div>
              <div className="barcode-display" style={{color: '#000', fontSize: '12px', marginBottom: '8px'}}>{product.ean}</div>
              <div className="quantity-display" style={{color: '#000', fontSize: '16px', fontWeight: 'bold'}}>Количество: {quantity} шт</div>
            </div>
            <div className="qr-code-preview">
              <img src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(product.ean)}`} 
                   alt="QR Code" 
                   style={{ width: 200, height: 200 }}
                   onLoad={() => console.log('✅ QR код превью загружен через Google Charts API (PrintModal)')}
                   onError={(e) => {
                     console.log('❌ Ошибка Google Charts API для превью, переключаемся на QR Server API (PrintModal)');
                     e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(product.ean)}`;
                     e.target.onload = () => console.log('✅ QR код превью загружен через QR Server API (PrintModal)');
                     e.target.onerror = () => console.log('❌ Ошибка и QR Server API для превью (PrintModal)');
                   }} />
            </div>
            <div className="print-actions">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨️ Печать
              </button>
              <button className="btn" onClick={onClose}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
