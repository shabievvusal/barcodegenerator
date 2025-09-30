import React from 'react';

const SettingsButton = ({ onClick, hasFile }) => {
  return (
    <button className="settings-button" onClick={onClick}>
      <span className="settings-icon">⚙️</span>
      {hasFile && <span className="file-indicator"></span>}
    </button>
  );
};

export default SettingsButton;