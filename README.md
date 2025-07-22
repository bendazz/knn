# K-Nearest Neighbors Algorithm Visualization

An interactive web application that demonstrates the K-Nearest Neighbors (KNN) algorithm through visual representation.

## Features

- **Interactive Plot**: Click anywhere to add a new data point
- **Adjustable K Value**: Choose K from 1 to 5
- **Visual Neighbor Detection**: See lines connecting to the K nearest neighbors
- **Classification Visualization**: Watch the new point change color based on majority vote
- **Multiple Classes**: Pre-populated with 4 different colored classes
- **Reset Functionality**: Clear and start over anytime

## How to Use

1. **Select K Value**: Choose your desired K value (1-5) from the dropdown
2. **Add New Point**: Click anywhere on the plot to add a black unclassified point
3. **Find Neighbors**: Click "Find K-Nearest Neighbors" to see connecting lines
4. **Classify**: Click "Classify Point" to see the prediction based on majority vote
5. **Reset**: Click "Reset" to clear everything and start over

## Classes

- **Class A (Red)**: Top-left cluster
- **Class B (Teal)**: Top-right cluster  
- **Class C (Blue)**: Bottom-left cluster
- **Class D (Green)**: Bottom-right cluster

## Technology Stack

- **HTML5**: Structure and layout
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Application logic and interactivity
- **D3.js v7**: Data visualization and SVG manipulation

## Running the Application

Simply open `index.html` in any modern web browser. No server setup required!

```bash
# Clone or download the files
# Open index.html in your browser
open index.html
```

## Educational Value

This visualization helps understand:
- How distance affects neighbor selection
- The impact of different K values on classification
- Majority voting in classification algorithms
- The concept of decision boundaries (implied through classifications)

## Browser Compatibility

Works in all modern browsers that support:
- SVG rendering
- ES6+ JavaScript features
- CSS Grid and Flexbox

Tested on Chrome, Firefox, Safari, and Edge.

## Future Enhancements

Potential improvements could include:
- Different distance metrics (Manhattan, Minkowski)
- Weighted KNN by distance
- Cross-validation visualization
- Dataset import/export functionality
- Performance metrics display