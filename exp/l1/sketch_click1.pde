Neuron[][] neuralNetwork;
int cols=32;
int rows=32;
int neuronSize=20;
Neuron activeNeuron;

  void setup() {
    background(255);
    size(640, 640);    
    neuralNetwork= new Neuron[rows][cols];
    createNeuralNetwork(cols,rows);
    
  }
      
  void draw() {
    for (int i = 0; i < cols; i++) {
      for (int j = 0; j < rows; j++) {
        // Oscillate and display each object
        neuralNetwork[j][i].alter();
        neuralNetwork[j][i].display();
        //if(neuralNetwork[j][i].state ){  activeNeuron = neuralNetwork[j][i]; };
 
        }
    }
  }
     
   void createNeuralNetwork(int theCols,int theRows){
     for(int r=0;r<theRows;r++){
       for(int c=0;c<theCols;c++){ 
       //neuralNetwork[r][c]=new Neuron(color(255,0,0),((c*10)+((width/2)-250)),((r*10)+((height/2)-250)),false,10,c+r,c,r);
       neuralNetwork[r][c]=new Neuron(color(255,0,0),(c*neuronSize),(r*neuronSize),true,neuronSize,c+r,c,r);
       }
     }
   }
   
  void mousePressed() {
 
       // println("neurona-"+activeNeuron.coords[0] +"-"+ activeNeuron.coords[1]);
    
  } 
  
  class Neuron{

  float xPos;
  float yPos;
  boolean state;
  color neuronColor;
  int neuronSize;
  float alphaX; // angle for oscillating brightness
  float alphaY; // angle for oscillating brightness
  boolean overBox = false;
  boolean locked = false;
  int[] coords= new int[2];
  
  float mod1;

  
  Neuron(color theNeuronColor,float xC,float yC,boolean theState,int theNeuronSize, float theAlpha, int theCol , int theRow){
    neuronColor=theNeuronColor;
    xPos=xC;
    yPos=yC;
    state=theState;
    neuronSize=theNeuronSize;
    alphaX = theAlpha;
    alphaY = theAlpha;
    coords[0]=theCol+1;
    coords[1]=theRow+1;
    
     mod1=125;
    
  }

  void display(){
 
  
     neuronColor=color( mod1+ noise(255)  * (alphaX/width)*100,
                        mod1+  noise(255) * ((alphaY-alphaX)/height)*100,
                        mod1+  noise(255)  * (alphaY/height)*100);
     
     stroke(neuronColor);
      //stroke(color(0)); 
     fill(neuronColor);
     state=true;
   
    
    rect(xPos,yPos,neuronSize,neuronSize);
  }
  
  
  void alter(){
    alphaX = ((mouseX+width) - (xPos*2)) ;
    alphaY = ((mouseY+height) - (yPos*2));
  }
  
}
