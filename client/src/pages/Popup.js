import React from 'react';
import './Popup.css';

const CustomPopup = ({ message, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <h2>{message}</h2>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default CustomPopup;
