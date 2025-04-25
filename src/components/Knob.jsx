import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Knob.css';

/**
 * Rotary Knob component for parameter adjustment
 * Redesigned for simple rotation control with dial-style labels
 */
const Knob = ({ 
  value, 
  onChange, 
  label, 
  index, 
  highlighted = false, 
  showValue = false // Not used - we now show 1-11 scale on dial
}) => {
  // References for interaction handling
  const knobRef = useRef(null);
  const knobContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousAngleRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Convert value (0-1) to rotation degrees (0-300)
  const getRotationDegrees = (val) => 30 + val * 300;
  
  // Convert value (0-1) to scale (1-11) - "This one goes to 11"
  const getScaleValue = (val) => {
    return Math.min(11, Math.max(1, Math.round(1 + val * 10)));
  };
  
  // Convert scale value (1-11) to normalized value (0-1)
  const scaleToValue = (scaleVal) => {
    return (scaleVal - 1) / 10;
  };
  
  // Calculate the rotation angle for the knob
  const rotationDegrees = getRotationDegrees(value);
  const currentScaleValue = getScaleValue(value);
  
  // Set up rotary dial label markers
  const dialMarkers = [];
  for (let i = 1; i <= 11; i++) {
    // Convert scale value (1-11) to value (0-1)
    const markerValue = (i - 1) / 10;
    // Convert value to rotation degrees
    const markerDegrees = getRotationDegrees(markerValue);
    dialMarkers.push({ value: i, degrees: markerDegrees });
  }
  
  // Calculate angle between mouse position and knob center
  const calculateAngle = (e) => {
    const knobRect = knobRef.current.getBoundingClientRect();
    const knobCenterX = knobRect.left + knobRect.width / 2;
    const knobCenterY = knobRect.top + knobRect.height / 2;
    
    // Calculate angle in radians
    let angleRadians = Math.atan2(
      e.clientY - knobCenterY,
      e.clientX - knobCenterX
    );
    
    // Convert to degrees (0-360)
    let angleDegrees = angleRadians * (180 / Math.PI) + 90;
    if (angleDegrees < 0) angleDegrees += 360;
    
    return angleDegrees;
  };
  
  // Simplified value calculation that jumps to nearest of 11 steps
  const angleToValue = (angle) => {
    // Just map the angle to the closest of 11 values
    // Regardless of exact position, this makes it much easier to select a specific value
    
    // If in the min/max zones, snap to min/max
    if (angle >= 0 && angle <= 30) {
      return 0; // Min value (1 on scale)
    } else if (angle >= 330 && angle <= 360) {
      return 1; // Max value (11 on scale)
    } 
    
    // For angles between 30 and 330, map to one of 11 values
    // Each value gets ~27 degrees of the circle (300/11)
    const effectiveAngle = angle - 30; // Normalize to 0-300 range
    const sectionSize = 300 / 11; // Size of each of the 11 sections
    
    // Find which section we're in and return the corresponding value
    const section = Math.floor(effectiveAngle / sectionSize);
    return section / 10; // Convert to 0-1 range (0.0, 0.1, 0.2, ..., 1.0)
  };
  
  // Set up event listeners for knob interaction
  useEffect(() => {
    // Handle mouse movement for rotation - simplified for better responsiveness
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      // Calculate angle and immediately convert to one of 11 discrete values
      const angle = calculateAngle(e);
      const newValue = angleToValue(angle);
      
      // Always update the value - the angleToValue function now ensures valid range
      onChange(newValue);
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Simplified touch support
    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length < 1) return;
      
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      
      const angle = calculateAngle(touchEvent);
      const newValue = angleToValue(angle);
      
      // Always update the value
      onChange(newValue);
      
      // Prevent scrolling
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    
    // Only add listeners if dragging is active
    if (isDraggingRef.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onChange, isDraggingRef.current]);
  
  // Handle mouse down to start rotation
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    previousAngleRef.current = calculateAngle(e);
    document.body.style.cursor = 'grabbing';
    
    // Focus management for accessibility
    if (knobRef.current) {
      knobRef.current.focus();
    }
    
    e.preventDefault(); // Prevent text selection
  };
  
  // Handle touch start for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length < 1) return;
    
    const touch = e.touches[0];
    const touchEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    
    isDraggingRef.current = true;
    previousAngleRef.current = calculateAngle(touchEvent);
    
    e.preventDefault(); // Prevent scrolling
  };
  
  // Add keyboard support for accessibility - snap to whole numbers
  const handleKeyDown = (e) => {
    let newScaleValue = getScaleValue(value); // Get current position as scale value (1-11)
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newScaleValue = Math.min(11, newScaleValue + 1); // Increment by 1 position
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newScaleValue = Math.max(1, newScaleValue - 1); // Decrement by 1 position
        break;
      case 'Home':
        newScaleValue = 1; // Minimum value
        break;
      case 'End':
        newScaleValue = 11; // Maximum value
        break;
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9':
        // Direct number input for values 1-9
        newScaleValue = parseInt(e.key, 10);
        break;
      case '0':
        // For consistency with standard number row, 0 = 10
        newScaleValue = 10;
        break;
      default:
        return; // Exit if not a relevant key
    }
    
    // Convert scale value back to normalized value (0-1)
    const newValue = scaleToValue(newScaleValue);
    
    if (newValue !== value) {
      onChange(newValue);
      e.preventDefault();
    }
  };
  
  // Adjustment with scroll wheel - snap to whole numbers
  const handleWheel = (e) => {
    if (!isHovered) return;
    
    // Get current scale value (1-11)
    const currentScale = getScaleValue(value);
    
    // Determine direction and calculate new scale value
    const direction = e.deltaY < 0 ? 1 : -1;
    const newScaleValue = Math.min(11, Math.max(1, currentScale + direction));
    
    // Convert back to normalized value (0-1)
    const newValue = scaleToValue(newScaleValue);
    
    onChange(newValue);
    e.preventDefault(); // Prevent page scrolling
  };
  
  // Handle click on a specific marker
  const handleMarkerClick = (markerValue) => {
    // Convert scale value (1-11) to normalized value (0-1)
    const newValue = scaleToValue(markerValue);
    onChange(newValue);
  };
  
  return (
    <div 
      className={`knob-container ${highlighted ? 'highlighted' : ''}`}
      ref={knobContainerRef}
    >
      {/* Circular dial with tick marks (1-11) */}
      <div className="knob-dial">
        {dialMarkers.map((marker) => {
          // Calculate the text rotation to always keep numbers upright
          // Since marker.degrees is the rotation of the mark itself, we need to counter-rotate the number
          // For clock-like orientation (0 at top, clockwise), we adjust the text rotation
          const textRotation = -marker.degrees;
          
          return (
            <div 
              key={marker.value}
              className={`dial-marker ${marker.value === currentScaleValue ? 'active' : ''}`}
              style={{ transform: `rotate(${marker.degrees}deg)` }}
              onClick={() => handleMarkerClick(marker.value)}
            >
              <div className="dial-tick" />
              <div 
                className="dial-number" 
                style={{ transform: `rotate(${textRotation}deg)` }}
              >
                {marker.value}
              </div>
            </div>
          );
        })}
        
        {/* The knob itself */}
        <div 
          className={`knob ${isHovered ? 'hovered' : ''}`}
          ref={knobRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          tabIndex="0" // Make knob focusable for keyboard control
          role="slider"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax="1"
          aria-label={label || `Knob ${index + 1}`}
          style={{ 
            transform: `rotate(${rotationDegrees}deg)`,
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
            transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <div className="knob-indicator" />
        </div>
      </div>
      
      {/* Knob label */}
      <div className="knob-label">
        {label || `Parameter ${index + 1}`}
      </div>
    </div>
  );
};

Knob.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  index: PropTypes.number.isRequired,
  highlighted: PropTypes.bool,
  showValue: PropTypes.bool
};

export default Knob;