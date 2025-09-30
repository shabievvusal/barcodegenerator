import React, { useRef, useState } from 'react';
import { excelAPI } from '../services/api';

const FileUpload = ({ onUploadSuccess, onDeleteSuccess }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      alert('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Файл слишком большой (максимум 50MB)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await excelAPI.uploadFile(file);
      
      if (result.success) {
        onUploadSuccess(result.products, result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert(`Ошибка при загрузке файла: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDeleteFile = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить файл?')) return;

    try {
      const result = await excelAPI.deleteFile();
      
      if (result.success) {
        onDeleteSuccess(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      alert(`Ошибка при удалении файла: ${error.message}`);
    }
  };

  return (
    <div className="file-upload-section">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">📊</div>
          <h3>Перетащите Excel файл сюда</h3>
          <p>или нажмите для выбора файла</p>
          <p className="file-info">Поддерживаются .xlsx, .xls (макс. 50MB)</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </div>

      <button 
        className="delete-btn"
        onClick={handleDeleteFile}
        disabled={isLoading}
      >
        🗑️ Удалить файл
      </button>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Загрузка файла...</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;