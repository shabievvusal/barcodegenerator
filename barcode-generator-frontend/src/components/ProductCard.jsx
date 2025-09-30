import React from 'react';

const ProductCard = ({ product }) => {
  const formatBarcode = (barcode) => {
    if (!barcode) return 'Не указан';
    
    const str = barcode.toString();
    if (str.length <= 8) return str;
    
    return str.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="product-card">
      <div className="product-header">
        <h3 className="product-name">{product.name || 'Без названия'}</h3>
        {product.quantity && (
          <span className="product-quantity">
            📦 {product.quantity} шт.
          </span>
        )}
      </div>
      
      <div className="product-barcode">
        <span className="barcode-label">Штрихкод:</span>
        <span className="barcode-value">{formatBarcode(product.barcode)}</span>
      </div>
      
      {product.description && (
        <div className="product-description">
          {product.description}
        </div>
      )}
      
      <div className="product-footer">
        {product.category && (
          <span className="product-category">
            🏷️ {product.category}
          </span>
        )}
        {product.sku && (
          <span className="product-sku">
            # {product.sku}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;