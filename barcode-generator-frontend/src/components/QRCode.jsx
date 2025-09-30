import React from 'react';

const QRCode = ({ data, size = 200, className = '' }) => {
  if (!data) return null;

  // TEC-IT API с размером
  const tecItUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(data)}&code=MobileQRCode&translate-esc=on&eclevel=L&width=${size}&height=${size}&showtext=0`;
  
  // Fallback на QR Server API
  const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

  return (
    <div className={`qr-code ${className}`}>
      <img 
        src={tecItUrl} 
        alt={`QR Code for ${data}`}
        style={{ 
          width: size, 
          height: size, 
          maxWidth: '100%',
          imageRendering: 'crisp-edges'
        }}
        onLoad={() => console.log('✅ QR код загружен через TEC-IT API (QRCode компонент)')}
        onError={(e) => {
          console.log('❌ Ошибка TEC-IT API, переключаемся на QR Server API (QRCode компонент)');
          e.target.src = qrServerUrl;
          e.target.onload = () => console.log('✅ QR код загружен через QR Server API (QRCode компонент)');
          e.target.onerror = () => {
            console.log('❌ Ошибка и QR Server API (QRCode компонент)');
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          };
        }}
      />
      <div style={{ display: 'none', color: '#666', fontSize: '12px' }}>
        Ошибка загрузки QR-кода
      </div>
    </div>
  );
};

export default QRCode;
