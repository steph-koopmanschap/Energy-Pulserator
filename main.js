/*
// NAME: Energy Pulserator
// CONTRIBUTORS: Steph Koopmanschap
// VERSION: 1.0
*/

// ====== GLOBAL DECLARATIONS =========

//Screen Settings
var ScreenWidth = 800;
var ScreenHeight = 600;
var MainScreen = null;
var Canvas2D = null;
//Framerate and looping variables
var GameSpeed = 1;
var FPS = 60 * GameSpeed;
var frameRate = (1/FPS)*1000;
var globalCock = null;
//Check if the main loop is running or not
var isRunning = false;
//Debugging mode for verbose logging
//Do note that debugMode slows down the program
var DebugMode = false;
//Verboseness of the debugging log
//level 1 = small
//level 2 = high
//level 3 = extreme (slows down the program more)
var DebugLevel = 2;
var debugClock = null;
//The Grid of Pulsers
//The size of each pulser in pixels. (only used for rendering Pulsers on screen)
var pulserSize = 10; 
var gridColumns = 80; //ScreenWidth / pulserSize
var gridRows = 60; //ScreenHeight / pulserSize
var PulserGrid;
var totalFieldEnergy = 0;
var averageEnergyPulsers = 0;
var statisticsTimer = null;

// ======  =========

// =-=-=-=-=-= CLASSES =-=-=-=-=-=
//int id
//int initialEnergy =
//int array gridLocation[int r, int c]
//int array [int x, int y]
class Pulser {
    constructor(id, initialEnergy, gridLocation, screenLocation) {
        this.id = id;
        this.energy = initialEnergy;
        this.row = gridLocation[0];
        this.column = gridLocation[1];
        this.x = screenLocation[0];
        this.y = screenLocation[1];
        this.size = pulserSize; //10
        this.color = "black";
        this.timeLastPulsed = Date.now();
        //Pulsing delay in miliseconds
        this.pulseDelay = 1000;
        this.maxEnergy = 11;
    }
    pulse() {
        //Limit the total energy the Pulser can have
        if(this.energy >= this.maxEnergy) {
            this.energy = this.maxEnergy;
        }
        //Increase energy of its touching neighbours
        try {
            this.color = "white";
            //The if statemements below prevent out of bounds errors. 
            //It checks if the neighbour of the Pulser is outside of the screen
            //top
            if (!(this.row-1 < 0)) {
                PulserGrid[this.row-1][this.column].energy += 1;
            }
            //bottom
            if (!(this.row+1 > gridRows-1)) {
                PulserGrid[this.row+1][this.column].energy += 1;
            }
            
            //left
            if (!(this.column-1 < 0)) {
                PulserGrid[this.row][this.column-1].energy += 1;
            }
            //right
            if (!(this.column+1 > gridColumns-1)) {
                PulserGrid[this.row][this.column+1].energy += 1;
            }
            
        } catch (error) {
            console.log("Row: " + this.row);
            console.log("Column: " + this.column);
            console.log(error);
        }
        //Remove its own energy by input slider value
        this.energy -= inputSlider.value;

        //Register when this pulse last fired
        this.timeLastPulsed = new Date();

    }
    update() {
        //Do stuff based on the energy level of the Pulser
                            //Switch statements are more memory efficient because of the tree-like if-else nature
                            //switch(true) {}
        //Prevent energy from being negative
        if (this.energy <= 0) {
            this.energy = 0;
            this.color = "black";
        } 
        //Determine colors
        else if (this.energy >= 1 && this.energy <= 5) {
            this.color = "green";
        } 
        else if (this.energy >= 6 && this.energy <= 9) {
            this.color = "yellow";
        }
        else if (this.energy >= 10) {
            this.color = "red";
            if(Date.now() - this.timeLastPulsed > this.pulseDelay) {
                this.pulse();
            }
        }
    }
    draw() {
        Canvas2D.fillStyle = this.color;
        Canvas2D.fillRect(this.x, this.y, this.size, this.size);
    }
}

//=-=-=-=-=-= =-=-=-=-=-=

// O+O+O+O+O+O USER INPUT FUNCTIONS O+O+O+O+O+O+0

//Slider input to determine the energy loss per pulse
const inputSlider = document.getElementById('energyLossPerPulseSlider');
const sliderOutput = document.getElementById('sliderValueDisplay');  
const totalEnergyOutput = document.getElementById('totalEnergy');  
const avrgEnergyOutput = document.getElementById('averageEnergy');  

//Send a pulse across the energy field.
//Adds +1 energy to all the Pulsers in the grid
function globalPulse() {
    console.log("Global Pulsed");
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            PulserGrid[i][j].energy += 1;
        }
    }
}

//Selects a random Pulser and set its energy to 10 so will start pulsing.
function createPulser() {
    console.log("Pulser created");
    PulserGrid[randIntRange(0, gridRows)][randIntRange(0, gridColumns)].energy = 10;
}

//Send a pulse across the energy field.
//Adds +1 energy to only 1 randomly selected Pulser in the grid
function localPulseRandom() {
    console.log("Local Pulsed");
    PulserGrid[randIntRange(0, gridRows)][randIntRange(0, gridColumns)].energy += 1;
}

//Give a random energy value between 0 and 9 to all Pulsers in the grid
function resetGrid() {
    console.log("Grid reset");
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            PulserGrid[i][j].energy = randIntRange(0, 9);
        }
    }

    calcStatistics();
}

//Pause or unpause the game (prevents the code inside the main loop from executing, but still executes the main loop)
function pauseToggle() {
    isRunning = !isRunning;
    console.log("isRunning: " + isRunning);
}

//Completely disable the mainloop, debug logger, and clear the screen (program restart probably required after this)
function end() {
    console.log("END");
    isRunning = false;
    clearTimeout(globalCock);
    clearInterval(debugClock);
    clearInterval(statisticsTimer);
    clearCanvas();
}

// O+O+O+O+O+O O+O+O+O+O+O+0

//returns a random integer between min and max
function randIntRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function update() {
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            PulserGrid[i][j].update();
        }
    }
    sliderOutput.innerHTML = inputSlider.value;
}

function draw() {
    clearCanvas();
    //Draw the Pulsers
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
            PulserGrid[i][j].draw();
        }
    }
}

//+++ THESE VARIABLES ARE USED IN CHECKING EXECUTION TIMES OF THE PROGRAM +++
//Counts up by 1 for every program cycle. Is reset to o at 1oo program cycles
var hundredCyclesCounter = 0;
const maxCyclesToCount = 100;
//Total looping execution times over a 100 program cycle period (resets to o at 100 cycles)
//(Needed for calculating the average)
var totalMainLoopTime = 0;
var totalUpdateLoopTime = 0;
var totalDrawLoopTime = 0;
//Average looping execution times over a 100 program cycle (re-calculated every 100th cycle)
var avrgMainLoopTime = 0;
var avrgUpdateLoopTime = 0;
var avrgDrawLoopTime = 0;
//+++ +++

function mainLoop() {
    globalCock = setTimeout(() => {
        if (isRunning === true) {
            let mainLoopStartTime = 0;
            let mainLoopEndTime = 0;
            let mainLoopTime = 0;
            let updateLoopStartTime = 0;
            let updateLoopEndTime = 0;
            let updateLoopTime = 0;
            let drawLoopStartTime = 0;
            let drawLoopEndTime = 0;
            let drawLoopTime = 0;
            
            if (DebugMode === true && DebugLevel >= 2) {
                //Check how long it takes for 1 program cycle to execute.
                mainLoopStartTime = performance.now();
                //Check how long it takes for 1 update to execute.
                updateLoopStartTime = performance.now();
            }
            //Main proccesing
            update();
            if (DebugMode === true && DebugLevel >= 2) {
                updateLoopEndTime = performance.now();
                updateLoopTime = updateLoopEndTime - updateLoopStartTime;
            }
            
            //Check how long it takes for 1 draw to execute.
            if (DebugMode === true && DebugLevel >= 2) {
                drawLoopStartTime = performance.now();
            }
            //Draw the screen after updating
            draw();
            
            //=================================================
            //From here on its just checking how fast the program executes to analyze bottlenecks
            //=================================================

            if (DebugMode === true && DebugLevel >= 2) {
                drawLoopEndTime = performance.now();
                drawLoopTime = drawLoopEndTime - drawLoopStartTime;

                mainLoopEndTime = performance.now();
                mainLoopTime = mainLoopEndTime - mainLoopStartTime;
        
                //Add the times of every cycle together
                totalMainLoopTime += mainLoopTime;
                totalUpdateLoopTime += updateLoopTime;
                totalDrawLoopTime += drawLoopTime;
    
                //increment the cycle counter by 1 every cycle
                hundredCyclesCounter += 1;
    
                if(hundredCyclesCounter >= maxCyclesToCount) {
                    //Calculate the average execution times
                    avrgMainLoopTime = totalMainLoopTime / maxCyclesToCount;
                    avrgUpdateLoopTime = totalUpdateLoopTime / maxCyclesToCount;
                    avrgDrawLoopTime = totalDrawLoopTime / maxCyclesToCount;
                    //reset cycle counter
                    hundredCyclesCounter = 0;
    
                    console.log("*****HUNDRETH(100) CYCLE REPORT - START**************");
                    console.log("AVERAGE MAIN LOOP EXECUTION TIME:");
                    console.log(avrgMainLoopTime + " ms");
                    console.log("AVERAGE UPDATE LOOP EXECUTION TIME:");
                    console.log(avrgUpdateLoopTime + " ms");
                    console.log("AVERAGE DRAW LOOP EXECUTION TIME:");
                    console.log(avrgDrawLoopTime + " ms");
                    console.log("*****HUNDRETH(100) CYCLE REPORT - END**************");            
            }
                if(DebugLevel === 3) {
                    console.log("*****SINGLE CYCLE REPORT - START**************");
                    console.log("MAIN LOOP EXECUTION TIME:");
                    console.log(mainLoopTime + " ms");
                    console.log("UPDATE LOOP EXECUTION TIME:");
                    console.log(updateLoopTime + " ms");
                    console.log("DRAW LOOP EXECUTION TIME:");
                    console.log(drawLoopTime + " ms");
                    console.log("*****SINGLE CYCLE REPORT - END**************"); 
                }
            }
        } //end-if (isRunning)
        mainLoop();
    }, frameRate);
}

function calcStatistics() {
    //Reset the previous calculations
    totalFieldEnergy = 0;
    averageEnergyPulsers = 0;
    //Calculate total
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) { 
            totalFieldEnergy += PulserGrid[i][j].energy;
        }
    }
    //Calculate average
    averageEnergyPulsers = Math.floor(totalFieldEnergy / (gridRows * gridColumns));
    //Output to screen
    totalEnergyOutput.innerHTML = totalFieldEnergy;
    avrgEnergyOutput.innerHTML = averageEnergyPulsers;
}

//Do things that should happen only once at the start of the game
function startGame() {
    //Create the Pulser Grid 
    PulserGrid = new Array(gridRows);
    for (let i = 0; i < gridRows; i++) {
        PulserGrid[i] = new Array(gridColumns);
    }
    //Fill the grid with Pulsers
    let idCounter = 0;
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) { 
            //For some reason columns and rows are reversed in rendering on screen
            PulserGrid[i][j] = new Pulser(idCounter, randIntRange(0, 9), [i, j], [j*pulserSize, i*pulserSize]);
            idCounter += 1;
        }
    }

    //Calculate the total energy in the field and the average energy per pulser every 2 seconds
    statisticsTimer = setInterval(calcStatistics, 2000);

    //remove variables no longer needed
    idCounter = null;
    pulserScreenPositions = null;
}

//Clear the html canvas screen
function clearCanvas() {
    Canvas2D.fillStyle = "black";
    Canvas2D.clearRect(0, 0, ScreenWidth, ScreenHeight);
}

//Create the screen
function initScreen() {
    MainScreen = document.createElement("canvas");
    MainScreen.width = ScreenWidth;
    MainScreen.height = ScreenHeight;
    MainScreen.style.margin = "10px";
    MainScreen.style.border = "4px solid orange";
    MainScreen.style.backgroundColor = "black";
    Canvas2D = MainScreen.getContext("2d");
    document.body.insertBefore(MainScreen, document.body.childNodes[3]);
}

//Initialize and start program
function init() {
    initScreen();
    startGame();

    //Start the logger
    if (DebugMode === true) {
        debugClock = setInterval(function() {
            debugLog();
        }, 1000);
    }

    //Start the main loop
    isRunning = true;
    mainLoop();
}

function debugLog() {
    console.log("======DEBUG LOG - START===========");
    console.log("isRunning: " + isRunning);
    console.log("hundredCyclesCounter: " + hundredCyclesCounter);
    console.log("======DEBUG LOG - END===========");
}

//The first function executed by this program
init();


