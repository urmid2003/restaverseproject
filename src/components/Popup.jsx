import React from 'react';
import './Popus.css';
const Popup = ({ message, onClose }) => {
  return (
    <div className="popup">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
