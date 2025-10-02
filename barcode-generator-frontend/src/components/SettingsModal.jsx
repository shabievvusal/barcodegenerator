import React, { useRef, useState, useEffect, useCallback } from 'react';
import { excelAPI } from '../services/api';

const SettingsModal = ({ isOpen, onClose, onFileUpload, onFileDelete, hasFile, defaultPrintType, onPrintTypeChange, qrSize, onQrSizeChange, code128Size, onCode128SizeChange, textSize, onTextSizeChange, animationsEnabled, onAnimationsToggle }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Функции для работы с настройками
  const saveSettings = useCallback(() => {
    const settings = {
      defaultPrintType,
      qrSize,
      code128Size,
      textSize,
      animationsEnabled
    };
    localStorage.setItem('barcodeGeneratorSettings', JSON.stringify(settings));
    console.log('✅ Настройки сохранены');
    setSaveMessage('✅ Настройки сохранены!');
    setTimeout(() => setSaveMessage(''), 3000);
  }, [defaultPrintType, qrSize, code128Size, textSize, animationsEnabled]);

  const loadSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('barcodeGeneratorSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('✅ Настройки загружены из localStorage');
        return settings;
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
    return null;
  }, []);

  // Загружаем настройки только при первом открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const savedSettings = loadSettings();
      if (savedSettings) {
        // Применяем сохраненные настройки только если они отличаются
        if (savedSettings.defaultPrintType && savedSettings.defaultPrintType !== defaultPrintType) {
          onPrintTypeChange(savedSettings.defaultPrintType);
        }
        if (savedSettings.qrSize && savedSettings.qrSize !== qrSize) {
          onQrSizeChange(savedSettings.qrSize);
        }
        if (savedSettings.code128Size && JSON.stringify(savedSettings.code128Size) !== JSON.stringify(code128Size)) {
          onCode128SizeChange(savedSettings.code128Size);
        }
        if (savedSettings.textSize && savedSettings.textSize !== textSize) {
          onTextSizeChange(savedSettings.textSize);
        }
        if (savedSettings.animationsEnabled !== undefined && savedSettings.animationsEnabled !== animationsEnabled) {
          onAnimationsToggle(savedSettings.animationsEnabled);
        }
      }
    }
  }, [isOpen]); // Убираем зависимости, чтобы избежать бесконечного цикла

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
            <h2>Настройки</h2>
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
            
            {/* Настройки размера QR-кода */}
            <div className="size-settings">
              <h4 style={{color: '#000000', fontWeight: '600', marginBottom: '12px'}}>Размер QR-кода</h4>
              <div className="size-input-group">
                <label className="size-label">
                  <span>Размер (px):</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="10"
                    value={qrSize}
                    onChange={(e) => onQrSizeChange(parseInt(e.target.value))}
                    className="size-input"
                  />
                </label>
              </div>
            </div>
            
            {/* Настройки размера Code-128 */}
            <div className="size-settings">
              <h4 style={{color: '#000000', fontWeight: '600', marginBottom: '12px'}}>Размер Code-128</h4>
              <div className="size-input-group">
                <label className="size-label">
                  <span>Ширина (px):</span>
                  <input
                    type="number"
                    min="200"
                    max="800"
                    step="50"
                    value={code128Size.width}
                    onChange={(e) => onCode128SizeChange({...code128Size, width: parseInt(e.target.value)})}
                    className="size-input"
                  />
                </label>
                <label className="size-label">
                  <span>Высота (px):</span>
                  <input
                    type="number"
                    min="50"
                    max="300"
                    step="10"
                    value={code128Size.height}
                    onChange={(e) => onCode128SizeChange({...code128Size, height: parseInt(e.target.value)})}
                    className="size-input"
                  />
                </label>
              </div>
            </div>
            
            {/* Настройки размера текста */}
            <div className="size-settings">
              <h4 style={{color: '#000000', fontWeight: '600', marginBottom: '12px'}}>Размер текста</h4>
              <div className="size-input-group">
                <label className="size-label">
                  <span>Размер шрифта (px):</span>
                  <input
                    type="number"
                    min="6"
                    max="24"
                    step="1"
                    value={textSize}
                    onChange={(e) => onTextSizeChange(parseInt(e.target.value))}
                    className="size-input"
                  />
                </label>
              </div>
            </div>

            {/* Настройки производительности */}
            <div className="performance-settings" style={{marginTop: '20px'}}>
              <h4 style={{color: '#000000', fontWeight: '600', marginBottom: '12px'}}>⚡ Производительность</h4>
              <div className="toggle-setting" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{color: '#1e293b', fontWeight: '600', fontSize: '14px'}}>
                    Анимации
                  </span>
                  <p style={{color: '#64748b', fontSize: '12px', margin: '2px 0 0 0'}}>
                    Отключите для улучшения производительности
                  </p>
                </div>
                <label className="toggle-switch" style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={animationsEnabled}
                    onChange={(e) => onAnimationsToggle(e.target.checked)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: animationsEnabled ? '#10b981' : '#cbd5e1',
                    transition: 'background-color 0.2s ease',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: animationsEnabled ? '29px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: 'left 0.2s ease',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
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

          {/* Кнопка сохранения настроек */}
          <div className="settings-actions" style={{
            position: 'sticky',
            bottom: '0',
            background: 'white',
            marginTop: '20px',
            padding: '15px',
            borderTop: '1px solid #e2e8f0',
            zIndex: 10
          }}>
            {saveMessage && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                color: '#047857',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: '10px',
                border: '1px solid #10b981'
              }}>
                {saveMessage}
              </div>
            )}
            <button 
              className="save-settings-btn"
              onClick={saveSettings}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
              }}
            >
              <span>💾</span>
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;