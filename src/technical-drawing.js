// Technical Drawing SVG Generator for Geometric Runout Tolerances
// Creates an orthographic projection of a shaft with tolerance frames

const TechnicalDrawing = {
  // Container element
  container: null,
  
  // Shaft drawing parameters (in mm)
  params: {
    bodyRadius: 20,
    bodyLength: 100,
    flangeRadius: 35,
    flangeThickness: 10,
    // Datum
    datumLabel: 'A'
  },
  
  // Initialize the drawing
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Technical drawing container not found');
      return;
    }
    this.createSvg();
    this.createToleranceFrames();
    this.addResizeListener();
  },
  
  // Create the main SVG canvas
  createSvg() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const width = this.container.clientWidth || 600;
    const height = 300;
    
    // Clear existing content
    this.container.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('class', 'drawing-canvas');
    svg.style.width = '100%';
    svg.style.height = '300px';
    
    // Store dimensions
    this.svgWidth = width;
    this.svgHeight = height;
    
    this.container.appendChild(svg);
    this.svg = svg;
  },
  
  // Create the shaft orthographic projection
  createShaftDrawing() {
    if (!this.svg) return;
    
    const svgNS = 'http://www.w3.org/2000/svg';
    const bodyRadius = this.params.bodyRadius;
    const bodyLength = this.params.bodyLength;
    const flangeRadius = this.params.flangeRadius;
    const flangeThickness = this.params.flangeThickness;
    
    // Grid marks
    const gridSize = 10;
    for (let i = 0; i <= bodyLength / gridSize; i++) {
      const x = 80 + (i * gridSize);
      // Vertical grid line
      const vLine = document.createElementNS(svgNS, 'line');
      vLine.setAttribute('x1', x);
      vLine.setAttribute('y1', 50);
      vLine.setAttribute('x2', x);
      vLine.setAttribute('y2', 200);
      vLine.setAttribute('stroke', '#e0d8d0');
      vLine.setAttribute('stroke-width', 1);
      vLine.setAttribute('opacity', 0.3);
      this.svg.appendChild(vLine);
      
      // Horizontal grid line
      const hLine = document.createElementNS(svgNS, 'line');
      hLine.setAttribute('x1', 80);
      hLine.setAttribute('y1', 50 + (i * gridSize));
      hLine.setAttribute('x2', 80 + bodyLength + 20);
      hLine.setAttribute('y2', 50 + (i * gridSize));
      hLine.setAttribute('stroke', '#e0d8d0');
      hLine.setAttribute('stroke-width', 1);
      hLine.setAttribute('opacity', 0.3);
      this.svg.appendChild(hLine);
    }
    
    // Datum line (horizontal reference)
    const datumLine = document.createElementNS(svgNS, 'line');
    datumLine.setAttribute('x1', 80);
    datumLine.setAttribute('y1', 150);
    datumLine.setAttribute('x2', 80 + bodyLength + 20);
    datumLine.setAttribute('y2', 150);
    datumLine.setAttribute('stroke', '#2c2a25');
    datumLine.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(datumLine);
    
    // Datum label
    const datumLabel = document.createElementNS(svgNS, 'text');
    datumLabel.setAttribute('x', 80 + bodyLength / 2);
    datumLabel.setAttribute('y', 145);
    datumLabel.setAttribute('font-size', '11px');
    datumLabel.setAttribute('font-weight', 'bold');
    datumLabel.setAttribute('fill', '#e74c3c');
    datumLabel.setAttribute('text-anchor', 'middle');
    datumLabel.textContent = 'A';
    this.svg.appendChild(datumLabel);
    
    // Datum arrowheads
    const arrowHead1 = document.createElementNS(svgNS, 'polygon');
    arrowHead1.setAttribute('points', '80 152 78 150 82 150');
    arrowHead1.setAttribute('fill', '#e74c3c');
    this.svg.appendChild(arrowHead1);
    
    const arrowHead2 = document.createElementNS(svgNS, 'polygon');
    arrowHead2.setAttribute('points', '80 + bodyLength + 20 152 79 + bodyLength + 20 150 81 + bodyLength + 20 150');
    arrowHead2.setAttribute('fill', '#e74c3c');
    this.svg.appendChild(arrowHead2);
    
    // Shaft body - front view (outer cylinder)
    const shaftOuter = document.createElementNS(svgNS, 'ellipse');
    shaftOuter.setAttribute('cx', 80 + bodyLength / 2);
    shaftOuter.setAttribute('cy', 150);
    shaftOuter.setAttribute('rx', bodyRadius);
    shaftOuter.setAttribute('ry', bodyRadius);
    shaftOuter.setAttribute('fill', '#b5c4c7');
    shaftOuter.setAttribute('stroke', '#2c2a25');
    shaftOuter.setAttribute('stroke-width', 2);
    this.svg.appendChild(shaftOuter);
    
    // Shaft body - hidden lines (dashed)
    const dashPattern = '5 3';
    const shaftInner = document.createElementNS(svgNS, 'ellipse');
    shaftInner.setAttribute('cx', 80 + bodyLength / 2);
    shaftInner.setAttribute('cy', 150);
    shaftInner.setAttribute('rx', bodyRadius - 2);
    shaftInner.setAttribute('ry', bodyRadius - 2);
    shaftInner.setAttribute('fill', 'none');
    shaftInner.setAttribute('stroke', '#4a4641');
    shaftInner.setAttribute('stroke-width', 1);
    shaftInner.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(shaftInner);
    
    // Front face lines (bottom of shaft)
    const frontTop = document.createElementNS(svgNS, 'line');
    frontTop.setAttribute('x1', 80);
    frontTop.setAttribute('y1', 150 - bodyRadius);
    frontTop.setAttribute('x2', 80 + bodyLength);
    frontTop.setAttribute('y2', 150 - bodyRadius);
    frontTop.setAttribute('stroke', '#2c2a25');
    frontTop.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(frontTop);
    
    const frontBottom = document.createElementNS(svgNS, 'line');
    frontBottom.setAttribute('x1', 80);
    frontBottom.setAttribute('y1', 150 + bodyRadius);
    frontBottom.setAttribute('x2', 80 + bodyLength);
    frontBottom.setAttribute('y2', 150 + bodyRadius);
    frontBottom.setAttribute('stroke', '#2c2a25');
    frontBottom.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(frontBottom);
    
    // Hidden bottom edges (dashed)
    const hiddenBottom1 = document.createElementNS(svgNS, 'line');
    hiddenBottom1.setAttribute('x1', 80);
    hiddenBottom1.setAttribute('y1', 150 + bodyRadius);
    hiddenBottom1.setAttribute('x2', 80 + 20); // start of flange area
    hiddenBottom1.setAttribute('y2', 150 + bodyRadius + 5);
    hiddenBottom1.setAttribute('stroke', '#4a4641');
    hiddenBottom1.setAttribute('stroke-width', 1);
    hiddenBottom1.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(hiddenBottom1);
    
    // Flange visible edges
    const flangeTop = document.createElementNS(svgNS, 'line');
    flangeTop.setAttribute('x1', 80 + bodyLength);
    flangeTop.setAttribute('y1', 150 - flangeThickness / 2 - 5);
    flangeTop.setAttribute('x2', 80 + bodyLength + flangeRadius + 10);
    flangeTop.setAttribute('y2', 150 - flangeThickness / 2 - 5);
    flangeTop.setAttribute('stroke', '#2c2a25');
    flangeTop.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(flangeTop);
    
    const flangeBottom = document.createElementNS(svgNS, 'line');
    flangeBottom.setAttribute('x1', 80 + bodyLength);
    flangeBottom.setAttribute('y1', 150 + flangeThickness / 2 + 5);
    flangeBottom.setAttribute('x2', 80 + bodyLength + flangeRadius + 10);
    flangeBottom.setAttribute('y2', 150 + flangeThickness / 2 + 5);
    flangeBottom.setAttribute('stroke', '#2c2a25');
    flangeBottom.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(flangeBottom);
    
    // Flange edge lines (side)
    const flangeSide1 = document.createElementNS(svgNS, 'line');
    flangeSide1.setAttribute('x1', 80 + bodyLength + flangeRadius + 10);
    flangeSide1.setAttribute('y1', 150 - flangeThickness / 2 - 5);
    flangeSide1.setAttribute('x2', 80 + bodyLength + flangeRadius + 10);
    flangeSide1.setAttribute('y2', 150 + flangeThickness / 2 + 5);
    flangeSide1.setAttribute('stroke', '#2c2a25');
    flangeSide1.setAttribute('stroke-width', 1.5);
    this.svg.appendChild(flangeSide1);
    
    // Centerlines
    const centerLine = document.createElementNS(svgNS, 'line');
    centerLine.setAttribute('x1', 80 + bodyLength / 2);
    centerLine.setAttribute('y1', 50);
    centerLine.setAttribute('x2', 80 + bodyLength / 2);
    centerLine.setAttribute('y2', 200);
    centerLine.setAttribute('stroke', '#4a4641');
    centerLine.setAttribute('stroke-width', 1);
    centerLine.setAttribute('stroke-dasharray', '5 5');
    this.svg.appendChild(centerLine);
    
    // Dimension lines and text
    this.addDimensions();
  },
  
  // Add dimension lines and text
  addDimensions() {
    if (!this.svg) return;
    
    const svgNS = 'http://www.w3.org/2000/svg';
    const dashPattern = '5 3';
    const textSize = 10;
    
    // Body diameter dimension
    const dim1Line = document.createElementNS(svgNS, 'line');
    dim1Line.setAttribute('x1', 80 + this.params.bodyRadius);
    dim1Line.setAttribute('y1', 150 - this.params.bodyRadius - 15);
    dim1Line.setAttribute('x2', 80 + this.params.bodyRadius);
    dim1Line.setAttribute('y2', 150 + this.params.bodyRadius + 15);
    dim1Line.setAttribute('stroke', '#2c2a25');
    dim1Line.setAttribute('stroke-width', 1);
    dim1Line.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(dim1Line);
    
    const dim1Text = document.createElementNS(svgNS, 'text');
    dim1Text.setAttribute('x', 80 + this.params.bodyRadius + 20);
    dim1Text.setAttribute('y', 150);
    dim1Text.setAttribute('font-size', `${textSize}px`);
    dim1Text.setAttribute('fill', '#2c2a25');
    dim1Text.setAttribute('transform', 'rotate(90 ' + (80 + this.params.bodyRadius) + ' 150)');
    const dim1Value = document.createTextNode('Ø ' + this.params.bodyRadius + ' mm');
    dim1Text.appendChild(dim1Value);
    this.svg.appendChild(dim1Text);
    
    // Body length dimension
    const dim2Line = document.createElementNS(svgNS, 'line');
    dim2Line.setAttribute('x1', 80 - 10);
    dim2Line.setAttribute('y1', 150);
    dim2Line.setAttribute('x2', 80 + this.params.bodyLength + 20 + 10);
    dim2Line.setAttribute('y2', 150);
    dim2Line.setAttribute('stroke', '#2c2a25');
    dim2Line.setAttribute('stroke-width', 1);
    dim2Line.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(dim2Line);
    
    const dim2Text = document.createElementNS(svgNS, 'text');
    dim2Text.setAttribute('x', 80 + this.params.bodyLength / 2 + 20);
    dim2Text.setAttribute('y', 155);
    dim2Text.setAttribute('font-size', `${textSize}px`);
    dim2Text.setAttribute('fill', '#2c2a25');
    const dim2Value = document.createTextNode(this.params.bodyLength + ' mm');
    dim2Text.appendChild(dim2Value);
    this.svg.appendChild(dim2Text);
    
    // Flange diameter dimension
    const dim3Line = document.createElementNS(svgNS, 'line');
    dim3Line.setAttribute('x1', 80 + this.params.bodyLength + this.params.flangeRadius + 15);
    dim3Line.setAttribute('y1', 150 - this.params.flangeRadius - 15);
    dim3Line.setAttribute('x2', 80 + this.params.bodyLength + this.params.flangeRadius + 15);
    dim3Line.setAttribute('y2', 150 + this.params.flangeRadius + 15);
    dim3Line.setAttribute('stroke', '#2c2a25');
    dim3Line.setAttribute('stroke-width', 1);
    dim3Line.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(dim3Line);
    
    const dim3Text = document.createElementNS(svgNS, 'text');
    dim3Text.setAttribute('x', 80 + this.params.bodyLength + this.params.flangeRadius + 25);
    dim3Text.setAttribute('y', 150);
    dim3Text.setAttribute('font-size', `${textSize}px`);
    dim3Text.setAttribute('fill', '#2c2a25');
    dim3Text.setAttribute('transform', 'rotate(-90 ' + (80 + this.params.bodyLength + this.params.flangeRadius + 15) + ' 150)');
    const dim3Value = document.createTextNode('Ø ' + this.params.flangeRadius + ' mm');
    dim3Text.appendChild(dim3Value);
    this.svg.appendChild(dim3Text);
    
    // Flange thickness dimension
    const dim4Line = document.createElementNS(svgNS, 'line');
    dim4Line.setAttribute('x1', 80 + this.params.bodyLength + this.params.flangeRadius + 20);
    dim4Line.setAttribute('y1', 150);
    dim4Line.setAttribute('x2', 80 + this.params.bodyLength + this.params.flangeRadius + 20 + 25);
    dim4Line.setAttribute('y2', 150);
    dim4Line.setAttribute('stroke', '#2c2a25');
    dim4Line.setAttribute('stroke-width', 1);
    dim4Line.setAttribute('stroke-dasharray', dashPattern);
    this.svg.appendChild(dim4Line);
    
    const dim4Text = document.createElementNS(svgNS, 'text');
    dim4Text.setAttribute('x', 80 + this.params.bodyLength + this.params.flangeRadius + 20 + 30);
    dim4Text.setAttribute('y', 155);
    dim4Text.setAttribute('font-size', `${textSize}px`);
    dim4Text.setAttribute('fill', '#2c2a25');
    const dim4Value = document.createTextNode(this.params.flangeThickness + ' mm');
    dim4Text.appendChild(dim4Value);
    this.svg.appendChild(dim4Text);
    
    // Datum A reference
    const datumRefLine = document.createElementNS(svgNS, 'line');
    datumRefLine.setAttribute('x1', 80 + this.params.bodyLength + this.params.flangeRadius + 30);
    datumRefLine.setAttribute('y1', 140);
    datumRefLine.setAttribute('x2', 80 + this.params.bodyLength + this.params.flangeRadius + 30);
    datumRefLine.setAttribute('y2', 155);
    datumRefLine.setAttribute('stroke', '#e74c3c');
    datumRefLine.setAttribute('stroke-width', 1);
    this.svg.appendChild(datumRefLine);
    
    const datumRefText = document.createElementNS(svgNS, 'text');
    datumRefText.setAttribute('x', 80 + this.params.bodyLength + this.params.flangeRadius + 35);
    datumRefText.setAttribute('y', 148);
    datumRefText.setAttribute('font-size', '9px');
    datumRefText.setAttribute('fill', '#e74c3c');
    datumRefText.setAttribute('transform', 'rotate(90 ' + (80 + this.params.bodyLength + this.params.flangeRadius + 30) + ' 145)');
    const datumRefValue = document.createTextNode('Datum A');
    datumRefText.appendChild(datumRefValue);
    this.svg.appendChild(datumRefText);
  },
  
  // Create tolerance frames
  createToleranceFrames() {
    if (!this.svg) return;
    
    const svgNS = 'http://www.w3.org/2000/svg';
    const frameHeight = 35;
    const frameWidth = 120;
    const spacing = 130;
    const startX = 80;
    
    // Create three tolerance frames
    const framesData = [
      {
        id: 'frame-radial',
        symbol: 'circular',
        tolerance: '0,05 mm',
        datum: 'A',
        mode: 'radial',
        surface: 'Superfície cilíndrica lateral',
        description: 'Controla variação em seção circular da superfície lateral durante uma volta em torno do datum.'
      },
      {
        id: 'frame-axial',
        symbol: 'total',
        tolerance: '0,05 mm',
        datum: 'A',
        mode: 'axial',
        surface: 'Face do flanco',
        description: 'Controla variação em trajetória circular sobre a face durante uma volta em torno do datum.'
      },
      {
        id: 'frame-total',
        symbol: 'total',
        tolerance: '0,05 mm',
        datum: 'A',
        mode: 'total',
        surface: 'Superfície cilíndrica inteira',
        description: 'Controla variação da superfície cilíndrica inteira, rotação do instrumento ao longo do comprimento.'
      }
    ];
    
    framesData.forEach((frame, index) => {
      const x = startX + index * spacing;
      
      // Frame background rect
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', 220);
      rect.setAttribute('width', frameWidth);
      rect.setAttribute('height', frameHeight);
      rect.setAttribute('rx', 4);
      rect.setAttribute('stroke', '#4a4641');
      rect.setAttribute('stroke-width', 1);
      rect.setAttribute('fill', '#f5f0e8');
      rect.setAttribute('class', 'tolerance-frame-svg');
      rect.setAttribute('data-mode', frame.mode);
      rect.addEventListener('click', () => this.onFrameClick(frame.mode));
      this.svg.appendChild(rect);
      
      // Geometric characteristic symbol
      const symbol = this.createSymbolSVG(frame.symbol, x + 8, 223, 14, 14);
      this.svg.appendChild(symbol);
      
      // Tolerance value
      const toleranceText = document.createElementNS(svgNS, 'text');
      toleranceText.setAttribute('x', x + 26);
      toleranceText.setAttribute('y', 235);
      toleranceText.setAttribute('font-size', '10px');
      toleranceText.setAttribute('fill', '#c41e3a');
      toleranceText.setAttribute('font-weight', 'bold');
      toleranceText.textContent = frame.tolerance;
      this.svg.appendChild(toleranceText);
      
      // Datum reference
      const datumText = document.createElementNS(svgNS, 'text');
      datumText.setAttribute('x', x + 26);
      datumText.setAttribute('y', 250);
      datumText.setAttribute('font-size', '8px');
      datumText.setAttribute('fill', '#e74c3c');
      datumText.setAttribute('font-weight', 'bold');
      datumText.textContent = 'A';
      this.svg.appendChild(datumText);
      
      // Leader line to surface annotation
      const leader = document.createElementNS(svgNS, 'line');
      leader.setAttribute('x1', x + frameWidth / 2);
      leader.setAttribute('y1', 220 + frameHeight + 5);
      leader.setAttribute('x2', x + frameWidth / 2);
      leader.setAttribute('y2', 260);
      leader.setAttribute('stroke', '#2c5f8a');
      leader.setAttribute('stroke-width', 1.5);
      leader.setAttribute('stroke-dasharray', '3 3');
      leader.setAttribute('class', 'leader-line');
      this.svg.appendChild(leader);
      
      // Surface annotation text
      const surfaceText = document.createElementNS(svgNS, 'text');
      surfaceText.setAttribute('x', x + frameWidth / 2);
      surfaceText.setAttribute('y', 275);
      surfaceText.setAttribute('font-size', '9px');
      surfaceText.setAttribute('fill', '#4a4641');
      surfaceText.setAttribute('text-anchor', 'middle');
      surfaceText.textContent = frame.surface;
      this.svg.appendChild(surfaceText);
    });
  },
  
  // Create the runout symbol SVG
  createSymbolSVG(type, x, y, width, height) {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    if (type === 'circular') {
      // Circular runout symbol - single arrow
      const path = document.createElementNS(svgNS, 'path');
      // Arrow shape: stem + arrowhead
      path.setAttribute('d', `M${x + width / 2}${y} L${x + width + 4}${y + 4} L${x + width + 4}${y - 4} L${x + width / 2}${y} Z`);
      path.setAttribute('fill', '#2c5f8a');
      path.setAttribute('stroke', 'none');
      return path;
    } else {
      // Total runout symbol - double arrow / broader symbol
      const path = document.createElementNS(svgNS, 'path');
      // Double arrow / wider shape
      path.setAttribute('d', `M${x}${y + height / 4} L${x + width}${y + height / 4} L${x + width}${y + height * 3 / 4} L${x}${y + height * 3 / 4} Z`);
      path.setAttribute('fill', '#2c5f8a');
      path.setAttribute('stroke', 'none');
      return path;
    }
  },
  
  // Handle frame click
  onFrameClick(mode) {
    // Dispatch to main application
    const event = new CustomEvent('toleranceFrameSelected', {
      detail: { mode }
    });
    window.dispatchEvent(event);
  },
  
  // Add resize listener
  addResizeListener() {
    window.addEventListener('resize', () => {
      if (this.svg) {
        this.svg.setAttribute('width', this.container.clientWidth || 600);
      }
    });
  }
};
