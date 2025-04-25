import React from 'react';
import PropTypes from 'prop-types';
import './MobileWarning.css';

/**
 * Mobile Warning component that shows a popup for mobile users
 * with a button to dismiss and continue
 */
const MobileWarning = ({ onDismiss }) => {
  return (
    <div className="mobile-warning-overlay">
      <div className="mobile-warning-content">
        <h2>Mobile Experience Limited</h2>
        <p>
          Grandma's Television is designed for desktop viewing.
          The mobile experience may not work as intended.
        </p>
        <p>
          For the best experience, please visit on a desktop or laptop computer.
        </p>
        <button className="mobile-warning-button" onClick={onDismiss}>
          Continue Anyway
        </button>
      </div>
    </div>
  );
};

MobileWarning.propTypes = {
  onDismiss: PropTypes.func.isRequired
};

export default MobileWarning;