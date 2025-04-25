/**
 * Grandma's Television - TV Screen Component
 * 
 * Author: Dylan Goldblatt, Office of Research, Kennesaw State University
 * Created for "Transformer 2025: AI and the Future of Games"
 */

import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { generateNoise, CONFIG } from '../lib/utils';
import './TVScreen.css';

/**
 * The TV screen component that displays the image and noise overlay
 * Renders using SVG for better scalability and responsiveness
 * Static version - no animation for better performance
 */
const TVScreen = ({ 
  loss, 
  imageSrc, 
  showImage = true,
  perfectTuning = false,
  solvedByUser = false
}) => {
  const screenRef = useRef(null);
  const [noise, setNoise] = useState([]);
  
  // Generate static noise pattern once when loss changes - no animation
  useEffect(() => {
    if (!screenRef.current) return;
    
    // Get screen dimensions for noise generation
    const { width, height } = screenRef.current.getBoundingClientRect();
    
    // Use a fixed seed for more consistent performance
    const staticSeed = CONFIG.NOISE_SEED + 12345;
    
    // Generate new noise pattern - single generation, no animation
    const newNoise = generateNoise(loss, width, height, staticSeed);
    setNoise(newNoise);
    
  }, [loss]);

  // Calculate image opacity based on loss value (inverse relationship)
  // More loss = less image visibility with non-linear falloff (steeper near zero)
  const getImageOpacity = () => {
    // Non-linear relationship for more dramatic improvement as loss approaches 0
    // The image becomes visible more quickly at lower loss values
    // Power < 1 makes the curve steeper at the beginning
    const nonLinearOpacity = Math.pow(1 - loss, 0.6);
    
    // Add threshold effect: below 0.3 loss, image becomes much clearer quickly
    const thresholdBoost = loss < 0.3 ? 0.3 : 0;
    
    return Math.max(0, Math.min(1, nonLinearOpacity + thresholdBoost));
  };
  
  // Display congratulatory message when perfect tuning is achieved by the user
  const renderPerfectTuningOverlay = () => {
    // Only show the success message if both perfectly tuned AND solved by the user
    if (!perfectTuning || !solvedByUser) return null;
    
    return (
      <div className="perfect-tuning-overlay">
        <div className="perfect-tuning-message">
          <h2>Perfect Tuning!</h2>
          <p>You've solved the puzzle! The TV is perfectly tuned.</p>
          <p className="small-text">
            (The correct knob settings were found)
          </p>
        </div>
      </div>
    );
  };
  
  // Render noise as SVG rectangles - simplified with no animation key
  const renderNoise = () => {
    return noise.map((pixel, i) => (
      <rect
        key={`noise-${i}`}
        x={pixel.x}
        y={pixel.y}
        width={pixel.width}
        height={pixel.height}
        fill={pixel.color || 'white'}
        opacity={pixel.intensity * Math.min(1, Math.max(0.2, loss))}
      />
    ));
  };
  
  // Determine static class based on loss level
  // Adjusted thresholds to match our new loss model
  const getStaticClass = () => {
    if (loss > 0.6) return 'high-static';
    if (loss > 0.25) return 'medium-static';
    if (loss > 0.1) return 'low-static';
    return ''; // No extra static when perfectly tuned
  };

  return (
    <div className="tv-screen-container">
      <div className={`tv-screen ${getStaticClass()}`} ref={screenRef}>
        {/* The hidden true image that gradually becomes visible */}
        {showImage && (
          <img 
            src={imageSrc} 
            alt="Target" 
            className="target-image"
            style={{ opacity: getImageOpacity() }}
          />
        )}
        
        {/* SVG overlay for noise/static - minimal version for performance */}
        <svg className="noise-overlay">
          {renderNoise()}
        </svg>
        
        {/* Congratulations overlay when perfect tuning is achieved */}
        {renderPerfectTuningOverlay()}
      </div>
    </div>
  );
};

TVScreen.propTypes = {
  loss: PropTypes.number.isRequired,
  imageSrc: PropTypes.string.isRequired,
  showImage: PropTypes.bool,
  perfectTuning: PropTypes.bool,
  solvedByUser: PropTypes.bool
};

export default TVScreen;