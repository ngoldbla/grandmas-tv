/**
 * Grandma's Television - An SGD Visualizer
 * 
 * Author: Dylan Goldblatt, Office of Research, Kennesaw State University
 * Created for "Transformer 2025: AI and the Future of Games"
 */

import React, { useState, useEffect } from 'react';
import RetroTV from './components/RetroTV';
import MobileVersion from './components/MobileVersion';
import MobileWarning from './components/MobileWarning';
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
 * Includes mobile detection and responsive rendering
 */
function App() {
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(false);
  
  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      // Use a combination of screen width and user agent to detect mobile devices
      const mobileWidth = window.innerWidth <= 768;
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      
      const isMobileDevice = mobileWidth || mobileAgent;
      setIsMobile(isMobileDevice);
      
      // Show warning for mobile users
      if (isMobileDevice) {
        // Check if the warning was previously dismissed in this session
        const warningDismissed = sessionStorage.getItem('mobileWarningDismissed');
        if (!warningDismissed) {
          setShowMobileWarning(true);
        } else {
          setMobileWarningDismissed(true);
        }
      }
    };
    
    checkMobile();
    
    // Re-check on window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleToggleInfoBox = () => {
    setShowInfoBox(prev => !prev);
  };
  
  const handleDismissMobileWarning = () => {
    setShowMobileWarning(false);
    setMobileWarningDismissed(true);
    // Store dismissal in session storage to prevent showing it again on page refresh
    sessionStorage.setItem('mobileWarningDismissed', 'true');
  };
  
  return (
    <div className="app">
      <main className="main-content">
        {/* Show desktop version for non-mobile devices */}
        {!isMobile && (
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
        )}
        
        {/* Show mobile version for mobile devices */}
        {isMobile && (
          <MobileVersion 
            targetImage={APP_CONFIG.targetImage}
            numKnobs={APP_CONFIG.numKnobs}
            targetValues={APP_CONFIG.targetValues}
          />
        )}
        
        {/* Mobile warning popup */}
        {showMobileWarning && (
          <MobileWarning onDismiss={handleDismissMobileWarning} />
        )}
      </main>
    </div>
  );
}

export default App;