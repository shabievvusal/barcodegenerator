import React, { useState, useEffect } from 'react';

const SearchSection = ({ onSearch, isSearching }) => {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    // Фокус на поле ввода при монтировании
    const input = document.getElementById('barcode-input');
    if (input) input.focus();

    // Глобальный обработчик клавиш для Backspace
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Backspace' && !searchValue) {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    // Очистка обработчика при размонтировании
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [searchValue]);

  const detectSearchType = (value) => {
    const trimmedValue = value.trim();
    
    // Если содержит буквы или специальные символы - скорее всего SAP
    if (/[a-zA-Z]/.test(trimmedValue) || /[^a-zA-Z0-9]/.test(trimmedValue)) {
      return 'sap';
    }
    
    // Если содержит только цифры и длина больше 12 - скорее всего штрихкод
    if (/^\d+$/.test(trimmedValue) && trimmedValue.length >= 12) {
      return 'barcode';
    }
    
    // Короткие числовые значения (до 12 символов) считаем SAP артикулами
    if (/^\d+$/.test(trimmedValue) && trimmedValue.length < 12) {
      return 'sap';
    }
    
    // По умолчанию считаем штрихкодом
    return 'barcode';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      const searchType = detectSearchType(searchValue);
      onSearch(searchValue.trim(), searchType);
      // Очищаем поле ввода после поиска
      setSearchValue('');
    }
  };

  const handleKeyPress = (e) => {
    // Автоматический поиск при нажатии Enter
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };


  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
    // Возвращаем фокус в поле ввода после очистки
    const input = document.getElementById('barcode-input');
    if (input) input.focus();
  };

  const handleFormClick = (e) => {
    // При клике по области формы ставим фокус в инпут, кроме кликов по кнопкам
    const isButton = e.target.closest('button');
    if (!isButton) {
      const input = document.getElementById('barcode-input');
      input && input.focus();
    }
  };

  return (
    <div className="search-section minimal container">
      <form onSubmit={handleSubmit} className="search-form minimal" role="search" onClick={handleFormClick}>
        <input
          id="barcode-input"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Сканируйте штрихкод или введите SAP артикул"
          className="search-input minimal"
          disabled={isSearching}
          autoComplete="off"
          inputMode="text"
          aria-label="Штрих-код или SAP артикул"
        />
        {searchValue && (
          <button 
            type="button" 
            onClick={clearSearch}
            className="clear-search minimal"
            disabled={isSearching}
            aria-label="Очистить"
            title="Очистить"
          >
            ✕
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchSection;