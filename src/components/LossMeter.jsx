import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './LossMeter.css';

/**
 * LossMeter displays the current loss/clarity value as a meter
 * Shows visual feedback on how well the TV is tuned
 */
const LossMeter = ({ loss, showDigital = true, vertical = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calculate the position on the meter
  // Using a more linear scale so percentages are more proportional
  const calculateMeterPosition = () => {
    // Direct linear scale: 0 loss = 0% meter, high loss = 100% meter
    if (loss <= 0) return 0;
    if (loss >= 1) return 100;
    
    // Linear scale with slight adjustment to make low values more visible
    // This ensures 10% static will use ~10% of the bar width
    return loss * 100;
  };
  
  const meterPosition = calculateMeterPosition();
  
  // Format the loss value for display as a percentage
  const formatLoss = () => {
    if (loss < 0.01) return '0%';
    if (loss === 0) return '0%';
    if (loss >= 1) return '100%';
    
    // Convert to percentage with no decimal points
    return Math.round(loss * 100) + '%';
  };
  
  if (vertical) {
    return (
      <div className="loss-meter-container vertical">
        <div className="loss-meter-label vertical">
          <span>NOISE LEVEL</span>
        </div>
        <div className="loss-meter vertical">
          <div className="loss-meter-bar vertical">
            {/* Perfect picture label at bottom */}
            <div className="end-label bottom-label">
              <span>↓ Perfect picture</span>
            </div>
            
            {/* Full static label at top */}
            <div className="end-label top-label">
              <span>Full static</span>
            </div>
            
            {/* Neutral track */}
            <div className="meter-track vertical">
              {/* Percentage labels at the ends */}
              <div className="track-label top">100%</div>
              <div className="track-label bottom">0%</div>
              
              {/* Filled portion with gradient */}
              <div 
                className="meter-fill vertical" 
                style={{ 
                  height: `${meterPosition}%`
                }}
              >
                {/* Only show value badge if there's some static */}
                {meterPosition > 0 && (
                  <div 
                    className={`value-badge vertical ${meterPosition > 30 ? 'dark-text' : ''}`}
                  >
                    {formatLoss()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="loss-meter-container">
      <div className="loss-meter-label">
        <div className="meter-title">
          <span className="bold">Noise Level</span>
          <span 
            className="question-mark" 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            ?
            {showTooltip && (
              <span className="tooltip">Lower noise means clearer picture. 0% = perfect clarity.</span>
            )}
          </span>
        </div>
      </div>
      <div className="loss-meter">
        <div className="loss-meter-bar">
          {/* Perfect picture label on left */}
          <div className="end-label left-label">
            <span>← Perfect picture</span>
          </div>
          
          {/* Full static label on right */}
          <div className="end-label right-label">
            <span>Full static</span>
          </div>
          
          {/* Neutral track */}
          <div className="meter-track">
            {/* Percentage labels at the ends */}
            <div className="track-label left">0%</div>
            <div className="track-label right">100%</div>
            
            {/* Filled portion with gradient */}
            <div 
              className="meter-fill" 
              style={{ 
                width: `${meterPosition}%`
              }}
            >
              {/* Only show value badge if there's some static */}
              {meterPosition > 0 && (
                <div 
                  className={`value-badge ${meterPosition > 30 ? 'dark-text' : ''}`}
                >
                  {formatLoss()} static
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LossMeter.propTypes = {
  loss: PropTypes.number.isRequired,
  showDigital: PropTypes.bool,
  vertical: PropTypes.bool
};

export default LossMeter;