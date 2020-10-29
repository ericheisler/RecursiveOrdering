/*
Visually explore recursive orderings.
*/

Button[] buttons;
Label[] labels;
Slider xslider, yslider, zslider, currentSlider;
boolean movingSlider;
int buttoncount, labelcount;

int leftWidth, centerWidth, rightWidth;
int centerx, rightx;
int cpad;

boolean threeD;

int squaresize;

int cubesize;
float cubeAnglex;
float cubeAngley;
boolean rotatingCube;
int rotatex, rotatey;
float rotateRate = 0.003;

Point3[] nodes;
int nnodes;
int dimx, dimy, dimz;
int orderType; // lex=0, mort=2, hilb=1, tile=3
String orderTypeName;
int[] order;

int tileSize, depth, twoN;

void setup(){
  size(1200, 850, P3D);
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
  orderType = 0;
  orderTypeName = "Lexicographic";
  
  buildPoints();
  
  buttoncount = 10;
  buttons = new Button[buttoncount];
  buttons[0] = new Button(rightx, 10, rightWidth-10, 30, "Lexicographic");
  buttons[1] = new Button(rightx, 45, rightWidth-10, 30, "Hilbert");
  buttons[2] = new Button(rightx, 80, rightWidth-10, 30, "Morton");
  buttons[3] = new Button(rightx, 115, rightWidth-10, 30, "Tiled");
  
  buttons[4] = new Button(rightx, 155, 30, 30, "<");
  buttons[5] = new Button(width - 40, 155, 30, 30, ">");
  
  buttons[6] = new Button(rightx, 190, 30, 30, "<");
  buttons[7] = new Button(width - 40, 190, 30, 30, ">");
  
  buttons[8] = new Button(rightx, 225, rightWidth/2 - 5, 30, "2D");
  buttons[9] = new Button(rightx + rightWidth/2+5, 225, rightWidth/2 - 5, 30, "3D");
  
  labelcount = 6;
  labels = new Label[labelcount];
  labels[0] = new Label(10, 10, leftWidth-20, 30, "Grid size");
  labels[1] = new Label(10, 45, 40, 30, "X");
  labels[2] = new Label(55, 45, 40, 30, "Y");
  labels[3] = new Label(100, 45, 40, 30, "Z");
  labels[0].centerText(true);
  labels[1].centerText(true);
  labels[2].centerText(true);
  labels[3].centerText(true);
  labels[0].showBox(false);
  
  labels[4] = new Label(rightx + 35, 155, rightWidth - 80, 30, "Tile size= "+str(tileSize));
  labels[5] = new Label(rightx + 35, 190, rightWidth - 80, 30, "Depth= "+str(depth));
  labels[4].showBox(true);
  labels[5].showBox(true);
  
  xslider = new Slider(10, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  yslider = new Slider(55, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  zslider = new Slider(100, 80, 40, height-90, 1, twoN, twoN, str(twoN));
  movingSlider = false;
}

void draw(){
  background(255);
  for(int j=0; j<buttoncount; j++){
      buttons[j].display();
  }
  for(int j=0; j<labelcount; j++){
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
    
    // Draw the nodes
    colorMode(HSB, nnodes);
    strokeWeight(8);
    for(int i=0; i<nnodes; i++){
      int ind = order[i];
      stroke(i, nnodes, nnodes);
      point(nodes[ind].x, nodes[ind].y, nodes[ind].z);
    }
    
    // Draw the curve
    strokeWeight(2);
    Point3 last = nodes[order[0]];
    for(int i=1; i<nnodes; i++){
      int ind = order[i];
      stroke(i-1, nnodes, nnodes);
      line(last.x, last.y, last.z, nodes[ind].x, nodes[ind].y, nodes[ind].z);
      last = nodes[ind];
    }
  
  }else{
    // Draw the square
    noFill();
    stroke(150);
    rect(centerx+cpad, cpad, squaresize, squaresize);
    
    // Draw the nodes
    colorMode(HSB, nnodes);
    strokeWeight(8);
    for(int i=0; i<nnodes; i++){
      int ind = order[i];
      stroke(i, nnodes, nnodes);
      point(nodes[ind].x, nodes[ind].y);
    }
    
    // Draw the curve
    strokeWeight(2);
    Point3 last = nodes[order[0]];
    for(int i=1; i<nnodes; i++){
      int ind = order[i];
      stroke(i-1, nnodes, nnodes);
      line(last.x, last.y, nodes[ind].x, nodes[ind].y);
      last = nodes[ind];
    }
  }
  
  colorMode(RGB,255);
}


void keyPressed(){
  //if(key == 'a'){
    
  //}else if(key == 'b'){
    
  //}else if(key == 's'){
    
  //}
}

void mouseClicked(){
  int clickedItem = -1;
  for(int j=0; j<buttoncount; j++){
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
        orderType = 0;
        orderTypeName = "Lexicographic";
        buildPoints();
        break;
      case 2: // mort
        orderType = 2;
        orderTypeName = "Morton";
        buildPoints();
        break;
      case 1: // hilb
        orderType = 1;
        orderTypeName = "Hilbert";
        buildPoints();
        break;
      case 3: // tile
        break;
      case 4: // tile down
        tileSize = max(1,tileSize-1);
        buildPoints();
        labels[4].setText("Tile size= "+str(tileSize));
        break;
      case 5: // tile up
        tileSize = min(tileSize+1, twoN);
        buildPoints();
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
        
      case 100:
        xslider.clickSlide();
        dimx = xslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
      case 101:
        yslider.clickSlide();
        dimy = yslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
      case 102:
        zslider.clickSlide();
        dimz = zslider.getValue();
        rescaleDepthIfNeeded();
        buildPoints();
        break;
    }
  }
}

void mousePressed(){
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

void mouseReleased(){
  rotatingCube = false;
  movingSlider = false;
}

void mouseDragged(){
  // If pressed in cube, rotate
  if(rotatingCube){
    cubeAngley += (mouseX-rotatex)*rotateRate;
    cubeAnglex -= (mouseY-rotatey)*rotateRate;
    rotatex = mouseX;
    rotatey = mouseY;
  }else if(movingSlider){
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

void mouseWheel(MouseEvent event){
  int e = event.getCount();
  if(e > 0){
    
  }else{
    
  }
}

void changedN(){
  twoN = round(pow(2,depth));
  dimx = twoN;
  dimy = twoN;
  dimz = twoN;
  buildPoints();
  
  xslider.setRange(1,twoN);
  yslider.setRange(1,twoN);
  zslider.setRange(1,twoN);
  xslider.setValue(twoN);
  yslider.setValue(twoN);
  zslider.setValue(twoN);
}

void rescaleDepthIfNeeded(){
  dimx = xslider.getValue();
  dimy = yslider.getValue();
  if(threeD){
    dimz = zslider.getValue();
    
    if(dimx <= twoN/2 && dimy <= twoN/2 && dimz <= twoN/2){
      depth -= 1;
      twoN = round(pow(2,depth));
      rescaleDepthIfNeeded();
    }else if(dimx > twoN*2 && dimy > twoN*2 && dimz > twoN*2){
      depth += 1;
      twoN = round(pow(2,depth));
      rescaleDepthIfNeeded();
    }
    
  }else{
    if(dimx <= twoN/2 && dimy <= twoN/2){
      depth -= 1;
      twoN = round(pow(2,depth));
      rescaleDepthIfNeeded();
    }else if(dimx > twoN*2 && dimy > twoN*2){
      depth += 1;
      twoN = round(pow(2,depth));
      rescaleDepthIfNeeded();
    }
  }
  
  
  if(dimx <= twoN/2 && dimy <= twoN/2 && dimz <= twoN/2){
    depth -= 1;
    twoN = round(pow(2,depth));
    rescaleDepthIfNeeded();
  }else if(dimx > twoN*2 && dimy > twoN*2 && dimz > twoN*2){
    depth -= 1;
    twoN = round(pow(2,depth));
    rescaleDepthIfNeeded();
  }
  println("depth = "+str(depth));
}

void buildPoints(){
  if(threeD){
    nnodes = dimx*dimy*dimz;
    nodes = new Point3[nnodes];
    order = new int[nnodes];
    int twoN = round(pow(2,depth));
    int cellsize = cubesize/(twoN-1);
    int ind, px, py, pz;
    for(int k=0; k<dimz; k++){
      for(int j=0; j<dimy; j++){
        for(int i=0; i<dimx; i++){
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
      int[] griddim = new int[3];
      griddim[0] = dimx;
      griddim[1] = dimy;
      griddim[2] = dimz;
      order = get_recursive_order(orderType, 3, griddim);
    }
    
  }else{ //2D
    nnodes = dimx*dimy;
    nodes = new Point3[nnodes];
    order = new int[nnodes];
    int twoN = round(pow(2,depth));
    int cellsize = squaresize/(twoN-1);
    int ind, px, py;
    for(int j=0; j<dimy; j++){
      for(int i=0; i<dimx; i++){
        ind = i + dimx*j;
        px = centerx + cpad + i*cellsize;
        py = height - cpad - j*cellsize;
        nodes[ind] = new Point3(px,py,0);
        order[ind] = ind;
      }
    }
    
    if(orderType > 0){
      int[] griddim = new int[2];
      griddim[0] = dimx;
      griddim[1] = dimy;
      order = get_recursive_order(orderType, 2, griddim);
    }
  }
  
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
int[] get_recursive_order(int type, int dim, int[] griddim){
    int maxgriddim, N, twotoN, fullnnodes, subind;
    RecursiveOrdering rorder_rules;
    int[] rorder;
    int[] subrorder;
    int nnodes = 1;
    for(int i=0; i<dim; i++){ //i=1:length(griddim)
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
          rorder = new int[1];
        }
        
        print("griddim=");
        println(griddim);
        println("nnodes = "+str(nnodes));
        println("fullnnodes = "+str(fullnnodes));
        // Truncate ordering to match griddim size
        subrorder = new int[nnodes];
        subind = 0;
        for(int i=0; i<fullnnodes; i++){ // i=1:length(rorder)
            // Get coordinates in 2^N grid
            int hind = rorder[i];
            int hx = hind%twotoN;
            int hy = round(floor(hind * 1.0 / (twotoN)));
            
            if(hx < griddim[0] && hy < griddim[1]){
                int gind = hx + griddim[0]*hy;
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
          rorder = new int[1];
        }
        
        // Truncate ordering to match griddim size
        subrorder = new int[nnodes];
        subind = 0;
        for(int i=0; i<fullnnodes; i++){ // i=1:length(rorder)
            // Get coordinates in 2^N grid
            int hind = rorder[i];
            int hx = hind%twotoN;
            int hy = round(floor((hind%(twotoN*twotoN)) * 1.0 / (twotoN)));
            int hz = round(floor(hind * 1.0 / (twotoN*twotoN)));
            if(hx < griddim[0] && hy < griddim[1] && hz < griddim[2]){
                int gind = hx + griddim[0]*(hy + griddim[1]*hz);
                subrorder[subind] = gind;
                subind += 1;
            }
        }
        //println(rorder);
        //println(subind);
        
        return subrorder;
    }
    
    subrorder = new int[1];
    return subrorder;
}

// Use this to reorder the nodes in a given grid.
int[] reorder_grid_recursive_3d(int[] grid, int[] griddim, int type){
    int dim = 3; //dim = size(grid.allnodes,2);
    int nnodes = griddim[0]*griddim[1]*griddim[2]; //nnodes = size(grid.allnodes,1);
    
    // get the ordering
    int[] rordering = get_recursive_order(type, dim, griddim);
    // invert it for transfering the grid
    // rordering = invert_ordering(rordering);
    
    int[] newnodes = new int[nnodes]; //zeros(size(grid.allnodes));
    
    for(int mi=0; mi<nnodes; mi++){ // mi=1:length(rordering)
        newnodes[mi] = grid[rordering[mi]];
    }
    
    return newnodes;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ordering rule sets

// Build a Morton Ordering
RecursiveOrdering morton_ordering_rules(int dim){
    if(dim == 2){
        int[][] tmp1 = {{1,1,1,1}};
        int[][] tmp2 = {{1,2,3,4}};
        return new RecursiveOrdering(1, tmp1, tmp2);
    }else if(dim == 3){
        int[][] tmp1 = {{1,1,1,1,1,1,1,1}};
        int[][] tmp2 = {{1,2,3,4,5,6,7,8}};
        return new RecursiveOrdering(1, tmp1, tmp2);
    }
    int[][] tmp = {{0}};
    return new RecursiveOrdering(0,tmp,tmp);
}

// Build a Hilbert Ordering
RecursiveOrdering hilbert_ordering_rules(int dim){
    if(dim == 2){
        int[][] tmp1 = {{2,3,1,1}, {1,2,4,2}, {3,1,3,4}, {4,4,2,3}}; // state indices
        int[][] tmp2 = {{1,4,2,3}, {1,2,4,3}, {3,4,2,1}, {3,2,4,1}}; // indexing order
        return new RecursiveOrdering(4, tmp1, tmp2);
    }else if(dim == 3){
        // Oh boy rotations for each state
        int[][] rots = {{0,0,0,0},
                {1,2,0,0},
                {1,2,1,2},
                {2,0,0,0},
                {1,2,2,0},
                {3,0,0,0},
                {1,1,1,0},
                {1,1,2,0},
                {3,3,3,0},
                {2,3,0,0},
                {2,1,1,1},
                {3,3,0,0},
                {2,2,2,0},
                {1,0,0,0},
                {1,1,3,0},
                {1,2,2,2},
                {1,3,0,0},
                {2,2,0,0},
                {1,3,3,3},
                {3,2,2,1},
                {1,1,0,0},
                {3,3,2,0},
                {2,2,1,0},
                {2,2,3,0}};
        int[] first = {1,4,2,3,8,5,7,6};
        int[][] orders = new int[24][8];
        for(int i=0; i<24; i++){ // i=1:24
            //push!(orders, rotations(first, rots[i]));
            orders[i] = rotations(first, rots[i]);
        }
        
        // state{ rules}
        int[][] rules = {{2,12,3,3,20,12,17,17},
                {3,1,11,21,16,1,16,21},
                {1,18,19,19,2,10,2,10},
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0}, // These ones aren't used, so I'll just leave zeros
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0},
                {18,3,12,11,18,20,12,20},
                {17,17,21,12,2,10,2,10},
                {11,11,1,10,19,19,1,16},
                {0,0,0,0,0,0,0,0}, 
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0},
                {18,2,12,2,18,17,12,19},
                {20,16,20,16,1,18,11,11},
                {21,10,3,3,21,16,17,17},
                {20,16,20,16,3,3,21,12},
                {10,1,10,21,17,1,19,21},
                {11,11,2,18,19,19,20,18},
                {0,0,0,0,0,0,0,0}, 
                {0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0}};
        
        return new RecursiveOrdering(24, rules, orders);
    }
    int[][] tmp = {{0}};
    return new RecursiveOrdering(0,tmp,tmp);
}

int[] rotation_3d(int[] a, int axis){
    int[][] r = {{5, 6, 1, 2, 7, 8, 3, 4}, {2, 6, 4, 8, 1, 5, 3, 7}, {2, 4, 1, 3, 6, 8, 5, 7}};
    int[] b = new int[8]; //zeros(Int,length(a));
    for(int i=0; i<8; i++){ // i=1:length(a)
        b[r[axis-1][i]-1] = a[i];
    }
    return b;
}

int[] rotations(int[] a, int[] rots){
    for(int i=0; i<4; i++){ // i=1:length(rots)
        if(rots[i] > 0){
          a = rotation_3d(a,rots[i]);
        }
    }
    return a;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Build the ordering for a (2^N)^D grid
int[] build_ordering_2d(RecursiveOrdering ord, int N, boolean invert){
  
    int nnodes = round(pow(pow(2,N),2));
    int[] lexorderx = new int[nnodes]; //zeros(Int,nnodes,3);
    int[] lexordery = new int[nnodes];
    int twotoN = round(pow(2,N));
    for(int j=1; j<=twotoN; j++){
        for(int i=1; i<=twotoN; i++){
            int ni = i + twotoN*(j-1);
            lexorderx[ni-1] = i;
            lexordery[ni-1] = j;
        }
    }
    
    float[] bbox = new float[5];
    float[] tmpbbox = new float[5];
    bbox[1] = 1.0;
    bbox[3] = 1.0;
    bbox[2] = twotoN*1.0;
    bbox[4] = twotoN*1.0;
    
    float centerx = (bbox[1]+bbox[2])*0.5;
    float centery = (bbox[3]+bbox[4])*0.5;
    float tmpcenterx = 0;
    float tmpcentery = 0;
    
    int[] result = new int[nnodes];
    int vertexx, vertexy;
    for(int ni=0; ni<nnodes; ni++){
        vertexx = lexorderx[ni];
        vertexy = lexordery[ni];
        tmpbbox[1] = bbox[1];
        tmpbbox[2] = bbox[2];
        tmpbbox[3] = bbox[3];
        tmpbbox[4] = bbox[4];
        tmpcenterx = centerx;
        tmpcentery = centery;
        
        // Find the index for this node
        long index = 0L;
        int state = 0;
        for(int i=0; i<N; i++){
            index = index<<2;
            // Which octant is it in?
            int octant = 0;
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
            result[ni] = (int)index;
        }else{
            result[(int)index] = ni;
        }
    }
    
    return result;
    //nnodes = (2^N)^2;
    //lexorder = zeros(Int,nnodes,2);
    //twoN = 2^N;
    //for j=1:twoN
    //    for i=1:twoN
    //        ni = i + twoN*(j-1);
    //        lexorder[ni,1] = i;
    //        lexorder[ni,2] = j;
    //    }
    //}
    
    //bbox = zeros(4);
    //bbox[1] = 1;
    //bbox[3] = 1;
    //bbox[2] = twoN;
    //bbox[4] = twoN;
    
    //center = [(bbox[1]+bbox[2])/2, (bbox[3]+bbox[4])/2];
    //tmpbbox = zeros(4);
    //tmpcenter = zeros(2);
    
    //result = zeros(Int64, nnodes);
    //for ni=1:nnodes
    //    vertex = lexorder[ni,:];
    //    for bi=1:4
    //        tmpbbox[bi] = bbox[bi];
    //    }
    //    tmpcenter[1] = center[1];
    //    tmpcenter[2] = center[2];
        
    //    // Find the index for this node
    //    index = Int64(0);
    //    state = 1;
    //    for i=1:N
    //        stupid = index;
    //        stupid = state;
    //        index = index<<2;
    //        // Which quadrant is it in?
    //        quad = 0;
    //        if vertex[1] > tmpcenter[1]
    //            quad = quad+1;
    //        }
    //        if vertex[2] > tmpcenter[2]
    //            quad = quad+2;
    //        }
    //        quad += 1; // 1-based index
    //        //println("ni="*string(ni)*" level="*string(i)*" quad="*string(quad));
            
    //        // Add this quad's ordering position to index 
    //        index += ord.orders[state][quad] - 1;
            
    //        // Update the state to that quad's state according to rule for this one.
    //        state = ord.rules[state][quad];
            
    //        // Shrink the box to one quad
    //        for j=1:2
    //            if vertex[j] > tmpcenter[j]
    //                tmpbbox[2*j-1] = tmpcenter[j];
    //            else
    //                tmpbbox[2*j] = tmpcenter[j];
    //            }
    //        }
    //        tmpcenter = [(tmpbbox[1]+tmpbbox[2])/2, (tmpbbox[3]+tmpbbox[4])/2];
    //    }
        
    //    // add one for 1-based index
    //    index += 1;
    //    //println("index for ni="*string(ni)*" is "*string(index));
    //    if invert
    //        result[ni] = index;
    //    else
    //        result[index] = ni;
    //    }
    //}
    
    //return result;
}

// Build the ordering for a (2^N)^D grid
int[] build_ordering_3d(RecursiveOrdering ord, int N, boolean invert){
    int nnodes = round(pow(pow(2,N),3));
    int[] lexorderx = new int[nnodes]; //zeros(Int,nnodes,3);
    int[] lexordery = new int[nnodes];
    int[] lexorderz = new int[nnodes];
    int twotoN = round(pow(2,N));
    for(int k=1; k<=twotoN; k++){
        for(int j=1; j<=twotoN; j++){
            for(int i=1; i<=twotoN; i++){
                int ni = i + twotoN*((j-1) + twotoN*(k-1));
                lexorderx[ni-1] = i;
                lexordery[ni-1] = j;
                lexorderz[ni-1] = k;
            }
        }
    }
    
    float[] bbox = new float[7];
    float[] tmpbbox = new float[7];
    bbox[1] = 1.0;
    bbox[3] = 1.0;
    bbox[5] = 1.0;
    bbox[2] = twotoN*1.0;
    bbox[4] = twotoN*1.0;
    bbox[6] = twotoN*1.0;
    
    float centerx = (bbox[1]+bbox[2])*0.5;
    float centery = (bbox[3]+bbox[4])*0.5;
    float centerz = (bbox[5]+bbox[6])*0.5;
    float tmpcenterx = 0;
    float tmpcentery = 0;
    float tmpcenterz = 0;
    
    int[] result = new int[nnodes];
    int vertexx, vertexy, vertexz;
    for(int ni=0; ni<nnodes; ni++){
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
        long index = 0L;
        int state = 0;
        for(int i=0; i<N; i++){
            index = index<<3;
            // Which octant is it in?
            int octant = 0;
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
            result[ni] = (int)index;
        }else{
            result[(int)index] = ni;
        }
    }
    
    return result;
}

int[] invert_ordering(int[] ord, int nnodes){
    int[] iord = new int[nnodes];
    for(int i=1; i<nnodes; i++){
        iord[ord[i]] = i;
    }
    return iord;
}

class RecursiveOrdering{
    int states;      // Number of possible states
    int[][] rules;   // Rules for each state mapping sectors to states
    int[][] orders;  // Ordering for each state
    
    RecursiveOrdering(int num, int[][] rule, int[][] order){
      states = num;
      rules = rule;
      orders = order;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// utility classes
////////////////////////////////////////////////////////////////////////////////////////////

class Point3{
  public int x,y,z;
  
  Point3(int px, int py, int pz){
    x = px;
    y = py;
    z = pz;
  }
  Point3(){
    x=0;
    y=0;
    z=0;
  }
}

class Button{
  int x, y, wide, high;
  color bColor, textColor;
  boolean hasText;
  String theText;
  boolean centerTextX;
  
  Button(int nx, int ny, int nwide, int nhigh){
    x = nx;
    y = ny;
    wide = nwide;
    high = nhigh;
    bColor = color(220);
    textColor = color(0);
    
    theText = "";
    hasText = false;
    centerTextX = true;
  }
  
  Button(int nx, int ny, int nwide, int nhigh, String txt){
    x = nx;
    y = ny;
    wide = nwide;
    high = nhigh;
    bColor = color(220);
    textColor = color(0);
    
    theText = txt;
    hasText = true;
    centerTextX = true;
  }
  
  boolean containsMouse(){
    if((mouseX >= x)&&(mouseX <= (x+wide))&&(mouseY >= y)&&(mouseY <= (y+high))){
      return true;
    }
    return false;
  }
  
  void display(){
    stroke(0);
    if(containsMouse()){
      fill(color(190));
      strokeWeight(3);
    }else{
      fill(bColor);
      strokeWeight(1);
    }
    rect(x,y,wide,high);
    strokeWeight(1);
    
    if(hasText){
      fill(textColor);
      if(centerTextX){
        textAlign(CENTER, CENTER);
        text(theText, x + wide/2, y + high/2);
      }else{
        textAlign(LEFT, CENTER);
        text(theText, x + 5, y + high/2);
      }
    }
  }
  
  color getColor(){
    return bColor;
  }
  
  void setColor(color c){
    bColor = c;
  }
  
  void setText(String s, color tc){
    theText = s;
    textColor = tc;
    if(theText.length() > 0){
      hasText = true;
    }else{
      hasText = false;
    }
  }
  
  void centerText(boolean doit){
    centerTextX = doit;
  }
}

class Label{
  int x, y, wide, high;
  color bColor, textColor;
  String theText;
  boolean centerTextX, withBox;
  
  Label(int nx, int ny, int nwide, int nhigh, String txt){
    x = nx;
    y = ny;
    wide = nwide;
    high = nhigh;
    bColor = color(255);
    textColor = color(0);
    
    theText = txt;
    centerTextX = false;
    withBox = false;
  }
  
  void display(){
    stroke(0);
    fill(bColor);
    if(withBox){
      rect(x,y,wide,high);
    }
    
    fill(textColor);
    if(centerTextX){
      textAlign(CENTER, CENTER);
      text(theText, x + wide/2, y + high/2);
    }else{
      textAlign(LEFT, CENTER);
      text(theText, x + 5, y + high/2);
    }
  }
  
  void setColor(color c){
    bColor = c;
  }
  
  void setText(String s){
    theText = s;
  }
  
  void centerText(boolean doit){
    centerTextX = doit;
  }
  
  void showBox(boolean doit){
    withBox = doit;
  }
}

class Slider{
  int x, y, wide, high, bartop, barlength;
  int rangemin, rangemax, val;
  color bColor, textColor;
  String theText;
  boolean withText;
  
  Slider(int nx, int ny, int nwide, int nhigh, int mini, int maxi, int value, String txt){
    x = nx;
    y = ny;
    wide = nwide;
    high = nhigh;
    bartop = y + 30;
    barlength = high-bartop-10;
    bColor = color(200);
    textColor = color(0);
    
    rangemin = mini;
    rangemax = maxi;
    val = value;
    
    theText = txt;
    withText = true;
  }
  
  Slider(int nx, int ny, int nwide, int nhigh, int mini, int maxi, int value){
    x = nx;
    y = ny;
    wide = nwide;
    high = nhigh;
    bartop = y + 10;
    barlength = high-bartop-10;
    bColor = color(200);
    textColor = color(0);
    
    rangemin = mini;
    rangemax = maxi;
    val = value;
    
    theText = "";
    withText = false;
  }
  
  void display(){
    // The bar
    stroke(0);
    strokeWeight(4);
    line(x + wide/2, bartop, x + wide/2, bartop + barlength);
    
    // The handle
    strokeWeight(1);
    fill(bColor);
    int pos = bartop + barlength - round(barlength * (val-rangemin)*1.0/(rangemax-rangemin));
    rect(x, pos-10, wide, 20);
    
    // The label
    if(withText){
      fill(textColor);
      textAlign(CENTER);
      text(theText, x + wide/2, y + 10);
    }
  }
  
  void setColor(color c){
    bColor = c;
  }
  
  void setText(String s){
    theText = s;
  }
  
  void setValue(int value){
    val = value;
    theText = str(val);
  }
  
  void setRange(int mini, int maxi){
    rangemin = mini;
    rangemax = maxi;
  }
  
  int getValue(){
    return val;
  }
  
  void clickSlide(){
    // get value from position
    int py = barlength - (mouseY-bartop);
    py = min(py, barlength);
    py = max(py, 0);
    int newval = rangemin + round((rangemax-rangemin)*py*1.0/barlength);
    
    setValue(newval);
  }
  
  void moveTo(int newy){
    int py = barlength - (newy-bartop);
    py = min(py, barlength);
    py = max(py, 0);
    int newval = rangemin + round((rangemax-rangemin)*py*1.0/barlength);
    
    setValue(newval);
  }
  
  boolean containsMouse(){
    if((mouseX >= x)&&(mouseX <= (x+wide))&&(mouseY >= bartop-10)&&(mouseY <= (y+high))){
      return true;
    }
    return false;
  }
}
