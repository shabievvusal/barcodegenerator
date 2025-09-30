import React from 'react';

const BarcodeCard = ({ product, sapArticle }) => {
  const formatBarcode = (barcode) => {
    if (!barcode) return 'Не указан';
    const str = barcode.toString();
    return str.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="barcode-card">
      <div className="barcode-header">
        <h3 className="product-name">{product.name || 'Без названия'}</h3>
        <span className="quantity-badge">{product.quantity} шт.</span>
      </div>
      
      <div className="barcode-content">
        <div className="barcode-row">
          <span className="label">Штрихкод:</span>
          <span className="value barcode-value">{formatBarcode(product.barcode)}</span>
        </div>
        
        <div className="barcode-row">
          <span className="label">SAP артикул:</span>
          <span className="value sap-article">{sapArticle}</span>
        </div>
        
        {product.description && (
          <div className="barcode-row">
            <span className="label">Описание:</span>
            <span className="value">{product.description}</span>
          </div>
        )}
        
        {product.category && (
          <div className="barcode-row">
            <span className="label">Категория:</span>
            <span className="value">{product.category}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeCard;