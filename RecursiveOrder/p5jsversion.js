/*
Visually explore recursive orderings.


*/

var buttons;
var labels;
var xslider, yslider, zslider, currentSlider;
var movingSlider;
var buttoncount, labelcount;

var leftWidth, centerWidth, rightWidth;
var centerx, rightx;
var cpad;

var threeD;

var squaresize;

var cubesize;
var cubeAnglex;
var cubeAngley;
var rotatingCube;
var rotatex, rotatey;
var rotateRate = 0.003;

var nodes;
var nnodes;
var dimx, dimy, dimz;
var orderType; // lex=-1, mort=2, hilb=1, tile=0
var orderTypeName;
var order;
var invorder;

var useElements;
var elementSize;
var elementBoxSize;
var nel, nel1d;
var elements;
var vertices;

var nodesPerLine;
var nodeSize;
var cachelines;
var totalLines;
var aveMaxDist;
var lineBins;
var misses;

var tileSize, depth, twoN;

function setup(){
  createCanvas(1000, 850, WEBGL);
  textFont("Inconsolata");
  textSize(12);
  leftWidth = 150;
  rightWidth = 200;
  cpad = 15;
  centerWidth = width - leftWidth - rightWidth;
  centerx = leftWidth;
  rightx = width - rightWidth;
  
  threeD = true;
  
  squaresize = centerWidth-cpad-cpad;
  
  cubesize = min(centerWidth, height-cpad-cpad)/2;
  cubeAnglex = -0.4;
  cubeAngley = -0.4;
  
  tileSize = 1;
  depth = 4;
  twoN = round(pow(2,depth));
  dimx = twoN;
  dimy = twoN;
  dimz = twoN;
  nnodes = twoN*twoN*twoN;
  orderType = -1;
  orderTypeName = "Lexicographic";
  
  useElements = false;
  elementSize = 2;
  
  nodesPerLine = 16;
  cachelines = 16;
  aveMaxDist = 0;
  misses = 0;
  
  buildPoints();
  
  buttoncount = 17;
  buttons = [];
  buttons[0] = new Button(rightx, 10, rightWidth-10, 30, "Lexicographic");
  buttons[1] = new Button(rightx, 45, rightWidth-10, 30, "Hilbert");
  buttons[2] = new Button(rightx, 80, rightWidth-10, 30, "Morton");
  buttons[3] = new Button(rightx, 115, rightWidth-10, 30, "Tiled");
  
  buttons[4] = new Button(rightx, 155, 30, 30, "<");
  buttons[5] = new Button(width - 40, 155, 30, 30, ">");
  
  buttons[6] = new Button(rightx, 190, 30, 30, "<");
  buttons[7] = new Button(width - 40, 190, 30, 30, ">");
  
  buttons[8] = new Button(rightx, 225, rightWidth/2 - 10, 30, "2D");
  buttons[9] = new Button(rightx + rightWidth/2+5, 225, rightWidth/2 - 15, 30, "3D");
  
  buttons[10] = new Button(rightx, 270, rightWidth-10, 30, "make elements");
  buttons[11] = new Button(rightx, 305, 30, 30, "<");
  buttons[12] = new Button(width - 40, 305, 30, 30, ">");
  
  buttons[13] = new Button(rightx, 350, 30, 30, "<");
  buttons[14] = new Button(width - 40, 350, 30, 30, ">");
  
  buttons[15] = new Button(rightx, 385, 30, 30, "<");
  buttons[16] = new Button(width - 40, 385, 30, 30, ">");
  
  labelcount = 11;
  labels = [];
  labels[0] = new Label(10, 10, leftWidth-20, 30, "Grid size");
  labels[1] = new Label(10, 45, 40, 30, "X");
  labels[2] = new Label(55, 45, 40, 30, "Y");
  labels[3] = new Label(100, 45, 40, 30, "Z");
  labels[0].centerText(true);
  labels[1].centerText(true);
  labels[2].centerText(true);
  labels[3].centerText(true);
  
  labels[4] = new Label(rightx + 35, 155, rightWidth - 80, 30, "Tile size= "+str(tileSize));
  labels[5] = new Label(rightx + 35, 190, rightWidth - 80, 30, "Depth= "+str(depth));
  labels[4].showBox(true);
  labels[5].showBox(true);
  
  labels[6] = new Label(rightx + 35, 305, rightWidth - 80, 30, "el order = "+str(elementSize-1));
  
  labels[7] = new Label(rightx + 35, 350, rightWidth - 80, 30, "nodes/$line= "+str(nodesPerLine));
  labels[8] = new Label(rightx + 35, 385, rightWidth - 80, 30, "cache lines= "+str(cachelines));
  labels[9] = new Label(rightx, 430, rightWidth, 50, "Lines used/element\n(ave =   )");
  labels[10] = new Label(rightx, 480, rightWidth, 40, "Add elements to see");
  labels[9].setSize(14);
  
  xslider = new Slider(10, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  yslider = new Slider(55, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  zslider = new Slider(100, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  movingSlider = false;
}

function draw(){
  background(255);
  for(var j=0; j<buttoncount; j++){
      buttons[j].display();
  }
  for(var j=0; j<labelcount; j++){
      labels[j].display();
  }
  xslider.display();
  yslider.display();
  if(threeD){
    zslider.display();
  }
  
  fill(0);
  text(orderTypeName + " nodes", width/2, 10);
  
  if(threeD){
    // Draw the box
    noFill();
    stroke(150);
    translate(centerx + centerWidth/2, height/2, 0);
    rotateX(cubeAnglex);
    rotateY(cubeAngley);
    box(cubesize);
    
    
    // Draw the elements
    if(useElements){
      stroke(100);
      strokeWeight(3);
      
      for(var ei=0; ei<nel; ei++){
        drawBox(ei);
      }
    }
    
    
    // Draw the nodes
    colorMode(HSB, round(nnodes*1.2));
    strokeWeight(8);
    for(var i=0; i<nnodes; i++){
      var ind = order[i];
      stroke(i, nnodes, nnodes);
      point(nodes[ind].x, nodes[ind].y, nodes[ind].z);
    }
    
    // Draw the curve
    strokeWeight(2);
    var last = nodes[order[0]];
    for(var i=1; i<nnodes; i++){
      var ind = order[i];
      stroke(i-1, nnodes, nnodes);
      line(last.x, last.y, last.z, nodes[ind].x, nodes[ind].y, nodes[ind].z);
      last = nodes[ind];
    }
  
  }else{
    // Draw the square
    noFill();
    stroke(150);
    rect(centerx+cpad, cpad, squaresize, squaresize);
    
    // Draw the elements
    if(useElements){
      stroke(100);
      strokeWeight(3);
      
      for(var ei=0; ei<nel; ei++){
        drawSquare(ei);
      }
    }
    
    // Draw the nodes
    colorMode(HSB, round(nnodes*1.2));
    strokeWeight(8);
    for(var i=0; i<nnodes; i++){
      var ind = order[i];
      stroke(i, nnodes, nnodes);
      point(nodes[ind].x, nodes[ind].y);
    }
    
    // Draw the curve
    strokeWeight(2);
    var last = nodes[order[0]];
    for(var i=1; i<nnodes; i++){
      var ind = order[i];
      stroke(i-1, nnodes, nnodes);
      line(last.x, last.y, nodes[ind].x, nodes[ind].y);
      last = nodes[ind];
    }
  }
  
  colorMode(RGB,255);
}

function drawBox(ei){
  var p0 = nodes[vertices[ei][0]];
  var p1 = nodes[vertices[ei][1]];
  var p2 = nodes[vertices[ei][2]];
  var p3 = nodes[vertices[ei][3]];
  var p4 = nodes[vertices[ei][4]];
  var p5 = nodes[vertices[ei][5]];
  var p6 = nodes[vertices[ei][6]];
  var p7 = nodes[vertices[ei][7]];
  line(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
  line(p0.x, p0.y, p0.z, p2.x, p2.y, p2.z);
  line(p0.x, p0.y, p0.z, p4.x, p4.y, p4.z);
  line(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z);
  line(p1.x, p1.y, p1.z, p5.x, p5.y, p5.z);
  line(p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
  line(p2.x, p2.y, p2.z, p6.x, p6.y, p6.z);
  line(p3.x, p3.y, p3.z, p7.x, p7.y, p7.z);
  line(p4.x, p4.y, p4.z, p5.x, p5.y, p5.z);
  line(p4.x, p4.y, p4.z, p6.x, p6.y, p6.z);
  line(p7.x, p7.y, p7.z, p5.x, p5.y, p5.z);
  line(p7.x, p7.y, p7.z, p6.x, p6.y, p6.z);
}

function drawSquare(ei){
  var p0 = nodes[vertices[ei][0]];
  var p1 = nodes[vertices[ei][1]];
  var p2 = nodes[vertices[ei][2]];
  var p3 = nodes[vertices[ei][3]];
  line(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
  line(p0.x, p0.y, p0.z, p2.x, p2.y, p2.z);
  line(p3.x, p3.y, p3.z, p1.x, p1.y, p1.z);
  line(p3.x, p3.y, p3.z, p2.x, p2.y, p2.z);
}

function mouseClicked(){
  var clickedItem = -1;
  for(var j=0; j<buttoncount; j++){
    if(buttons[j].containsMouse()){
      clickedItem = j;
    }
  }
  if(xslider.containsMouse()){ clickedItem = 100; }
  if(yslider.containsMouse()){ clickedItem = 101; }
  if(zslider.containsMouse()){ clickedItem = 102; }
  
  // Handle buttons and sliders
  if(clickedItem >= 0){
    switch(clickedItem){
      case 0: // lex
        orderType = -1;
        orderTypeName = "Lexicographic";
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        break;
      case 2: // mort
        orderType = 2;
        orderTypeName = "Morton";
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        break;
      case 1: // hilb
        orderType = 1;
        orderTypeName = "Hilbert";
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        break;
      case 3: // tile
        orderType = 0;
        orderTypeName = "Tiled("+str(tileSize)+")";
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        break;
      case 4: // tile down
        tileSize = max(1,tileSize-1);
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        labels[4].setText("Tile size= "+str(tileSize));
        break;
      case 5: // tile up
        tileSize = min(tileSize+1, twoN);
        buildPoints();
        if(useElements){
          computeCacheStats();
        }
        labels[4].setText("Tile size= "+str(tileSize));
        break;
      case 6: // depth down
        depth = max(1,depth-1);
        changedN();
        labels[5].setText("Depth= "+str(depth));
        break;
      case 7: // depth up
        depth = min(depth+1,6);
        changedN();
        labels[5].setText("Depth= "+str(depth));
        break;
      case 8: // 2D
        threeD = false;
        changedN();
        break;
      case 9: // 3D
        threeD = true;
        changedN();
        break;
      case 10: // use elements
        useElements = !useElements;
        if(useElements){
          buttons[10].setText("remove elements");
          changedElements();
        }else{
          buttons[10].setText("make elements");
        }
        break;
      case 11: // elsize down
        elementSize = max(2,elementSize-1);
        changedElements();
        break;
      case 12: // elsize up
        elementSize = min(elementSize+1,twoN);
        changedElements();
        break;
      case 13: // nodes/line down
        nodesPerLine = max(1,nodesPerLine-1);
        changedCache();
        break;
      case 14: // nodes/line up
        nodesPerLine = min(nodesPerLine+1,nnodes);
        changedCache();
        break;
      case 15: // cachelines down
        cachelines = max(1,cachelines-1);
        changedCache();
        break;
      case 16: // cachelines up
        cachelines = min(cachelines+1,nnodes);
        changedCache();
        break;
        
      case 100:
        if(!useElements){xslider.clickSlide();}
        dimx = xslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
      case 101:
        if(!useElements){yslider.clickSlide();}
        dimy = yslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
      case 102:
        if(!useElements){zslider.clickSlide();}
        dimz = zslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
    }
  }
}

function mousePressed(){
  // If pressed on the cube, initiate rotation
  if(!movingSlider && (mouseX >= centerx)&&(mouseX <= (centerx+centerWidth))&&(mouseY >= 0)&&(mouseY <= height)){
    rotatingCube = true;
    rotatex = mouseX;
    rotatey = mouseY;
  }else if(!rotatingCube && xslider.containsMouse()){
    movingSlider = true;
    currentSlider = xslider;
  }else if(!rotatingCube && yslider.containsMouse()){
    movingSlider = true;
    currentSlider = yslider;
  }else if(!rotatingCube && zslider.containsMouse()){
    movingSlider = true;
    currentSlider = zslider;
  }
  
  // If pressed on slider, begin sliding
}

function mouseReleased(){
  rotatingCube = false;
  movingSlider = false;
}

function mouseDragged(){
  // If pressed in cube, rotate
  if(rotatingCube){
    cubeAngley += (mouseX-rotatex)*rotateRate;
    cubeAnglex -= (mouseY-rotatey)*rotateRate;
    rotatex = mouseX;
    rotatey = mouseY;
  }else if(movingSlider){
    if(!useElements){
      currentSlider.moveTo(mouseY);
      if(dimx != xslider.getValue() || dimy != yslider.getValue() ||dimz != zslider.getValue()){
        dimx = xslider.getValue();
        dimy = yslider.getValue();
        dimz = zslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Build the grid, etc.
///////////////////////////////////////////////////////////////////////////////
function distance(a, b){
  var p1 = 0;
  var p2 = 0;
  var set = 0;
  for(var i=0; i<nnodes; i++){
    if(order[i] == a){ 
      p1 = i; 
      set +=1;
    }
    if(order[i] == b){ 
      p2 = i; 
      set +=1;
    }
    if(set==2){
      break;
    }
  }
  
  return abs(p2-p1);
}

function maxDistance(nod, np){
  var minnod = nnodes;
  var maxnod = 0;
  var inverted = invert_ordering(order, nnodes);
  
  for(var i=0; i<np; i++){
    if(inverted[nod[i]] > maxnod){
      maxnod = inverted[nod[i]];
    }
    if(inverted[nod[i]] < minnod){
      minnod = inverted[nod[i]];
    }
  }
  
  return maxnod-minnod;
}

function changedN(){
  twoN = round(pow(2,depth));
  dimx = twoN;
  dimy = twoN;
  dimz = twoN;
  
  if(useElements){
    changedElements();
    
  }else{
    buildPoints();
    
    xslider.setRange(1,twoN);
    yslider.setRange(1,twoN);
    zslider.setRange(1,twoN);
    xslider.setValue(twoN);
    yslider.setValue(twoN);
    zslider.setValue(twoN);
  }
  
  
}

function changedElements(){
  labels[6].setText("el order = "+str(elementSize-1));
  if(useElements){
    dimx = twoN - (twoN-1)%(elementSize-1);
    dimy = dimx;
    dimz = dimx;
    
    xslider.setValue(dimx);
    yslider.setValue(dimy);
    zslider.setValue(dimz);
    
    buildPoints();
    buildElements();
    computeCacheStats();
  }
}

function changedCache(){
  
  labels[7].setText("nodes/$line= "+str(nodesPerLine));
  labels[8].setText("cache lines= "+str(cachelines));
  
  if(useElements){
    computeCacheStats();
  }
}

function rescaleDepthIfNeeded(){
  dimx = xslider.getValue();
  dimy = yslider.getValue();
  if(threeD){
    dimz = zslider.getValue();
    
    if(dimx <= twoN/2 && dimy <= twoN/2 && dimz <= twoN/2){
      depth -= 1;
      twoN = round(pow(2,depth));
      labels[5].setText("Depth= "+str(depth));
      rescaleDepthIfNeeded();
    }else if(dimx > twoN || dimy > twoN || dimz > twoN){
      depth += 1;
      twoN = round(pow(2,depth));
      labels[5].setText("Depth= "+str(depth));
      rescaleDepthIfNeeded();
    }
    
  }else{
    if(dimx <= twoN/2 && dimy <= twoN/2){
      depth -= 1;
      twoN = round(pow(2,depth));
      labels[5].setText("Depth= "+str(depth));
      rescaleDepthIfNeeded();
    }else if(dimx > twoN || dimy > twoN){
      depth += 1;
      twoN = round(pow(2,depth));
      labels[5].setText("Depth= "+str(depth));
      rescaleDepthIfNeeded();
    }
  }
  
}

function buildPoints(){
  if(depth == 0){
    nnodes = 1;
    nodes = [];
    order = [];
    var twoN = 1;
    var cellsize = cubesize;
    nodes[0] = new Point3(0,0,0);
    order[0] = 0;
    invorder = order;
    return;
  }
  if(threeD){
    nnodes = dimx*dimy*dimz;
    nodes = [];
    order = [];
    var twoN = round(pow(2,depth));
    var cellsize = cubesize/(twoN-1);
    var ind, px, py, pz;
    for(var k=0; k<dimz; k++){
      for(var j=0; j<dimy; j++){
        for(var i=0; i<dimx; i++){
          ind = i + dimx*(j + dimy*k);
          px = -cubesize/2 + i*cellsize;
          py = cubesize/2 - j*cellsize;
          pz = cubesize/2 - k*cellsize;
          nodes[ind] = new Point3(px,py,pz);
          order[ind] = ind;
        }
      }
    }
    
    if(orderType > 0){
      var griddim = [];
      griddim[0] = dimx;
      griddim[1] = dimy;
      griddim[2] = dimz;
      order = get_recursive_order(orderType, 3, griddim);
    }else if(orderType == 0){
      var griddim = [];
      griddim[0] = dimx;
      griddim[1] = dimy;
      griddim[2] = dimz;
      var tiledim = [];
      tiledim[0] = tileSize;
      tiledim[1] = tileSize;
      tiledim[2] = tileSize;
      order = tiled_order_3d(griddim, tiledim, false);
    }
    
  }else{ //2D
    nnodes = dimx*dimy;
    nodes = [];
    order = [];
    var twoN = round(pow(2,depth));
    var cellsize = squaresize/(twoN-1);
    var ind, px, py;
    for(var j=0; j<dimy; j++){
      for(var i=0; i<dimx; i++){
        ind = i + dimx*j;
        px = centerx + cpad + i*cellsize;
        py = height - cpad - j*cellsize;
        nodes[ind] = new Point3(px,py,0);
        order[ind] = ind;
      }
    }
    
    if(orderType > 0){
      var griddim = [];
      griddim[0] = dimx;
      griddim[1] = dimy;
      order = get_recursive_order(orderType, 2, griddim);
    }else if(orderType == 0){
      var griddim = [];
      griddim[0] = dimx;
      griddim[1] = dimy;
      var tiledim = [];
      tiledim[0] = tileSize;
      tiledim[1] = tileSize;
      order = tiled_order_2d(griddim, tiledim, false);
    }
  }
  invorder = invert_ordering(order, nnodes);
}

function buildElements(){
  nel1d = round((dimx-1)/(elementSize-1));
  if(nel1d<1){
    nel1d=1;
  }
  var np = elementSize;
  var nv;
  if(threeD){
    nel = nel1d*nel1d*nel1d;
    np = np*np*np;
    nv=8;
    elementBoxSize = cubesize/nel1d;
  }else{
    nel = nel1d*nel1d;
    np = np*np;
    nv=4;
    elementBoxSize = squaresize/nel1d;
  }
  elements = [];
  vertices = [];
  
  var refel = [];
  var rind, gind, lowerleft, elind;
  if(threeD){
    for(var k=0; k<elementSize; k++){
      for(var j=0; j<elementSize; j++){
        for(var i=0; i<elementSize; i++){
          rind = i + elementSize*(j + elementSize*k);
          gind = i + dimx*(j + dimy*k);
          refel[rind] = gind;
        }
      }
    }
    
    for(var k=0; k<nel1d; k++){
      for(var j=0; j<nel1d; j++){
        for(var i=0; i<nel1d; i++){
          lowerleft = i*(elementSize-1)+dimx*(j*(elementSize-1)+dimy*k*(elementSize-1));
          elind = i + nel1d*(j + nel1d*k);
          for(var ni=0; ni<np; ni++){
            elements[elind][ni] = lowerleft + refel[ni];
          }
          vertices[elind][0] = lowerleft;
          vertices[elind][1] = lowerleft + refel[elementSize-1];
          vertices[elind][2] = lowerleft + refel[elementSize*(elementSize-1)];
          vertices[elind][3] = lowerleft + refel[elementSize*elementSize-1];
          vertices[elind][4] = lowerleft + refel[elementSize*elementSize*(elementSize-1)];
          vertices[elind][5] = lowerleft + refel[elementSize*elementSize*(elementSize-1) + elementSize-1];
          vertices[elind][6] = lowerleft + refel[elementSize*elementSize*(elementSize-1) + elementSize*(elementSize-1)];
          vertices[elind][7] = lowerleft + refel[elementSize*elementSize*elementSize-1];
        }
      }
    }
    
  }else{
    for(var j=0; j<elementSize; j++){
      for(var i=0; i<elementSize; i++){
        rind = i + elementSize*j;
        gind = i + dimx*j;
        refel[rind] = gind;
      }
    }
    
    for(var j=0; j<nel1d; j++){
      for(var i=0; i<nel1d; i++){
        lowerleft = i*(elementSize-1)+dimx*(j*(elementSize-1));
        elind = i + nel1d*(j);
        for(var ni=0; ni<np; ni++){
          elements[elind][ni] = lowerleft + refel[ni];
        }
        vertices[elind][0] = lowerleft;
        vertices[elind][1] = lowerleft + refel[elementSize-1];
        vertices[elind][2] = lowerleft + refel[elementSize*(elementSize-1)];
        vertices[elind][3] = lowerleft + refel[elementSize*elementSize-1];
      }
    }
  }
}

function computeCacheStats(){
  // For each element find max distance and number of lines needed
  var maxDist = 0;
  var lines = 0;
  totalLines = nnodes/nodesPerLine;
  if(nnodes%nodesPerLine > 0){
    totalLines += 1;
  }
  
  // Record these stats
  aveMaxDist = 0.0;
  
  var np;
  var coveredlines; // list of cache lines used by this element
  if(threeD){
    np = elementSize*elementSize*elementSize;
  }else{
    np = elementSize*elementSize;
  }
  coveredlines = [];
  lineBins = [];
  
  // Loop ever elements
  for(var ei=0; ei<nel; ei++){
    maxDist = 0;
    lines = 0;
    
    // Loop over nodes
    var ind, lin;
    var already;
    for(var ni=0; ni<np; ni++){
      already = false;
      ind = invorder[elements[ei][ni]];
      lin = ind/nodesPerLine;
      coveredlines[ni] = lin;
      // Check if line is already covered
      for(var li=0; li<ni; li++){
        if(coveredlines[li] == lin){
          already = true;
          break;
        }
      }
      if(!already){
        lines += 1;
      }
      
      // Find max distance between nodes
      for(var nj=ni+1; nj<np; nj++){
        maxDist = max(abs(ind-invorder[elements[ei][nj]]), maxDist);
      }
    }
    
    // add to totals
    lineBins[lines-1] += 1;
    aveMaxDist += maxDist;
  }
  
  // averages
  aveMaxDist = aveMaxDist/nel;
  
  var aveLinesUsed = 0.0;
  
  
  var binvar = "";
  for(var ni=0; ni<np; ni++){
    if(lineBins[ni] > 0){
      binvar += "["+str(ni+1)+"] - "+str(lineBins[ni])+"\n";
      aveLinesUsed += lineBins[ni]*(ni+1);
    }
  }
  aveLinesUsed /= nel;
  labels[9].setText("Lines used/element\n(ave = "+str(aveLinesUsed)+")");
  labels[10].setText(binstring);
}

////////////////////////////////////////////////////////////////////////////////////////////
// reordering
////////////////////////////////////////////////////////////////////////////////////////////

/*
// Create a recursive ordering
// Each state maps to a configuration of states with a rule and ordering
//
// For example, 2D Hilbert has 4 states: n, ], [, u labeled here as s1,s2,s3,s4
//
//       s1 s1
// s1 -> s2 s3  This state, s1, corresponds to rule [s2,s3,s1,s1] and ordering [1,3,4,2]
// 
// Morton is the simplest with one rule [s1,s2,s3,s4] and ordering [1,2,3,4]
*/

// Use this function to build an ordering for a specified grid size
function get_recursive_order(type, dim, griddim){
    var maxgriddim, N, twotoN, fullnnodes, subind;
    var rorder_rules;
    var rorder;
    var subrorder;
    var nnodes = 1;
    for(var i=0; i<dim; i++){ //i=1:length(griddim)
        nnodes = nnodes*griddim[i];
    }
    
    if(dim == 2){
        // Find the smallest N such that 2^N >= max(griddim)
        maxgriddim = max(griddim[0],griddim[1]);
        N=0;
        while(maxgriddim > pow(2,N)){
            N = N+1;
        }
        twotoN = round(pow(2,depth));
        fullnnodes = twotoN*twotoN;
        
        if(type == 1){ //HILBERT_ORDERING
            rorder_rules = hilbert_ordering_rules(2); // The RecursiveOrdering object
            rorder = build_ordering_2d(rorder_rules, N, false); // The ordering (false -> inverse)
        }else if(type == 2){ //MORTON_ORDERING
            rorder_rules = morton_ordering_rules(2); // The RecursiveOrdering object
            rorder = build_ordering_2d(rorder_rules, N, false); // The ordering (false -> inverse)
        }else{
          rorder = [];
        }
        
        // Truncate ordering to match griddim size
        subrorder = [];
        subind = 0;
        for(var i=0; i<fullnnodes; i++){ // i=1:length(rorder)
            // Get coordinates in 2^N grid
            var hind = rorder[i];
            var hx = hind%twotoN;
            var hy = round(floor(hind * 1.0 / (twotoN)));
            
            if(hx < griddim[0] && hy < griddim[1]){
                var gind = hx + griddim[0]*hy;
                subrorder[subind] = gind;
                subind += 1;
            }
        }
        return subrorder;
        
    }else if(dim == 3){
        // Find the smallest N such that 2^N >= max(griddim)
        maxgriddim = max(griddim[0],max(griddim[1],griddim[2]));
        N=0;
        while(maxgriddim > pow(2,N)){
            N = N+1;
        }
        twotoN = round(pow(2,depth));
        fullnnodes = twotoN*twotoN*twotoN;
        
        if(type == 1){ //HILBERT_ORDERING
            rorder_rules = hilbert_ordering_rules(3); // The RecursiveOrdering object
            rorder = build_ordering_3d(rorder_rules, N, false); // The ordering (false -> inverse)
        }else if(type == 2){ //MORTON_ORDERING
            rorder_rules = morton_ordering_rules(3); // The RecursiveOrdering object
            rorder = build_ordering_3d(rorder_rules, N, false); // The ordering (false -> inverse)
        }else{
          rorder = [];
        }
        
        // Truncate ordering to match griddim size
        subrorder = [];
        subind = 0;
        for(var i=0; i<fullnnodes; i++){ // i=1:length(rorder)
            // Get coordinates in 2^N grid
            var hind = rorder[i];
            var hx = hind%twotoN;
            var hy = round(floor((hind%(twotoN*twotoN)) * 1.0 / (twotoN)));
            var hz = round(floor(hind * 1.0 / (twotoN*twotoN)));
            if(hx < griddim[0] && hy < griddim[1] && hz < griddim[2]){
                var gind = hx + griddim[0]*(hy + griddim[1]*hz);
                subrorder[subind] = gind;
                subind += 1;
            }
        }
        //println(rorder);
        //println(subind);
        
        return subrorder;
    }
    
    subrorder = [];
    return subrorder;
}

// Use this to reorder the nodes in a given grid.
function reorder_grid_recursive_3d(grid, griddim, type){
    var dim = 3; //dim = size(grid.allnodes,2);
    var nnodes = griddim[0]*griddim[1]*griddim[2]; //nnodes = size(grid.allnodes,1);
    
    // get the ordering
    var rordering = get_recursive_order(type, dim, griddim);
    // invert it for transfering the grid
    // rordering = invert_ordering(rordering);
    
    var newnodes = []; //zeros(size(grid.allnodes));
    
    for(var mi=0; mi<nnodes; mi++){ // mi=1:length(rordering)
        newnodes[mi] = grid[rordering[mi]];
    }
    
    return newnodes;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ordering rule sets

// Build a Morton Ordering
function morton_ordering_rules(dim){
    if(dim == 2){
        var tmp1 = [[1,1,1,1]];
        var tmp2 = [[1,2,3,4]];
        return new RecursiveOrdering(1, tmp1, tmp2);
    }else if(dim == 3){
        var tmp1 = [[1,1,1,1,1,1,1,1]];
        var tmp2 = [[1,2,3,4,5,6,7,8]];
        return new RecursiveOrdering(1, tmp1, tmp2);
    }
    var tmp = [[0]];
    return new RecursiveOrdering(0,tmp,tmp);
}

// Build a Hilbert Ordering
function hilbert_ordering_rules(dim){
    if(dim == 2){
        var tmp1 = [[2,3,1,1], [1,2,4,2], [3,1,3,4], [4,4,2,3]]; // state indices
        var tmp2 = [[1,4,2,3], [1,2,4,3], [3,4,2,1], [3,2,4,1]]; // indexing order
        return new RecursiveOrdering(4, tmp1, tmp2);
    }else if(dim == 3){
        // Oh boy rotations for each state
        var rots = [[0,0,0,0],
                [1,2,0,0],
                [1,2,1,2],
                [2,0,0,0],
                [1,2,2,0],
                [3,0,0,0],
                [1,1,1,0],
                [1,1,2,0],
                [3,3,3,0],
                [2,3,0,0],
                [2,1,1,1],
                [3,3,0,0],
                [2,2,2,0],
                [1,0,0,0],
                [1,1,3,0],
                [1,2,2,2],
                [1,3,0,0],
                [2,2,0,0],
                [1,3,3,3],
                [3,2,2,1],
                [1,1,0,0],
                [3,3,2,0],
                [2,2,1,0],
                [2,2,3,0]];
        var first = [1,4,2,3,8,5,7,6];
        var orders = [];
        for(var i=0; i<24; i++){ // i=1:24
            //push!(orders, rotations(first, rots[i]));
            orders[i] = rotations(first, rots[i]);
    }
        
        // state[ rules]
        var rules = [[2,12,3,3,20,12,17,17],
                [3,1,11,21,16,1,16,21],
                [1,18,19,19,2,10,2,10],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0], // These ones aren't used, so I'll just leave zeros
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [18,3,12,11,18,20,12,20],
                [17,17,21,12,2,10,2,10],
                [11,11,1,10,19,19,1,16],
                [0,0,0,0,0,0,0,0], 
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [18,2,12,2,18,17,12,19],
                [20,16,20,16,1,18,11,11],
                [21,10,3,3,21,16,17,17],
                [20,16,20,16,3,3,21,12],
                [10,1,10,21,17,1,19,21],
                [11,11,2,18,19,19,20,18],
                [0,0,0,0,0,0,0,0], 
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0]];
        
        return new RecursiveOrdering(24, rules, orders);
    }
    var tmp = [[0]];
    return new RecursiveOrdering(0,tmp,tmp);
}

function rotation_3d(a, axis){
    var r = [[5, 6, 1, 2, 7, 8, 3, 4], [2, 6, 4, 8, 1, 5, 3, 7], [2, 4, 1, 3, 6, 8, 5, 7]];
    var b = []; //zeros(Int,length(a));
    for(var i=0; i<8; i++){ // i=1:length(a)
        b[r[axis-1][i]-1] = a[i];
    }
    return b;
}

function rotations(a, rots){
    for(var i=0; i<4; i++){ // i=1:length(rots)
        if(rots[i] > 0){
          a = rotation_3d(a,rots[i]);
        }
    }
    return a;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Build the ordering for a (2^N)^D grid
function build_ordering_2d(ord, N, invert){
  
    var nnodes = round(pow(pow(2,N),2));
    var lexorderx = []; //zeros(Int,nnodes,3);
    var lexordery = [];
    var twotoN = round(pow(2,N));
    for(var j=1; j<=twotoN; j++){
        for(var i=1; i<=twotoN; i++){
            var ni = i + twotoN*(j-1);
            lexorderx[ni-1] = i;
            lexordery[ni-1] = j;
        }
    }
    
    var bbox = [];
    var tmpbbox = [];
    bbox[1] = 1.0;
    bbox[3] = 1.0;
    bbox[2] = twotoN*1.0;
    bbox[4] = twotoN*1.0;
    
    var centerx = (bbox[1]+bbox[2])*0.5;
    var centery = (bbox[3]+bbox[4])*0.5;
    var tmpcenterx = 0;
    var tmpcentery = 0;
    
    var result = [];
    var vertexx, vertexy;
    for(var ni=0; ni<nnodes; ni++){
        vertexx = lexorderx[ni];
        vertexy = lexordery[ni];
        tmpbbox[1] = bbox[1];
        tmpbbox[2] = bbox[2];
        tmpbbox[3] = bbox[3];
        tmpbbox[4] = bbox[4];
        tmpcenterx = centerx;
        tmpcentery = centery;
        
        // Find the index for this node
        index = 0;
        var state = 0;
        for(var i=0; i<N; i++){
            index = index<<2;
            // Which octant is it in?
            var octant = 0;
            if(vertexx > tmpcenterx){
                octant = octant+1;
            }
            if(vertexy > tmpcentery){
                octant = octant+2;
            }
            //octant += 1; // 1-based index
            
            // Add this octant's ordering position to index 
            index += ord.orders[state][octant] - 1;
            
            // Update the state to that octant's state according to rule for this one.
            state = ord.rules[state][octant] - 1;
            
            //println("ni="+str(ni)+" level="+str(i)+" oct="+str(octant)+" index="+str(index)+" state="+str(state));
            
            // Shrink the box to one octant
            if(vertexx > tmpcenterx){
                tmpbbox[1] = floor(tmpcenterx);
            }else{
                tmpbbox[2] = floor(tmpcenterx);
            }
            if(vertexy > tmpcentery){
                tmpbbox[3] = floor(tmpcentery);
            }else{
                tmpbbox[4] = floor(tmpcentery);
            }
            tmpcenterx = (tmpbbox[1]+tmpbbox[2])*0.5;
            tmpcentery = (tmpbbox[3]+tmpbbox[4])*0.5;
        }
        
        // add one for 1-based index
        //index += 1;
        //println("index for ni="*string(ni)*" is "*string(index));
        if(invert){
            result[ni] = index;
        }else{
            result[index] = ni;
        }
    }
    
    return result;
    
}

// Build the ordering for a (2^N)^D grid
function build_ordering_3d(ord, N, invert){
    var nnodes = round(pow(pow(2,N),3));
    var lexorderx = []; //zeros(Int,nnodes,3);
    var lexordery = [];
    var lexorderz = [];
    var twotoN = round(pow(2,N));
    for(var k=1; k<=twotoN; k++){
        for(var j=1; j<=twotoN; j++){
            for(var i=1; i<=twotoN; i++){
                var ni = i + twotoN*((j-1) + twotoN*(k-1));
                lexorderx[ni-1] = i;
                lexordery[ni-1] = j;
                lexorderz[ni-1] = k;
            }
        }
    }
    
    var bbox = [];
    var tmpbbox = [];
    bbox[1] = 1.0;
    bbox[3] = 1.0;
    bbox[5] = 1.0;
    bbox[2] = twotoN*1.0;
    bbox[4] = twotoN*1.0;
    bbox[6] = twotoN*1.0;
    
    var centerx = (bbox[1]+bbox[2])*0.5;
    var centery = (bbox[3]+bbox[4])*0.5;
    var centerz = (bbox[5]+bbox[6])*0.5;
    var tmpcenterx = 0;
    var tmpcentery = 0;
    var tmpcenterz = 0;
    
    var result = [];
    var vertexx, vertexy, vertexz;
    for(var ni=0; ni<nnodes; ni++){
        vertexx = lexorderx[ni];
        vertexy = lexordery[ni];
        vertexz = lexorderz[ni];
        tmpbbox[1] = bbox[1];
        tmpbbox[2] = bbox[2];
        tmpbbox[3] = bbox[3];
        tmpbbox[4] = bbox[4];
        tmpbbox[5] = bbox[5];
        tmpbbox[6] = bbox[6];
        tmpcenterx = centerx;
        tmpcentery = centery;
        tmpcenterz = centerz;
        
        // Find the index for this node
        index = 0;
        var state = 0;
        for(var i=0; i<N; i++){
            index = index<<3;
            // Which octant is it in?
            var octant = 0;
            if(vertexx > tmpcenterx){
                octant = octant+1;
            }
            if(vertexy > tmpcentery){
                octant = octant+2;
            }
            if(vertexz > tmpcenterz){
                octant = octant+4;
            }
            //octant += 1; // 1-based index
            
            // Add this octant's ordering position to index 
            index += ord.orders[state][octant] - 1;
            
            // Update the state to that octant's state according to rule for this one.
            state = ord.rules[state][octant] - 1;
            
            //println("ni="+str(ni)+" level="+str(i)+" oct="+str(octant)+" index="+str(index)+" state="+str(state));
            
            // Shrink the box to one octant
            if(vertexx > tmpcenterx){
                tmpbbox[1] = floor(tmpcenterx);
            }else{
                tmpbbox[2] = floor(tmpcenterx);
            }
            if(vertexy > tmpcentery){
                tmpbbox[3] = floor(tmpcentery);
            }else{
                tmpbbox[4] = floor(tmpcentery);
            }
            if(vertexz > tmpcenterz){
                tmpbbox[5] = floor(tmpcenterz);
            }else{
                tmpbbox[6] = floor(tmpcenterz);
            }
            tmpcenterx = (tmpbbox[1]+tmpbbox[2])*0.5;
            tmpcentery = (tmpbbox[3]+tmpbbox[4])*0.5;
            tmpcenterz = (tmpbbox[5]+tmpbbox[6])*0.5;
        }
        
        // add one for 1-based index
        //index += 1;
        //println("index for ni="*string(ni)*" is "*string(index));
        if(invert){
            result[ni] = index;
        }else{
            result[index] = ni;
        }
    }
    
    return result;
}

function invert_ordering(ord, nnodes){
    var iord = [];
    for(var i=1; i<nnodes; i++){
        iord[ord[i]] = i;
    }
    return iord;
}

class RecursiveOrdering{
    // var states;      // Number of possible states
    // var rules;   // Rules for each state mapping sectors to states
    // var orders;  // Ordering for each state
    
    constructor(num, rule, order){
      this.states = num;
      this.rules = rule;
      this.orders = order;
    }
}

/*
// Builds a tiled ordering of a 2D or 3D grid
// Tiles are tiledim in size (except edge tiles which could be smaller)
// Grid has griddim size
// Returns the global order in which objects shall be indexed.
// example: 2D, griddim=(4,4), tiledim=(3,3)
//     13  14  15  16
//      7   8   9  12
//      4   5   6  11
//      1   2   3  10
// Invert=true will give  [1, 2, 3, 5, 6, 7 ...]   (encode?)
// Invert=false will give [1, 2, 3, 10, 4, 5, ...] (decode?)
*/

function tiled_order_2d(griddim, tiledim, invert){
    // griddim and tiledim are tuples of grid dimensions
    var gridx = griddim[0];
    var gridy = griddim[1];
    var tilex = tiledim[0];
    var tiley = tiledim[1];
    
    var nnodes = gridx*gridy;
    var tiled = []; // The ordering
    
    // Count full tiles and renaining edge nodes.
    var fullx = round(floor(gridx / tilex));
    var partialx = gridx - fullx*tilex;
    var fully = round(floor(gridy / tiley));
    var partialy = gridy - fully*tiley;
    
    var tind = -1;
    var ytill, xtill, gind;
    for(var j=0; j<=fully; j++){
        ytill = j<fully ? tiley : partialy;
        for(var i=0; i<=fullx; i++){
            xtill = i<fullx ? tilex : partialx;
            
            // Add that tile's nodes one at a time
            for(var tj=0; tj<ytill; tj++){
                for(var ti=0; ti<xtill; ti++){
                    gind = ti + i*tilex + gridx*(tj + j*tiley);
                    tind = tind + 1;
                    if(invert){
                        tiled[gind] = tind;
                    }else{
                        tiled[tind] = gind;
                    }
                }
            }
            
        }
    }
    
    return tiled;
}

function tiled_order_3d(griddim, tiledim, invert){
    // griddim and tiledim are tuples of grid dimensions
    var gridx = griddim[0];
    var gridy = griddim[1];
    var gridz = griddim[2];
    var tilex = tiledim[0];
    var tiley = tiledim[1];
    var tilez = tiledim[2];
    
    var nnodes = gridx*gridy*gridz;
    var tiled = []; // The ordering
    
    // Count full tiles and renaining edge nodes.
    var fullx = round(floor(gridx / tilex));
    var partialx = gridx - fullx*tilex;
    var fully = round(floor(gridy / tiley));
    var partialy = gridy - fully*tiley;
    var fullz = round(floor(gridz / tilez));
    var partialz = gridz - fullz*tilez;
    
    var tind = -1;
    var tx, ty, tz, xtill, ytill, ztill, gind;
    var Ntiles = (fullx+1)*(fully+1)*(fullz+1);
    for(var i=0; i<Ntiles; i++){
        // Get the tile coordinates in (x,y,z)
        tx = round(i%(fullx+1));
        ty = round(floor(i%((fullx+1)*(fully+1))/(fullx+1)));
        tz = round(floor(i/((fullx+1)*(fully+1))));
        xtill = (tx<fullx) ? tilex : partialx;
        ytill = (ty<fully) ? tiley : partialy;
        ztill = (tz<fullz) ? tilez : partialz;
        
        // Add that tile's nodes one at a time
        for(var tk=0; tk<ztill; tk++){
            for(var tj=0; tj<ytill; tj++){
                for(var ti=0; ti<xtill; ti++){
                    gind = ti + tx*tilex + gridx*((tj + ty*tiley) + gridy*(tk + tz*tilez));
                    tind = tind + 1;
                    if(invert){
                        tiled[gind] = tind;
                    }else{
                        tiled[tind] = gind;
                    }
                }
            }
        }
    }
    
    return tiled;
}

////////////////////////////////////////////////////////////////////////////////////////////
// utility classes
////////////////////////////////////////////////////////////////////////////////////////////

class Point3{
  // var x, y, z;
  
  constructor(px, py, pz){
    this.x = px;
    this.y = py;
    this.z = pz;
  }
//   constructor(){
//     this.x=0;
//     this.y=0;
//     this.z=0;
//   }
}

class Button{
//   var x, y, wide, high;
//   var bColor, textColor;
//   var hasText;
//   var theText;
//   var centerTextX;
  
//   constructor(nx, ny, nwide, nhigh){
//     this.x = nx;
//     this.y = ny;
//     this.wide = nwide;
//     this.high = nhigh;
//     this.bvar = color(220);
//     this.textvar = color(0);
    
//     this.theText = "";
//     this.hasText = false;
//     this.centerTextX = true;
//   }
  
  constructor(nx, ny, nwide, nhigh, txt){
    textFont("Inconsolata");
    this.x = nx;
    this.y = ny;
    this.wide = nwide;
    this.high = nhigh;
    this.bColor = color(220);
    this.textColor = color(0);
    
    this.theText = txt;
    this.hasText = true;
    this.centerTextX = true;
  }
  
  containsMouse(){
    if((mouseX >=this.x)&&(mouseX <= (this.x+this.wide))&&(mouseY >= this.y)&&(mouseY <= (this.y+this.high))){
      return true;
    }
    return false;
  }
  
  display(){
    stroke(0);
    if(this.containsMouse()){
      fill(color(190));
      strokeWeight(3);
    }else{
      fill(this.bColor);
      strokeWeight(1);
    }
    rect(this.x,this.y,this.wide,this.high);
    strokeWeight(1);
    
    if(this.hasText){
      fill(this.textColor);
      if(this.centerTextX){
        textAlign(CENTER, CENTER);
        text(this.theText, this.x + this.wide/2, this.y + this.high/2);
      }else{
        textAlign(LEFT, CENTER);
        text(this.theText, this.x + 5, this.y + this.high/2);
      }
    }
  }
  
  getColor(){
    return this.bColor;
  }
  
  setColor(c){
    this.bvar = c;
  }
  
  setText(s){
    setText(s,this.textColor);
  }
  
  setText( s, tc){
    this.theText = s;
    this.textvar = tc;
    if(this.theText.length() > 0){
        this.hasText = true;
    }else{
        this.hasText = false;
    }
  }
  
  centerText(doit){
    this.centerTextX = doit;
  }
}

class Label{
  
  constructor(nx, ny, nwide, nhigh, txt){
    textFont("Inconsolata");
    this.x = nx;
    this.y = ny;
    this.wide = nwide;
    this.high = nhigh;
    this.bColor = color(255);
    this.textColor = color(0);
    
    this.theText = txt;
    this.theSize = 12;
    this.centerTextX = false;
    this.withBox = false;
  }
  
  display(){
    stroke(0);
    fill(this.bColor);
    if(this.withBox){
      rect(this.x,this.y,this.wide,this.high);
    }
    
    fill(this.textColor);
    textSize(this.theSize);
    if(this.centerTextX){
      textAlign(CENTER, CENTER);
      text(this.theText, this.x + this.wide/2, this.y + this.high/2);
    }else{
      textAlign(LEFT, TOP);
      text(this.theText, this.x + 5, this.y + this.high/2);
    }
  }
  
  setColor( c){
    this.bvar = c;
  }
  
  setText( s){
    this.theText = s;
  }
  
  setSize(sz){
    this.theSize = sz;
  }
  
  centerText(doit){
    this.centerTextX = doit;
  }
  
  showBox(doit){
    this.withBox = doit;
  }
}

class Slider{
  
  constructor(nx, ny, nwide, nhigh, mini, maxi, value, txt){
    textFont("Inconsolata");
    this.x = nx;
    this.y = ny;
    this.wide = nwide;
    this.high = nhigh;
    this.bartop = this.y + 30;
    this.barlength = this.high-this.bartop-10;
    this.bColor = color(200);
    this.textColor = color(0);
    
    this.rangemin = mini;
    this.rangemax = maxi;
    this.val = value;
    
    this.theText = txt;
    this.withText = true;
  }
  
//   constructor(nx, ny, nwide, nhigh, mini, maxi, value){
//     this.x = nx;
//     this.y = ny;
//     this.wide = nwide;
//     this.high = nhigh;
//     this.bartop = y + 10;
//     this.barlength = high-bartop-10;
//     this.bvar = color(200);
//     this.textvar = color(0);
    
//     this.rangemin = mini;
//     this.rangemax = maxi;
//     this.val = value;
    
//     this.theText = "";
//     this.withText = false;
//   }
  
  display(){
    // The bar
    stroke(0);
    strokeWeight(4);
    line(this.x + this.wide/2, this.bartop, this.x + this.wide/2, this.bartop + this.barlength);
    
    // The handle
    strokeWeight(1);
    fill(this.bColor);
    var pos = this.bartop + this.barlength - round(this.barlength * (this.val-this.rangemin)*1.0/(this.rangemax-this.rangemin));
    rect(this.x, pos-10, this.wide, 20);
    
    // The label
    if(this.withText){
      fill(this.textColor);
      textAlign(CENTER);
      text(this.theText, this.x + this.wide/2, this.y + 10);
    }
  }
  
  setColor(c){
    this.bvar = c;
  }
  
  setText(s){
    this.theText = s;
  }
  
  setValue(value){
    this.val = value;
    this.theText = str(this.val);
  }
  
  setRange(mini, maxi){
    this.rangemin = mini;
    this.rangemax = maxi;
  }
  
  getValue(){
    return this.val;
  }
  
  clickSlide(){
    // get value from position
    var py = this.barlength - (mouseY-this.bartop);
    py = min(py, this.barlength);
    py = max(py, 0);
    var newval = this.rangemin + round((this.rangemax-this.rangemin)*py*1.0/this.barlength);
    
    this.setValue(newval);
  }
  
  moveTo(newy){
    var py = this.barlength - (newy-this.bartop);
    py = min(py, this.barlength);
    py = max(py, 0);
    var newval = this.rangemin + round((this.rangemax-this.rangemin)*py*1.0/this.barlength);
    
    this.setValue(newval);
  }
  
  containsMouse(){
    if((mouseX >= this.x)&&(mouseX <= (this.x+this.wide))&&(mouseY >= this.bartop-10)&&(mouseY <= (this.y+this.high))){
      return true;
    }
    return false;
  }
}
