import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MobileVersion.css';
import { calculateLoss, isCloseEnough, CONFIG } from '../lib/utils';

/**
 * MobileVersion component - A simplified version of RetroTV for mobile devices
 * with vertically stacked layout and simplified controls
 */
const MobileVersion = ({ 
  targetImage = '/images/great-horned-owl.jpg',
  numKnobs = 4,
  targetValues = CONFIG.OPTIMAL_TARGET_VALUES
}) => {
  // Track parameter values and success state
  const [params, setParams] = useState(Array(numKnobs).fill(0.5));
  const [isPerfectlyTuned, setIsPerfectlyTuned] = useState(false);
  
  // Use the optimal solution values from CONFIG
  const actualTargets = CONFIG.OPTIMAL_TARGET_VALUES;
  
  // Calculate current loss based on params
  const loss = calculateLoss(params, actualTargets);
  
  // Calculate image opacity based on loss
  const getImageOpacity = () => {
    const nonLinearOpacity = Math.pow(1 - loss, 0.6);
    const thresholdBoost = loss < 0.3 ? 0.3 : 0;
    return Math.max(0, Math.min(1, nonLinearOpacity + thresholdBoost));
  };
  
  // Handle knob value changes
  const handleKnobChange = (index, newValue) => {
    setParams(currentParams => {
      const newParams = [...currentParams];
      newParams[index] = newValue;
      
      // Check if this adjustment made the TV perfectly tuned
      if (isCloseEnough(newParams, actualTargets)) {
        setIsPerfectlyTuned(true);
      } else {
        setIsPerfectlyTuned(false);
      }
      
      return newParams;
    });
  };
  
  // Randomize parameter values
  const handleRandomize = () => {
    const randomParams = Array.from({ length: numKnobs }, () => {
      return Math.floor(Math.random() * 11) / 10;
    });
    setParams(randomParams);
    setIsPerfectlyTuned(false);
  };
  
  // Determine static class based on loss level
  const getStaticClass = () => {
    if (loss > 0.6) return 'high-static';
    if (loss > 0.25) return 'medium-static';
    if (loss > 0.1) return 'low-static';
    return '';
  };
  
  return (
    <div className="mobile-tv">
      <h1 className="mobile-title">Grandma's Television</h1>
      <p className="mobile-subtitle">
        Tune the knobs to clear the static!
      </p>
      
      {/* TV Screen */}
      <div className="mobile-screen-container">
        <div className={`mobile-screen ${getStaticClass()}`}>
          <img 
            src={targetImage} 
            alt="Target" 
            className="mobile-target-image"
            style={{ opacity: getImageOpacity() }}
          />
          
          {/* Success message */}
          {isPerfectlyTuned && (
            <div className="mobile-success-message">
              <h2>Perfect Tuning!</h2>
              <p>You've found the right knob settings!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Static Level Indicator */}
      <div className="mobile-static-meter">
        <div className="mobile-meter-label">Static Level: {Math.round(loss * 100)}%</div>
        <div className="mobile-meter-track">
          <div 
            className="mobile-meter-fill" 
            style={{ width: `${Math.round(loss * 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Knobs */}
      <div className="mobile-knobs-container">
        {params.map((value, i) => (
          <div key={`knob-${i}`} className="mobile-knob-wrapper">
            <div className="mobile-knob-label">Knob {i + 1}</div>
            <input
              type="range"
              min="0"
              max="10"
              value={Math.round(value * 10)}
              onChange={(e) => handleKnobChange(i, parseInt(e.target.value) / 10)}
              className="mobile-knob"
            />
            <div className="mobile-knob-value">{Math.round(value * 10) + 1}</div>
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="mobile-controls">
        <button 
          className="mobile-button randomize"
          onClick={handleRandomize}
        >
          Randomize
        </button>
      </div>
      
      {/* Info */}
      <div className="mobile-info">
        <p>
          For the full interactive experience with auto-tuning and more features,
          please visit on a desktop or laptop.
        </p>
        <div className="mobile-logo">
          <a href="https://research.kennesaw.edu" target="_blank" rel="noopener noreferrer">
            <img src="/images/horizontal-ksu-oor-logo.png" alt="KSU Logo" />
          </a>
        </div>
      </div>
    </div>
  );
};

MobileVersion.propTypes = {
  targetImage: PropTypes.string,
  numKnobs: PropTypes.number,
  targetValues: PropTypes.arrayOf(PropTypes.number)
};

export default MobileVersion;