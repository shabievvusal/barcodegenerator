import React, { useRef, useState } from 'react';
import { excelAPI } from '../services/api';

const SettingsModal = ({ isOpen, onClose, onFileUpload, onFileDelete, hasFile, defaultPrintType, onPrintTypeChange }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      alert('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
      return;
    }

    // Проверка размера файла (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB в байтах
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 50MB');
      return;
    }

    // Сохраняем информацию о файле
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: fileExtension.toUpperCase()
    });

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // Симуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await excelAPI.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (result.success) {
          onFileUpload(result.products, result.message);
          onClose();
        } else {
          alert(result.message);
        }
        setIsLoading(false);
        setUploadProgress(0);
        setFileInfo(null);
      }, 500);
      
    } catch (error) {
      setIsLoading(false);
      setUploadProgress(0);
      setFileInfo(null);
      alert('Ошибка при загрузке файла: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить загруженный Excel файл? Это действие нельзя отменить.')) return;

    setIsLoading(true);
    try {
      const result = await excelAPI.deleteFile();
      
      if (result.success) {
        onFileDelete(result.message);
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Ошибка при удалении файла: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">📊</div>
            <h2>Управление Excel файлом</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Настройки печати */}
          <div className="print-settings">
            <h3 style={{color: '#000000', fontWeight: '700', marginBottom: '16px'}}>Настройки печати</h3>
            <div className="print-type-selector">
              <label className="print-type-option">
                <input
                  type="radio"
                  name="printType"
                  value="qr"
                  checked={defaultPrintType === 'qr'}
                  onChange={(e) => onPrintTypeChange(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">📱</span>
                  <span className="option-text">QR-код</span>
                </span>
              </label>
              <label className="print-type-option">
                <input
                  type="radio"
                  name="printType"
                  value="code128"
                  checked={defaultPrintType === 'code128'}
                  onChange={(e) => onPrintTypeChange(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">📊</span>
                  <span className="option-text">Code-128</span>
                </span>
              </label>
            </div>
          </div>

          {hasFile ? (
            <div className="file-status">
              <div className="status-success">
                <div className="status-icon">✅</div>
                <div className="status-content">
                  <h3>Файл успешно загружен</h3>
                  <p>Excel файл готов к использованию для поиска штрихкодов</p>
                </div>
              </div>
              <div className="file-actions">
                <button 
                  className="delete-file-btn"
                  onClick={handleDeleteFile}
                  disabled={isLoading}
                >
                  <span className="btn-icon">🗑️</span>
                  Удалить файл
                </button>
              </div>
            </div>
          ) : (
            <div className="file-upload-section">
              <div 
                className={`upload-area ${dragActive ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">
                  {dragActive ? '📥' : '📊'}
                </div>
                <h3 style={{color: '#1e293b', fontWeight: '700', textShadow: '0 1px 2px rgba(0,0,0,0.1)'}}>
                  {dragActive ? 'Отпустите файл для загрузки' : 'Перетащите Excel файл сюда'}
                </h3>
                <p style={{color: '#374151', fontWeight: '500'}}>или нажмите для выбора файла</p>
                <div className="file-requirements">
                  <div className="requirement-item" style={{color: '#000000', fontWeight: '700', fontSize: '1rem'}}>
                    <span className="requirement-icon" style={{fontSize: '1.2rem', opacity: 1}}>📄</span>
                    <span style={{color: '#000000', fontWeight: '700'}}>Формат: .xlsx, .xls</span>
                  </div>
                  <div className="requirement-item" style={{color: '#000000', fontWeight: '700', fontSize: '1rem'}}>
                    <span className="requirement-icon" style={{fontSize: '1.2rem', opacity: 1}}>📏</span>
                    <span style={{color: '#000000', fontWeight: '700'}}>Размер: до 50MB</span>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="spinner"></div>
                <h3>Загрузка файла...</h3>
                {fileInfo && (
                  <div className="file-info-display">
                    <p><strong>{fileInfo.name}</strong></p>
                    <p>{fileInfo.size} • {fileInfo.type}</p>
                  </div>
                )}
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;