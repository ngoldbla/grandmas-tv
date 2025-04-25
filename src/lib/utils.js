/**
 * Utility functions for Grandma's Television
 * This file contains core logic for loss calculation and noise generation
 * 
 * Author: Dylan Goldblatt, Office of Research, Kennesaw State University
 * Created for "Transformer 2025: AI and the Future of Games"
 */

// -----------------------------------------------------------------------------
// Configuration Parameters (can be adjusted)
// -----------------------------------------------------------------------------
export const CONFIG = {
  // The correct solution - these are the target values that minimize loss
  // Each value corresponds to a specific position on a knob (0.0 to 1.0)
  OPTIMAL_TARGET_VALUES: [0.3, 0.7, 0.2, 0.8],
  
  // Learning rate for SGD algorithm - higher for more dramatic steps in demo
  LEARNING_RATE: 0.08,
  
  // Add randomness to SGD (the "stochastic" part)
  SGD_NOISE_FACTOR: 0.2,
  
  // Maximum step size for a single knob adjustment
  MAX_STEP_SIZE: 0.1,
  
  // Loss scaling - adjust how steeply loss increases with distance from targets
  LOSS_STEEPNESS: 2.5,  // Higher means more dramatic effects with small changes
  LOSS_POWER: 2.0,      // Power to raise differences to (2 = squared, 3 = cubic, etc.)
  
  // Noise parameters
  NOISE_INTENSITY: 2.0,    // Scaling factor for static intensity
  NOISE_DENSITY_MIN: 50,   // Minimum number of noise elements (when loss is low)
  NOISE_DENSITY_MAX: 300,  // Maximum number of noise elements (when loss is high)
  NOISE_SEED: 42,          // Base random seed
  
  // Threshold for "perfect" tuning (when to show success message)
  PERFECT_THRESHOLD: 0.015,
  
  // Initial random parameter range (intentionally creates high static)
  INITIAL_PARAM_MIN: 0.0,
  INITIAL_PARAM_MAX: 1.0,
  
  // Audio mix settings
  MIN_STATIC_VOLUME: 0.0,  // Minimum static volume (when tuned perfectly)
  MAX_STATIC_VOLUME: 1.0,  // Maximum static volume (with high loss)
  MIN_MUSIC_VOLUME: 0.2,   // Minimum music volume (with high loss)
  MAX_MUSIC_VOLUME: 1.0,   // Maximum music volume (when tuned perfectly)
};

/**
 * Calculate the loss based on the current parameters and target values
 * Uses an enhanced version of L2 loss with non-linear scaling
 * 
 * @param {Array<number>} params - The current parameter values in range [0,1]
 * @param {Array<number>} targets - The target parameter values in range [0,1]
 * @returns {number} - The calculated loss value (smaller is better)
 */
export function calculateLoss(params, targets) {
  // Ensure params and targets are the same length
  if (params.length !== targets.length) {
    console.error('Parameters and targets arrays must be the same length');
    return Infinity;
  }
  
  // Calculate weighted distance-based loss with non-linear scaling
  let totalLoss = 0;
  
  for (let i = 0; i < params.length; i++) {
    // Calculate normalized distance (each parameter is already in 0-1 range)
    const rawDiff = Math.abs(params[i] - targets[i]);
    
    // Apply power to amplify differences (makes landscape more steep around the optimum)
    const poweredDiff = Math.pow(rawDiff, CONFIG.LOSS_POWER);
    
    // Apply steepness scaling to control overall loss magnitude
    const scaledDiff = poweredDiff * CONFIG.LOSS_STEEPNESS;
    
    // Add a small weight variation by parameter to create asymmetric loss surface
    const paramWeight = 1.0 + (i * 0.1); // Slightly more weight to later parameters
    
    totalLoss += scaledDiff * paramWeight;
  }
  
  // Normalize and clamp to 0-1 range for consistent scaling in visualizations
  const normalizedLoss = totalLoss / (params.length * CONFIG.LOSS_STEEPNESS);
  return Math.min(1, Math.max(0, normalizedLoss));
}

/**
 * Generate a noise pattern based on the current loss
 * Higher loss produces more intense and denser noise
 * Direct correlation between loss and static characteristics
 * 
 * @param {number} loss - The current loss value (normalized to 0-1)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} [seed] - Optional seed for random generation
 * @returns {Array<{x: number, y: number, width: number, height: number, intensity: number, color: string}>} - Array of noise pixels
 */
export function generateNoise(loss, width, height, seed) {
  // Apply non-linear scaling to make static disappear faster at low loss values
  // This creates a more dramatic effect as loss approaches zero
  const noiseFactor = Math.pow(loss, 0.7); // Use power < 1 to make low values more impactful
  
  // Use varying seed for more realistic TV static
  const randomSeed = seed || (CONFIG.NOISE_SEED + Date.now() % 10000);
  const seededRandom = makeSeededRandom(randomSeed);
  
  // Create array to hold the static elements
  const noisePixels = [];
  
  // Scale number of elements based on loss value
  const elementCount = Math.floor(
    CONFIG.NOISE_DENSITY_MIN + 
    noiseFactor * (CONFIG.NOISE_DENSITY_MAX - CONFIG.NOISE_DENSITY_MIN)
  );
  
  // Calculate grid size based on element count
  const gridSize = Math.ceil(Math.sqrt(elementCount * 2));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  
  // Generate main static noise elements
  for (let i = 0; i < elementCount; i++) {
    // Generate position - make positions not perfectly aligned to grid for more natural look
    const x = seededRandom() * width;
    const y = seededRandom() * height;
    
    // Vary size based on loss - higher loss = larger static elements
    const sizeVariance = 0.5 + noiseFactor * 2.5; // 0.5 to 3.0
    const blockWidth = cellWidth * sizeVariance * seededRandom();
    const blockHeight = cellHeight * sizeVariance * seededRandom();
    
    // Random brightness - higher loss = more contrast in static
    const brightnessBase = 180 + noiseFactor * 20; // 180-200
    const brightnessRange = 55 + noiseFactor * 20; // 55-75
    const brightness = Math.floor(brightnessBase + seededRandom() * brightnessRange);
    
    // Create color - occasional color noise for visual interest
    const color = seededRandom() > 0.97 && noiseFactor > 0.7
      ? `rgb(${brightness + 30}, ${brightness - 30}, ${brightness})`  // Slight color for interest
      : `rgb(${brightness}, ${brightness}, ${brightness})`;           // Standard grayscale
    
    // Higher intensity for higher loss
    const baseIntensity = 0.3 + noiseFactor * 0.7; // 0.3 to 1.0
    const intensity = baseIntensity + (0.2 * seededRandom() * noiseFactor);
    
    noisePixels.push({
      x,
      y,
      width: blockWidth,
      height: blockHeight,
      color,
      intensity: Math.min(1, intensity)
    });
  }
  
  // Add horizontal scan lines - more with higher loss
  if (noiseFactor > 0.3) {
    // Number of scan lines scales with loss
    const lineCount = Math.floor(1 + noiseFactor * 5); // 1 to 6 lines
    
    for (let i = 0; i < lineCount; i++) {
      const lineHeight = cellHeight * (0.2 + seededRandom() * 0.3); // Thin lines
      const y = seededRandom() * height;
      
      noisePixels.push({
        x: 0,
        y,
        width,
        height: lineHeight,
        color: seededRandom() < 0.7 ? 'white' : 'black',
        intensity: 0.7 + 0.3 * noiseFactor
      });
    }
  }
  
  // Add large static blocks for very distorted appearance at high loss
  if (noiseFactor > 0.8) {
    const blockCount = Math.floor(2 + seededRandom() * 4); // 2-5 blocks
    
    for (let i = 0; i < blockCount; i++) {
      const blockWidth = width * (0.1 + seededRandom() * 0.3);
      const blockHeight = height * (0.05 + seededRandom() * 0.1);
      
      noisePixels.push({
        x: seededRandom() * (width - blockWidth),
        y: seededRandom() * (height - blockHeight),
        width: blockWidth,
        height: blockHeight,
        color: seededRandom() < 0.5 ? 'white' : 'black',
        intensity: 0.9
      });
    }
  }
  
  return noisePixels;
}

/**
 * Create a seeded random number generator for consistent noise generation
 * 
 * @param {number} seed - Seed value for random number generation
 * @returns {function(): number} - Function that returns random numbers
 */
function makeSeededRandom(seed) {
  let state = seed;
  
  return function() {
    // Simple xorshift algorithm
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (Math.abs(state) % 1000) / 1000;
  };
}

/**
 * Calculate the gradient of the loss function with respect to each parameter
 * This tells us which direction to adjust parameters to reduce loss
 * 
 * @param {Array<number>} params - Current parameter values
 * @param {Array<number>} targets - Target parameter values
 * @returns {Array<number>} - Gradient for each parameter
 */
export function calculateGradients(params, targets) {
  const gradients = [];
  
  for (let i = 0; i < params.length; i++) {
    // Get current parameter value
    const param = params[i];
    const target = targets[i];
    
    // Calculate raw difference
    const diff = param - target;
    const absDiff = Math.abs(diff);
    
    // Apply power to the difference to make gradient stronger for larger differences
    const poweredDiff = Math.pow(absDiff, CONFIG.LOSS_POWER - 1);
    
    // Apply direction to keep gradient pointing correctly
    const signedGradient = poweredDiff * Math.sign(diff);
    
    // Apply steepness scaling similar to the loss function
    const scaledGradient = signedGradient * CONFIG.LOSS_STEEPNESS;
    
    // Apply parameter weight as in the loss function
    const paramWeight = 1.0 + (i * 0.1);
    
    gradients.push(scaledGradient * paramWeight * 2); // Multiply by 2 for numerical stability
  }
  
  return gradients;
}

/**
 * Perform one step of stochastic gradient descent
 * Includes randomness for the "stochastic" part
 * 
 * @param {Array<number>} params - Current parameter values
 * @param {Array<number>} targets - Target parameter values
 * @param {number} learningRate - How big of a step to take
 * @returns {Array<number>} - Updated parameter values
 */
export function performSGDStep(params, targets, learningRate = CONFIG.LEARNING_RATE) {
  // Calculate the gradients for each parameter
  const gradients = calculateGradients(params, targets);
  
  // To make this truly stochastic, we need to:
  // 1. Add some random noise to the gradients
  // 2. Sometimes only update a subset of parameters
  
  // Generate a random seed for this step
  const seed = Math.floor(Math.random() * 10000);
  const random = makeSeededRandom(seed);
  
  // Decide how many parameters to update (at least 1, up to all)
  const numToUpdate = Math.max(1, Math.floor(params.length * (0.5 + 0.5 * random())));
  
  // Create a shuffled array of parameter indices
  const paramIndices = Array.from({ length: params.length }, (_, i) => i);
  shuffleArray(paramIndices, random);
  
  // Select which parameters to update this step
  const selectedIndices = paramIndices.slice(0, numToUpdate);
  
  // Create new parameter values array
  const newParams = [...params];
  
  // Update only the selected parameters
  for (const i of selectedIndices) {
    // Add randomness to the gradient (the "stochastic" part)
    const noiseAmount = CONFIG.SGD_NOISE_FACTOR * (random() * 2 - 1);
    const noisyGradient = gradients[i] * (1 + noiseAmount);
    
    // Limit step size for smoother animation
    const step = Math.min(CONFIG.MAX_STEP_SIZE, learningRate * noisyGradient);
    
    // Update parameter (subtract gradient because we want to minimize loss)
    let newValue = params[i] - step;
    
    // Snap to discrete positions (0.0, 0.1, 0.2, ..., 1.0)
    newValue = Math.round(newValue * 10) / 10;
    
    // Clamp to [0,1] range
    newParams[i] = Math.min(1, Math.max(0, newValue));
  }
  
  return newParams;
}

/**
 * Shuffle an array using Fisher-Yates algorithm with a provided random function
 * 
 * @param {Array} array - The array to shuffle
 * @param {Function} randomFn - Random function that returns values in [0,1]
 */
function shuffleArray(array, randomFn) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate random parameter values that create a high-static starting point
 * Strategically places values to create an interesting tuning experience
 * 
 * @param {number} count - Number of parameters to generate
 * @param {boolean} farFromTargets - If true, ensures parameters are far from targets
 * @returns {Array<number>} - Array of random parameter values (at discrete positions)
 */
export function generateRandomParams(count, farFromTargets = true) {
  if (!farFromTargets) {
    // Regular random generation in [0,1] at discrete positions (0.0, 0.1, 0.2, ...)
    return Array.from({ length: count }, () => {
      const value = Math.floor(Math.random() * 11) / 10;
      return value;
    });
  }
  
  // The true optimal solution
  const optimalValues = CONFIG.OPTIMAL_TARGET_VALUES;
  
  // Generate parameters that are deliberately far from targets
  return Array.from({ length: count }, (_, i) => {
    // Get the corresponding optimal value, or use a default if index out of bounds
    const targetValue = i < optimalValues.length 
      ? optimalValues[i] 
      : 0.5;
    
    // Choose a value that's definitely not the target value
    // To ensure we don't accidentally choose the optimal value
    const availableValues = [];
    
    for (let j = 0; j <= 10; j++) {
      const value = j / 10; // Convert to 0.0, 0.1, 0.2, ..., 1.0
      
      // Exclude the optimal value and values close to it
      if (Math.abs(value - targetValue) >= 0.2) {
        availableValues.push(value);
      }
    }
    
    // Select a random value from the available values
    const randomIndex = Math.floor(Math.random() * availableValues.length);
    return availableValues[randomIndex];
  });
}

/**
 * Checks if the parameters are very close to the targets
 * Uses a threshold defined in CONFIG to determine "closeness"
 * 
 * @param {Array<number>} params - Current parameter values
 * @param {Array<number>} targets - Target parameter values
 * @returns {boolean} - True if the parameters are very close to the targets
 */
export function isCloseEnough(params, targets) {
  // Check if each parameter is exactly at the target value (discrete positions)
  const exactMatch = params.every((param, i) => {
    return Math.abs(param - targets[i]) < 0.01; // Allow tiny float differences
  });
  
  // If every knob is at exactly the right position, it's perfect
  if (exactMatch) {
    return true;
  }
  
  // Otherwise, check if the overall loss is below threshold
  const loss = calculateLoss(params, targets);
  return loss < CONFIG.PERFECT_THRESHOLD;
}