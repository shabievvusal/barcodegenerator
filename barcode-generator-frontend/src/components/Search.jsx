import React, { useState } from 'react';

const Search = ({ onSearch, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm, searchType);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('', searchType);
  };

  const getTotalQuantity = () => {
    return products.reduce((total, product) => total + (parseInt(product.quantity) || 0), 0);
  };

  return (
    <div className="search-section">
      <div className="search-stats">
        <div className="stat-card">
          <span className="stat-label">Всего товаров:</span>
          <span className="stat-value">{products.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Общее количество:</span>
          <span className="stat-value">{getTotalQuantity()} шт.</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <div className="search-field">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Поиск по ${getSearchPlaceholder(searchType)}...`}
              className="search-input"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
          
          <select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type"
          >
            <option value="name">По названию</option>
            <option value="barcode">По штрихкоду</option>
            <option value="category">По категории</option>
          </select>
          
          <button type="submit" className="search-button">
            🔍 Поиск
          </button>
        </div>
      </form>
    </div>
  );
};

const getSearchPlaceholder = (type) => {
  switch (type) {
    case 'name': return 'названию товара';
    case 'barcode': return 'штрихкоду';
    case 'category': return 'категории';
    default: return 'названию';
  }
};

export default Search;