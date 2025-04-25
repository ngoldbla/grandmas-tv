/**
 * Grandma's Television - Main Component
 * 
 * Author: Dylan Goldblatt, Office of Research, Kennesaw State University
 * Created for "Transformer 2025: AI and the Future of Games"
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import TVScreen from './TVScreen';
import Knob from './Knob';
import LossMeter from './LossMeter';
import { 
  calculateLoss, 
  performSGDStep, 
  generateRandomParams,
  isCloseEnough,
  calculateGradients,
  CONFIG
} from '../lib/utils';
import './RetroTV.css';

// Audio files - use local sounds directory that can be customized by the user
// Commented out audio files due to issues with audio mixing
/*
const STATIC_AUDIO_URL = '/sounds/tv-static.mp3'; // TV static sound
const MUSIC_AUDIO_URL = '/sounds/yo-yo-ma-bach.mp3'; // Yo-Yo Ma Bach: Cello Suite No. 1 in G Major, Prélude
*/

/**
 * Main RetroTV component that integrates all other components
 * Manages the state and interaction logic for the SGD visualization
 */
const RetroTV = ({ 
  targetImage = '/images/great-horned-owl.jpg',
  numKnobs = 4,
  targetValues = CONFIG.DEFAULT_TARGET_VALUES,
  showTargetValues = false,
  autoTuneSpeed = 500, // ms between auto-tune steps
  knobsPosition = 'right', // 'right' or 'bottom'
  enableAudio = true,
  showInfoBox = true,
  onToggleInfoBox = () => {}
}) => {
  // State for parameter values, auto-tuning, and highlighting
  // Start with maximum static every time (same as the Maximum Static button)
  const initialParamsRef = useRef(() => {
    // Create parameters that are maximally distant from the optimal values
    return Array.from({ length: numKnobs }, (_, i) => {
      // Get opposite of the target value to maximize loss
      const targetValue = CONFIG.OPTIMAL_TARGET_VALUES[i];
      // If target is low, choose high; if target is high, choose low
      return targetValue <= 0.5 ? 0.9 : 0.1;
    });
  });
  const [params, setParams] = useState(initialParamsRef.current);
  const [isAutoTuning, setIsAutoTuning] = useState(false);
  const [highlightedKnob, setHighlightedKnob] = useState(-1);
  const [isPerfectlyTuned, setIsPerfectlyTuned] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [solvedByUser, setSolvedByUser] = useState(false); // Track if user manually solved it
  
  // References for audio elements - commented out due to audio mixing issues
  /*
  const staticAudioRef = useRef(null);
  const musicAudioRef = useRef(null);
  */
  
  // Always use the optimal solution values from CONFIG - this is the "puzzle solution"
  const actualTargets = useRef(CONFIG.OPTIMAL_TARGET_VALUES).current;
  
  // Calculate current loss based on params and the optimal solution
  const loss = calculateLoss(params, actualTargets);
  
  // Audio control based on loss value - true proportional mixing
  // Commented out due to audio mixing issues
  /*
  useEffect(() => {
    if (!enableAudio) return;
    
    // Create audio elements if they don't exist
    if (!staticAudioRef.current) {
      staticAudioRef.current = new Audio(STATIC_AUDIO_URL);
      staticAudioRef.current.loop = true;
    }
    
    if (!musicAudioRef.current) {
      musicAudioRef.current = new Audio(MUSIC_AUDIO_URL);
      musicAudioRef.current.loop = true;
    }
    
    // Create exponential curve for audio transition
    // Small decreases in loss lead to big improvements in audio quality
    const normalizedLoss = Math.pow(loss, 0.6); // Make transition more dramatic at lower loss values
    
    // Total audio volume remains constant (1.0) as we shift the mix between static and music
    // As loss approaches 0, we shift from mostly static to mostly music
    
    // Calculate proportional mix weights - exactly as requested:
    // High loss = more static, less music
    // Low loss = less static, more music
    const staticWeight = normalizedLoss;          // 0.0 (perfect) to 1.0 (terrible)
    const musicWeight = 1 - normalizedLoss;       // 1.0 (perfect) to 0.0 (terrible)
    
    // Apply the mix
    staticAudioRef.current.volume = staticWeight;
    musicAudioRef.current.volume = musicWeight;
    
    // Make sure audio is playing
    const playAudio = async () => {
      try {
        if (staticAudioRef.current.paused) {
          await staticAudioRef.current.play();
        }
        if (musicAudioRef.current.paused) {
          await musicAudioRef.current.play();
        }
      } catch (error) {
        console.log('Audio autoplay prevented by browser. User interaction required.');
      }
    };
    
    playAudio();
    
    // Cleanup function to pause audio when component unmounts
    return () => {
      if (staticAudioRef.current) staticAudioRef.current.pause();
      if (musicAudioRef.current) musicAudioRef.current.pause();
    };
  }, [loss, enableAudio]);
  */
  
  // Handle changing an individual knob's value
  const handleKnobChange = useCallback((index, newValue) => {
    // The Knob component now passes values that are already snapped to whole numbers
    // But we'll add it here too for consistency
    
    // Convert to scale value (1-11) and back to ensure it's snapped
    const scaleValue = Math.min(11, Math.max(1, Math.round(1 + newValue * 10)));
    const snappedValue = (scaleValue - 1) / 10;
    
    setParams(currentParams => {
      const newParams = [...currentParams];
      newParams[index] = snappedValue;
      
      // Check if this adjustment made the TV perfectly tuned
      if (isCloseEnough(newParams, actualTargets)) {
        // User manually tuned the TV to perfection!
        setIsPerfectlyTuned(true);
        setSolvedByUser(true);
      } else {
        // Not perfectly tuned yet
        setIsPerfectlyTuned(false);
        setSolvedByUser(false);
      }
      
      return newParams;
    });
    
    // Stop auto-tuning if the user manually adjusts a knob
    if (isAutoTuning) {
      setIsAutoTuning(false);
    }
  }, [isAutoTuning, actualTargets]);
  
  // Auto-tuning effect - true SGD implementation that visually demonstrates the process
  useEffect(() => {
    if (!isAutoTuning) return;
    
    // Remove all highlights during auto-tuning
    setHighlightedKnob(-1);
    
    // Track iterations for demo purposes
    let iteration = 0;
    const maxIterations = 50; // Safety limit to prevent infinite loops
    
    // Use an interval for visual demonstration
    const intervalId = setInterval(() => {
      // Update params with SGD step
      setParams(currentParams => {
        // Occasionally highlight which parameter is being modified to visualize the process
        const shouldHighlight = Math.random() > 0.6; // 40% chance to highlight a knob
        
        if (shouldHighlight) {
          // Pick a random parameter to highlight (simulates which one SGD is focusing on)
          const paramToHighlight = Math.floor(Math.random() * numKnobs);
          // Schedule the highlight to be cleared after a short period
          setHighlightedKnob(paramToHighlight);
          setTimeout(() => setHighlightedKnob(-1), 200); // Clear highlight after 200ms
        }
        
        // Perform SGD step with appropriate learning rate
        // Use a more aggressive learning rate for better demo performance
        const learningRate = CONFIG.LEARNING_RATE * 1.2;
        
        // Get new parameter values from SGD algorithm
        const newParams = performSGDStep(currentParams, actualTargets, learningRate);
        
        // Check if we've reached the target
        if (isCloseEnough(newParams, actualTargets) || iteration > maxIterations) {
          // Stop interval but don't set solvedByUser since this was auto-tuning
          setIsAutoTuning(false);
          setIsPerfectlyTuned(true);
          setSolvedByUser(false); // Explicitly mark as NOT solved by user
          setHighlightedKnob(-1); // Ensure no knob remains highlighted
        }
        
        // Increment iteration counter
        iteration++;
        
        return newParams;
      });
    }, autoTuneSpeed);
    
    // Clean up interval on unmount or when auto-tuning stops
    return () => {
      clearInterval(intervalId);
      setHighlightedKnob(-1); // Clear any highlights on cleanup
    };
  }, [isAutoTuning, numKnobs, actualTargets, autoTuneSpeed]);
  
  // Start auto-tuning process
  const handleAutoTune = () => {
    setIsAutoTuning(true);
    setHighlightedKnob(-1); // No highlighted knob during auto-tuning
    setIsPerfectlyTuned(false);
  };
  
  // Reset parameters to random values with high static
  const handleReset = () => {
    setParams(generateRandomParams(numKnobs, true));
    setIsAutoTuning(false);
    setHighlightedKnob(-1);
    setIsPerfectlyTuned(false);
  };
  
  // Creates a deliberately chaotic state with maximum static
  const handleRandomStatic = () => {
    // Generate parameters that are deliberately far from the optimal values
    // This ensures high static and a challenging starting point
    const chaosParams = Array.from({ length: numKnobs }, (_, i) => {
      // Get opposite of the target value to maximize loss
      const targetValue = actualTargets[i];
      let farValue;
      
      if (targetValue <= 0.5) {
        // If target is low, choose a high value
        farValue = 0.9;
      } else {
        // If target is high, choose a low value
        farValue = 0.1;
      }
      
      // Add some randomness to make it less predictable
      const randomOffset = (Math.random() > 0.5 ? 0.1 : -0.1);
      return Math.min(1, Math.max(0, farValue + randomOffset));
    });
    
    setParams(chaosParams);
    setIsAutoTuning(false);
    setHighlightedKnob(-1);
    setIsPerfectlyTuned(false);
  };
  
  // Toggle showing the target image
  const handleToggleImage = () => {
    setShowImage(prev => !prev);
  };
  
  // Toggle info box using the prop function
  const handleToggleInfoBox = () => {
    onToggleInfoBox();
  };

  // Toggle audio on/off - commented out due to audio mixing issues
  /*
  const handleToggleAudio = () => {
    if (!staticAudioRef.current || !musicAudioRef.current) return;
    
    if (staticAudioRef.current.paused) {
      staticAudioRef.current.play();
      musicAudioRef.current.play();
    } else {
      staticAudioRef.current.pause();
      musicAudioRef.current.pause();
    }
  };
  */
  
  // Determine the layout class based on knob position
  const layoutClass = knobsPosition === 'right' ? 'horizontal-layout' : 'vertical-layout';
  
  return (
    <div className={`retro-tv ${layoutClass}`}>
      {/* Left side panel with info, controls, and error meter */}
      <div className="tv-left-panel">
        {showInfoBox && (
          <div className="tv-info-section">
            <h3>Grandma's Television</h3>
            <p>
              Can you tune away the snow? Only one dial setting (1 – 11) 
              wipes out the static and sharpens the picture.
            </p>
            <p>
              Spin the knobs to minimize the noise, or click a number to jump straight there.
              Lower static means you're getting closer to the solution!
            </p>
            <p>
              Feeling curious? Hit Auto SGD and watch stochastic gradient descent
              zero-in on the perfect setting for you.
            </p>
            <div className="info-box-logo">
              <a href="https://research.kennesaw.edu" target="_blank" rel="noopener noreferrer">
                <img src="/images/horizontal-ksu-oor-logo.png" alt="KSU Logo" className="info-logo" />
              </a>
            </div>
          </div>
        )}
        
        <div className="button-controls vertical">
          <button 
            className={`control-button ${isAutoTuning ? 'active' : ''}`}
            onClick={handleAutoTune}
            disabled={isAutoTuning || isPerfectlyTuned}
          >
            Auto SGD
          </button>
          
          <button 
            className="control-button danger"
            onClick={handleRandomStatic}
            disabled={isAutoTuning}
          >
            Randomize Static
          </button>
          
          
        </div>
        
        <div className="drawer-meter-container">
          <LossMeter loss={loss} />
        </div>
      </div>
      
      {/* The TV as a complete, rectangular unit */}
      <div className="tv-body">
        <div className="tv-content">
          <div className="tv-screen-section">
            <TVScreen 
              loss={loss}
              imageSrc={targetImage}
              showImage={showImage}
              perfectTuning={isPerfectlyTuned}
              solvedByUser={solvedByUser}
            />
          </div>
          
          <div className={`tv-controls-section ${knobsPosition}`}>
            <div className="knobs-container">
              {params.map((value, i) => (
                <Knob
                  key={`knob-${i}`}
                  index={i}
                  value={value}
                  onChange={(newValue) => handleKnobChange(i, newValue)}
                  highlighted={i === highlightedKnob}
                  label={showTargetValues ? `Target: ${Math.round(actualTargets[i] * 100)}%` : undefined}
                  sensitivity={0.01} // Increased sensitivity for easier turning
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RetroTV.propTypes = {
  targetImage: PropTypes.string,
  numKnobs: PropTypes.number,
  targetValues: PropTypes.arrayOf(PropTypes.number),
  showTargetValues: PropTypes.bool,
  autoTuneSpeed: PropTypes.number,
  knobsPosition: PropTypes.oneOf(['right', 'bottom']),
  enableAudio: PropTypes.bool,
  showInfoBox: PropTypes.bool,
  onToggleInfoBox: PropTypes.func
};

export default RetroTV;