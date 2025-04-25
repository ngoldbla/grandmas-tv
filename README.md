# Grandma's Television

An interactive web application that visualizes the concept of Stochastic Gradient Descent (SGD) using a nostalgic TV analogy. Users "tune" TV knobs representing neural network parameters to reduce the static (loss) and reveal a clear image (ideal output).

Developed by Dylan Goldblatt from the Office of Research at Kennesaw State University for "Transformer 2025: AI and the Future of Games".

<!-- Add your screenshot here with the following line, replacing 'screenshot.png' with your actual filename -->
<!-- ![Grandma's Television Screenshot](screenshot.png) -->

## 🎯 Purpose

This application serves as an educational tool to help understand:

- How optimization algorithms like SGD work visually
- The concept of loss/error minimization in machine learning
- How parameters affect output in neural networks
- The gradient descent process in an intuitive, visual way

## 📋 Features

- **Interactive Retro TV Interface**: Vintage-style TV with tunable knobs
- **Real-time Loss Visualization**: See static/noise decrease as you tune correctly
- **Auto SGD Mode**: Watch the algorithm automatically find optimal parameters
- **Visual Feedback**: Immediate updates when knob adjustments help or worsen clarity
- **Congratulatory Overlay**: Celebration when perfect tuning is achieved
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/ksu-research/grandmas-tv.git
   cd grandmas-tv
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built application will be in the `dist` directory.

### Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. Fork or clone this repository to your GitHub account
2. Sign up for a free account at [vercel.com](https://vercel.com) 
3. Create a new project and import your GitHub repository
4. Vercel will automatically detect the Vite configuration
5. No additional settings are needed - the included `vercel.json` file handles all routing and caching

Alternatively, you can deploy directly from your local machine using the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel
```

## 🛠️ Customization

### Changing the Target Image

1. Add your image to the `public/images/` directory
2. Update the `targetImage` path in `src/App.jsx`:

```jsx
const APP_CONFIG = {
  targetImage: '/images/your-image.svg', // or .png, .jpg, etc.
  // ...
};
```

### Adjusting the Number of Knobs

Modify the `numKnobs` value in `src/App.jsx`:

```jsx
const APP_CONFIG = {
  // ...
  numKnobs: 5, // Change to your desired number (2-5 recommended)
  // ...
};
```

### Setting Target Values

The target values represent the "perfect" parameters. You can set specific values in `src/App.jsx`:

```jsx
const APP_CONFIG = {
  // ...
  targetValues: [0.3, 0.7, 0.5, 0.9], // Values between 0 and 1
  // ...
};
```

### Showing Target Values

For debugging or educational purposes, you can display the target values on the knobs:

```jsx
const APP_CONFIG = {
  // ...
  showTargetValues: true, // Set to true to show targets
  // ...
};
```

### Adjusting Auto-Tune Speed

Change the speed of the automatic SGD process:

```jsx
const APP_CONFIG = {
  // ...
  autoTuneSpeed: 400, // Milliseconds between steps (lower = faster)
};
```

### Modifying the Loss Function

The loss function determines how parameter values affect the static/clarity.
To change it, edit the `calculateLoss` function in `src/lib/utils.js`.

Example of a custom loss function:

```javascript
export function calculateLoss(params, targets) {
  // Custom loss function - absolute difference (L1 loss)
  let totalLoss = 0;
  for (let i = 0; i < params.length; i++) {
    totalLoss += Math.abs(params[i] - targets[i]);
  }
  return totalLoss / params.length;
}
```

### Audio Configuration

To use custom audio files:

1. Place your audio files in the `public/sounds/` directory:
   ```
   public/sounds/tv-static.mp3     # TV static/white noise sound
   public/sounds/yo-yo-ma-bach.mp3 # Background music that emerges as static clears
   ```

2. If you want to use different filenames, update the constants in `src/components/RetroTV.jsx`:
   ```jsx
   // Audio files - use local sounds directory that can be customized by the user
   const STATIC_AUDIO_URL = '/sounds/your-static-file.mp3';
   const MUSIC_AUDIO_URL = '/sounds/your-music-file.mp3';
   ```

### UI Theming

To modify the TV's appearance, edit the CSS files:
- `src/components/RetroTV.css` - TV body styling
- `src/components/TVScreen.css` - Screen and static styling
- `src/components/Knob.css` - Knob controls styling with dial numbers (1-11)
- `src/components/LossMeter.css` - Loss meter styling

## 📝 Project Structure

```
/grandmas-tv/
  ├── public/            # Static assets
  │   ├── images/        # Target images
  │   └── sounds/        # Audio files for static and music
  │       ├── tv-static.mp3        # TV static noise
  │       └── yo-yo-ma-bach.mp3    # Bach Cello Suite by Yo-Yo Ma
  ├── src/
  │   ├── assets/        # Icons, images
  │   ├── components/    # UI components
  │   │   ├── Knob.jsx   # Rotary knob control with 1-11 dial
  │   │   ├── LossMeter.jsx # Error visualization
  │   │   ├── RetroTV.jsx # Main component
  │   │   └── TVScreen.jsx # Screen with noise
  │   ├── lib/           # Utility functions
  │   │   └── utils.js   # Loss calculation, noise generation
  │   ├── App.jsx        # Main UI logic
  │   └── main.jsx       # App entrypoint
  └── README.md
```

> **Note:** You need to supply your own audio files in the public/sounds directory or the audio will not work. The application expects:
> 1. `tv-static.mp3` - A TV static/white noise sound effect
> 2. `yo-yo-ma-bach.mp3` - Yo-Yo Ma's performance of Bach's Cello Suite No. 1 in G Major, Prélude (or any classical music of your choice)

## 🔍 How It Works

1. The application simulates a set of parameters (knobs) with target "ideal" values
2. A loss function calculates how far current parameters are from ideal values
3. The loss is visualized as static/noise that obscures the target image
4. As parameters get closer to targets, loss decreases and the image becomes clearer
5. The SGD algorithm works by:
   - Calculating the gradient (direction of steepest increase in loss)
   - Moving parameters in the opposite direction of the gradient
   - Taking small steps iteratively to find the minimum loss

## 🧠 Educational Extensions

Some ideas for extending the application:

- Add support for multiple loss functions to compare their behavior
- Implement different optimization algorithms (Adam, RMSProp, etc.)
- Add a learning rate control to show how step size affects convergence
- Create scenarios with multiple local minima to show the challenges of optimization
- Add sound effects that change with loss values

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- This visualization was inspired by pedagogical approaches to teaching optimization
- SVG rendering approach based on React SVG manipulation patterns
- Noise generation algorithm adapted from procedural noise techniques