class KNNVisualization {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        this.plotWidth = this.width - this.margin.left - this.margin.right;
        this.plotHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Color scheme for different classes
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        this.classNames = ['A', 'B', 'C', 'D'];
        
        // Data storage
        this.trainingData = [];
        this.newPoint = null;
        this.neighbors = [];
        this.neighborLines = [];
        
        this.initializeVisualization();
        this.generateInitialData();
        this.setupEventListeners();
        this.updateUI();
    }
    
    initializeVisualization() {
        // Create SVG
        this.svg = d3.select('#visualization')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'plot-area');
            
        // Create main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            
        // Create groups for different elements
        this.linesGroup = this.g.append('g').attr('class', 'lines');
        this.pointsGroup = this.g.append('g').attr('class', 'points');
        this.newPointGroup = this.g.append('g').attr('class', 'new-point');
        
        // Add click handler to SVG
        this.svg.on('click', (event) => this.handleClick(event));
    }
    
    generateInitialData() {
        // Generate random training data points for each class
        const pointsPerClass = 15;
        const mixingLevel = parseFloat(document.getElementById('mixing-level').value);
        const clusters = [
            { center: [150, 150], spread: 80 },  // Class A (Red)
            { center: [650, 150], spread: 80 },  // Class B (Teal)  
            { center: [150, 450], spread: 80 },  // Class C (Blue)
            { center: [650, 450], spread: 80 }   // Class D (Green)
        ];
        
        this.trainingData = [];
        
        clusters.forEach((cluster, classIndex) => {
            for (let i = 0; i < pointsPerClass; i++) {
                // Generate points around cluster center with some randomness
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * cluster.spread;
                let x = cluster.center[0] + distance * Math.cos(angle);
                let y = cluster.center[1] + distance * Math.sin(angle);
                
                // Add mixing factor based on selected level
                if (Math.random() < mixingLevel) {
                    const mixingIntensity = 0.5; // How much mixing to apply
                    const centerX = this.plotWidth / 2;
                    const centerY = this.plotHeight / 2;
                    
                    // Pull points towards the center or towards other clusters
                    x += (centerX - x) * mixingIntensity * Math.random();
                    y += (centerY - y) * mixingIntensity * Math.random();
                    
                    // Add some random scatter for more realistic mixing
                    x += (Math.random() - 0.5) * 120;
                    y += (Math.random() - 0.5) * 120;
                }
                
                // Ensure points stay within bounds
                const boundedX = Math.max(20, Math.min(this.plotWidth - 20, x));
                const boundedY = Math.max(20, Math.min(this.plotHeight - 20, y));
                
                this.trainingData.push({
                    x: boundedX,
                    y: boundedY,
                    class: classIndex,
                    color: this.colors[classIndex]
                });
            }
        });
        
        this.renderTrainingData();
    }
    
    renderTrainingData() {
        const circles = this.pointsGroup.selectAll('circle')
            .data(this.trainingData);
            
        circles.enter()
            .append('circle')
            .merge(circles)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 6)
            .attr('fill', d => d.color)
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .style('cursor', 'default');
            
        circles.exit().remove();
    }
    
    handleClick(event) {
        if (this.newPoint) {
            this.updateStatus('Please reset before adding a new point', 'info');
            return;
        }
        
        const [x, y] = d3.pointer(event);
        const plotX = x - this.margin.left;
        const plotY = y - this.margin.top;
        
        // Ensure the point is within the plot area
        if (plotX >= 0 && plotX <= this.plotWidth && plotY >= 0 && plotY <= this.plotHeight) {
            this.newPoint = { x: plotX, y: plotY, class: null };
            this.renderNewPoint();
            this.updateUI();
            this.updateStatus('New point added! Click "Find K-Nearest Neighbors" to continue', 'success');
        }
    }
    
    renderNewPoint() {
        this.newPointGroup.selectAll('*').remove();
        
        if (this.newPoint) {
            this.newPointGroup.append('circle')
                .attr('cx', this.newPoint.x)
                .attr('cy', this.newPoint.y)
                .attr('r', 8)
                .attr('fill', this.newPoint.class !== null ? this.colors[this.newPoint.class] : '#333')
                .attr('stroke', '#000')
                .attr('stroke-width', 2)
                .style('cursor', 'default');
        }
    }
    
    findKNearestNeighbors() {
        if (!this.newPoint) return;
        
        const k = parseInt(document.getElementById('k-value').value);
        
        // Calculate distances to all training points
        const distances = this.trainingData.map(point => ({
            point: point,
            distance: this.calculateDistance(this.newPoint, point)
        }));
        
        // Sort by distance and take top k
        distances.sort((a, b) => a.distance - b.distance);
        this.neighbors = distances.slice(0, k);
        
        this.renderNeighborLines();
        this.updateUI();
        this.updateStatus(`Found ${k} nearest neighbors. Click "Classify Point" to see the prediction`, 'success');
    }
    
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    renderNeighborLines() {
        this.linesGroup.selectAll('line').remove();
        
        if (this.newPoint && this.neighbors.length > 0) {
            const lines = this.linesGroup.selectAll('line')
                .data(this.neighbors);
                
            lines.enter()
                .append('line')
                .attr('x1', this.newPoint.x)
                .attr('y1', this.newPoint.y)
                .attr('x2', d => d.point.x)
                .attr('y2', d => d.point.y)
                .attr('stroke', '#333')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5')
                .style('opacity', 0)
                .transition()
                .duration(800)
                .style('opacity', 0.8);
        }
    }
    
    classifyPoint() {
        if (!this.newPoint || this.neighbors.length === 0) return;
        
        // Count votes from neighbors
        const votes = {};
        this.neighbors.forEach(neighbor => {
            const neighborClass = neighbor.point.class;
            votes[neighborClass] = (votes[neighborClass] || 0) + 1;
        });
        
        // Find the class with the most votes
        let maxVotes = 0;
        let predictedClass = 0;
        for (const [classIndex, voteCount] of Object.entries(votes)) {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                predictedClass = parseInt(classIndex);
            }
        }
        
        this.newPoint.class = predictedClass;
        this.renderNewPoint();
        this.updateUI();
        
        const className = this.classNames[predictedClass];
        const confidence = maxVotes / this.neighbors.length;
        this.updateStatus(
            `Classified as Class ${className} with ${maxVotes}/${this.neighbors.length} votes (${(confidence * 100).toFixed(0)}% confidence)`, 
            'success'
        );
    }
    
    reset() {
        this.newPoint = null;
        this.neighbors = [];
        this.linesGroup.selectAll('line').remove();
        this.newPointGroup.selectAll('*').remove();
        this.updateUI();
        this.updateStatus('Reset complete. Click anywhere on the plot to add a new point', 'info');
    }
    
    regenerateData() {
        // Clear any existing classification state
        this.newPoint = null;
        this.neighbors = [];
        this.linesGroup.selectAll('line').remove();
        this.newPointGroup.selectAll('*').remove();
        
        // Generate new data with current mixing level
        this.generateInitialData();
        this.renderTrainingData();
        this.updateUI();
        
        const mixingLevel = parseFloat(document.getElementById('mixing-level').value);
        const mixingText = mixingLevel === 0 ? 'distinct clusters' : 
                          mixingLevel <= 0.2 ? 'low mixing' :
                          mixingLevel <= 0.35 ? 'medium mixing' :
                          mixingLevel <= 0.5 ? 'high mixing' : 'very high mixing';
        
        this.updateStatus(`New dataset generated with ${mixingText}. Click to add a point!`, 'success');
    }
    
    updateUI() {
        const hasNewPoint = this.newPoint !== null;
        const hasNeighbors = this.neighbors.length > 0;
        const isClassified = this.newPoint && this.newPoint.class !== null;
        
        document.getElementById('find-neighbors-btn').disabled = !hasNewPoint || hasNeighbors || isClassified;
        document.getElementById('classify-btn').disabled = !hasNeighbors || isClassified;
    }
    
    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
    
    setupEventListeners() {
        document.getElementById('find-neighbors-btn').addEventListener('click', () => {
            this.findKNearestNeighbors();
        });
        
        document.getElementById('classify-btn').addEventListener('click', () => {
            this.classifyPoint();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('regenerate-btn').addEventListener('click', () => {
            this.regenerateData();
        });
        
        document.getElementById('k-value').addEventListener('change', () => {
            if (this.newPoint && this.neighbors.length > 0) {
                this.updateStatus('K value changed. Click "Find K-Nearest Neighbors" again to update', 'info');
                this.neighbors = [];
                this.linesGroup.selectAll('line').remove();
                this.updateUI();
            }
        });
        
        document.getElementById('mixing-level').addEventListener('change', () => {
            this.updateStatus('Mixing level changed. Click "Regenerate Data" to see the effect', 'info');
        });
    }
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new KNNVisualization();
});
