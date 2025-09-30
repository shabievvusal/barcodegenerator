import React, { useState, useEffect } from 'react';
import SettingsButton from './components/SettingsButton';
import SettingsModal from './components/SettingsModal';
import SearchSection from './components/SearchSection';
import ProductList from './components/ProductList';
import { excelAPI } from './services/api';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchedBarcode, setSearchedBarcode] = useState('');
  const [sapArticle, setSapArticle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [defaultPrintType, setDefaultPrintType] = useState('qr'); // 'qr' или 'code128'
  const [qrSize, setQrSize] = useState(500); // размер QR-кода
  const [code128Size, setCode128Size] = useState({ width: 500, height: 200 }); // размер Code-128
  const [textSize, setTextSize] = useState(10); // размер текста

  useEffect(() => {
    checkFileStatus();
    loadProducts();
  }, []);

  const checkFileStatus = async () => {
    try {
      const status = await excelAPI.getFileStatus();
      setHasFile(status.hasFile);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      setMessage(`Ошибка подключения к серверу: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await excelAPI.getProducts();
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setAllProducts(productsArray);
      
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setAllProducts([]);
      setMessage(`Ошибка загрузки товаров: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

const handleSearch = async (searchValue, searchType = 'barcode') => {
  if (!searchValue.trim()) {
    setFilteredProducts([]);
    setSearchedBarcode('');
    setSapArticle('');
    return;
  }

  setIsSearching(true);
  setSearchedBarcode(searchValue);

  try {
    let result;
    
    if (searchType === 'sap') {
      // Сначала пробуем API поиск по SAP
      try {
        result = await excelAPI.searchBySap(searchValue);
        setSapArticle(searchValue);
      } catch (apiError) {
        console.log('API поиск по SAP не работает, используем локальный поиск');
        
        // Fallback: поиск по SAP артикулу в локальных данных
        const sapProducts = allProducts.filter(product => 
          product.sapArticle === searchValue
        );
        
        if (sapProducts.length > 0) {
          result = { relatedProducts: sapProducts };
          setSapArticle(searchValue);
        } else {
          result = { relatedProducts: [] };
          setSapArticle('');
        }
      }
    } else {
      // Поиск по штрихкоду
      result = await excelAPI.searchProduct(searchValue);
      setSapArticle(result.sap || '');
    }

    if (result.relatedProducts && result.relatedProducts.length > 0) {
      // Сортируем товары по количеству штук по возрастанию
      const sortedProducts = result.relatedProducts.sort((a, b) => (a.counter || 0) - (b.counter || 0));
      setFilteredProducts(sortedProducts);
    } else {
      // Если товар не найден, предлагаем печать штрихкода
      setFilteredProducts([{
        ean: searchValue,
        materialDescription: '',
        counter: 1,
        isUnknown: true
      }]);
    }
  } catch (error) {
    console.error('Ошибка поиска продукта:', error);
    setSapArticle('');
    setFilteredProducts([]);
    setMessage(`Ошибка поиска: ${error.message}`);
    setTimeout(() => setMessage(''), 5000);
  } finally {
    setIsSearching(false);
  }
};


  const handleFileUpload = (uploadedProducts, successMessage) => {
    const productsArray = Array.isArray(uploadedProducts) ? uploadedProducts : [];
    setAllProducts(productsArray);
    setHasFile(true);
    setMessage(successMessage);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileDelete = (successMessage) => {
    setAllProducts([]);
    setFilteredProducts([]);
    setSearchedBarcode('');
    setSapArticle('');
    setHasFile(false);
    setMessage(successMessage);
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePrintTypeChange = (newPrintType) => {
    setDefaultPrintType(newPrintType);
    const typeName = newPrintType === 'qr' ? 'QR-код' : 'Code-128';
    setMessage(`Настройка печати изменена на ${typeName}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleQrSizeChange = (newSize) => {
    setQrSize(newSize);
    setMessage(`Размер QR-кода изменен на ${newSize}px`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCode128SizeChange = (newSize) => {
    setCode128Size(newSize);
    setMessage(`Размер Code-128 изменен на ${newSize.width}x${newSize.height}px`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTextSizeChange = (newSize) => {
    setTextSize(newSize);
    setMessage(`Размер текста изменен на ${newSize}px`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          СберЛогистика · Печать ШК
        </h1>
      </header>

      <main className="app-main">
        <SearchSection 
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        <ProductList 
          products={filteredProducts}
          sapArticle={sapArticle}
          searchedBarcode={searchedBarcode}
          isLoading={isSearching}
          defaultPrintType={defaultPrintType}
          qrSize={qrSize}
          code128Size={code128Size}
          textSize={textSize}
        />

        {message && (
          <div className={`message ${message.includes('загружено') || message.includes('удален') || message.includes('изменена') ? 'success' : 'error'}`}>
            <div className="message-content">
              <span className="message-icon">
                {message.includes('загружено') || message.includes('удален') || message.includes('изменена') ? '✅' : '❌'}
              </span>
              <span className="message-text">{message}</span>
            </div>
          </div>
        )}
      </main>

      <SettingsButton 
        onClick={() => setIsModalOpen(true)}
        hasFile={hasFile}
      />

      <SettingsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        hasFile={hasFile}
        defaultPrintType={defaultPrintType}
        onPrintTypeChange={handlePrintTypeChange}
        qrSize={qrSize}
        onQrSizeChange={handleQrSizeChange}
        code128Size={code128Size}
        onCode128SizeChange={handleCode128SizeChange}
        textSize={textSize}
        onTextSizeChange={handleTextSizeChange}
      />
    </div>
  );
}

export default App;