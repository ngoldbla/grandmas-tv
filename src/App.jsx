/**
 * Grandma's Television - An SGD Visualizer
 * 
 * Author: Dylan Goldblatt, Office of Research, Kennesaw State University
 * Created for "Transformer 2025: AI and the Future of Games"
 */

import React, { useState } from 'react';
import RetroTV from './components/RetroTV';
import { CONFIG } from './lib/utils';
import './App.css';

/**
 * Application Configuration
 * These values can be adjusted to customize the app behavior
 */
const APP_CONFIG = {
  // Path to the target image (change this to use a different image)
  targetImage: '/images/great-horned-owl.jpg',
  
  // Number of knobs to display
  numKnobs: 4,
  
  // Target values for each knob (ideal values to reach)
  // Using the optimal solution values
  targetValues: CONFIG.OPTIMAL_TARGET_VALUES,
  
  // Whether to show the target values as labels on the knobs
  showTargetValues: false,
  
  // Speed of auto-tuning in milliseconds between steps
  autoTuneSpeed: 500,
  
  // Position knobs on the right side instead of bottom
  knobsPosition: 'right',
  
  // Audio disabled due to mixing issues
  enableAudio: false
};

/**
 * Main App component
 * Renders the RetroTV component with the configured options
 */
function App() {
  const [showInfoBox, setShowInfoBox] = useState(true);
  
  const handleToggleInfoBox = () => {
    setShowInfoBox(prev => !prev);
  };

  return (
    <div className="app">
      <main className="main-content">
        <RetroTV 
          targetImage={APP_CONFIG.targetImage}
          numKnobs={APP_CONFIG.numKnobs}
          targetValues={APP_CONFIG.targetValues}
          showTargetValues={APP_CONFIG.showTargetValues}
          autoTuneSpeed={APP_CONFIG.autoTuneSpeed}
          enableAudio={APP_CONFIG.enableAudio}
          showInfoBox={showInfoBox}
          onToggleInfoBox={handleToggleInfoBox}
        />
      </main>
    </div>
  );
}

export default App;