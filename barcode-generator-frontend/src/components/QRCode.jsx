import React, { useMemo, useCallback } from 'react';

const QRCode = ({ data, size = 200, className = '' }) => {
  // Мемоизируем URL для QR кода
  const qrUrl = useMemo(() => {
    if (!data) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  }, [data, size]);

  // Мемоизируем обработчик ошибки
  const handleError = useCallback((e) => {
    console.log('❌ Ошибка загрузки QR кода');
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'block';
  }, []);

  if (!data) return null;

  return (
    <div className={`qr-code ${className}`}>
      <img 
        src={qrUrl} 
        alt={`QR Code for ${data}`}
        style={{ 
          width: size, 
          height: size, 
          maxWidth: '100%',
          imageRendering: 'crisp-edges'
        }}
        onError={handleError}
        loading="lazy"
      />
      <div style={{ display: 'none', color: '#666', fontSize: '12px' }}>
        Ошибка загрузки QR-кода
      </div>
    </div>
  );
};

export default QRCode;
