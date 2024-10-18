import React from 'react';
import '../styles/ToggleSwitch.css'; 

// This is the toggle switch on the visuals page to toggle between powerlifting and bodybuilding.

function ToggleSwitch({ isPLView, toggleView }) {
  return (
    <div className="toggle-container">
      {/* PL Option */}
      <div 
        className={`toggle-option ${isPLView ? 'active' : ''}`} 
        onClick={() => !isPLView && toggleView()}
      >
        Powerlifting
      </div>

      {/* Bodybuilding Option */}
      <div 
        className={`toggle-option ${!isPLView ? 'active' : ''}`} 
        onClick={() => isPLView && toggleView()}
      >
        Bodybuilding
      </div>
    </div>
  );
}

export default ToggleSwitch;
