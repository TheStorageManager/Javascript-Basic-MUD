var queue;
var animation;
var context;
var stage; // the stage
var username = "Guest"; // Stores username
var input = ""; // Stores user input
var inputText; // input canvas object 
var output = ""; // Stores server output
var outputText; // output canvas object
var canvasWidth = $(window).width() - 25; // width of canvas
var canvasHeight = $(window).height() - 25; // height of canvas
var keyPressed = ""; // Aids keyboard mapping
var socket = io(); // connects to the server
var rect; // input divider canvas object
var boundyHeight; // output height
var scrollLock = 0; // Locks the output from autoscrolling
var gameMode = 0;   // Current GameMode
var step = 0; // Current Step
var room = ""; // current room
var area = ""; // current area

// User data
var username = "";
var password = "";

// Listen for server chat event
socket.on('chat message', function(msg){
	output = output + msg +"\n\n"; // output equals current output plus new input from server and adds two lines down
	outputText.text = output; // output Text object gets updated with new values
			
	if (output == "") // if output is empty
	{
		boundyHeight = 0; // set output height to 0 to avoid glitches from NULL height
	}
	else // if output is not empty
	{
		boundyHeight = outputText.getMeasuredHeight(); // get output height
	}
		
	if (scrollLock == 0) // if scroll Lock is not active
	{
		if (boundyHeight + 20 > canvasHeight - 80)  // if output height reaches input divider
		{
			outputText.y = canvasHeight - boundyHeight -30; // Scroll text up
		}
		else // if output height is within normal limits
		{
			outputText.y = 20; // Keep output at regular Y position
		}
	}
});
		
socket.on('usernameSet', function(msg){	// Sets Username from server
	username = msg;
});

socket.on('passSet', function(msg){	// Sets password from server
	password = msg;
});

socket.on('clear', function(){	// Listens for clear event
	output = ""; //clears output
	outputText.text = output; //updates output canvas object with new value
});

socket.on('lockScroll', function(){	// Locks Text scrolling in output
	scrollLock = 1;
});

socket.on('unlockScroll', function(){	// Unlocks Text scrolling in output
	scrollLock = 0;
});

//$(function () {
		//var socket = io();
		//$('form').submit(function(){
			//socket.emit('chat message', $('#m').val());
			//$('#m').val('');
			//return false;
		//});
		//socket.on('chat message', function(msg){
			//$('#messages').append($('<li>').text(msg));
		//});
	//});

// Functions

// Join server function
function joinServer() {
	socket.emit('join'); // Send Join event
}

// function that sends server Data
function sendServer() {
	socket.emit('chat message', {input, gameMode, step, username, password, room}); // Pass these variables to server
	input = ""; // Clear input
}

// function that sends enter event
function enterEvent() {
	socket.emit('enter event'); // Pass an enter event to the server
}


// When the window loads
window.onload = function()
{
    /*
     *      Set up the Canvas with Size and height
     *
     */
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = canvasWidth;
    context.canvas.height = canvasHeight;
    stage = new createjs.Stage("myCanvas");


    /*
     *      Set up the Asset Queue and load sounds
     *
     */
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    /*
     *      Create a load manifest for all assets
     *
     */
    queue.loadManifest
	([
		// Nothing to load yet
    ]);
    queue.load(); // call the queue load function
	
}

function queueLoaded(event) 
{
	// Add Background 
	backGround = new createjs.Shape();
    backGround.graphics.beginFill('black');
    backGround.graphics.drawRect(0, 0, canvasWidth, canvasHeight);
    backGround.graphics.endFill();
	backGround.x = 0;
	backGround.y = 0;
	stage.addChild(backGround);
	
	//Add output
    outputText = new createjs.Text(output, "24px courier", "#FFF");
    outputText.x = 20;
    outputText.y = 20;
	outputText.lineWidth = canvasWidth - 40;
	outputText.lineHeight = 30;
	outputText.maxHeight = 20;
    stage.addChild(outputText); 
	
	//Input divider (Hides output text underneath)
	rect = new createjs.Shape();
    rect.graphics.beginFill('black');
    rect.graphics.drawRect(0, 0, canvasWidth, 80);
    rect.graphics.endFill();
	rect.x = 0;
	rect.y = canvasHeight - 80;
	stage.addChild(rect);
	
	//Add input
    inputText = new createjs.Text(input, "24px courier", "#FFF");
    inputText.x = 20;
    inputText.y = canvasHeight - 41;
    stage.addChild(inputText);

	// Add Ticker
    createjs.Ticker.addEventListener('tick', tickEvent);
	createjs.Ticker.setFPS(60);
	
//	$(window).keypress(function(e) {
//		keyPressed = String.fromCharCode(e.charCode);	
//	});

	window.addEventListener("keydown", dealWithKeyboard, false); // on key down event
	window.addEventListener("resize", sizeMe, false); // on window resize event
	
	joinServer(); // Once page is setup we join the server offically by calling the join server function
}


function tickEvent(event) // Calls each tick (60 times a second)
{ 
	var boundyWidth; // Width of input

	if (input == "") // if we have no input
	{
		boundyWidth = 0; // Set the input width to 0 to avoid various glitches with NULL width
	}
	else // if input contains values
	{
	 //boundy = inputText.getTransformedBounds().width;
	   boundyWidth = inputText.getMeasuredWidth(); //Get the width of input
	}
	
	if (boundyWidth + 60 > canvasWidth) // if text goes beyond canvas boundaries
	{
		inputText.x = canvasWidth - boundyWidth -40; // scroll text to the left (off the canvas)
	}
	else // otherwise
	{
	   inputText.x = 20; // keep input at initial X
	}
	
	
	stage.update(); // update the stage
}

function sizeMe() // upon window resize
{
	canvasWidth = $(window).width() - 25; // Update width of canvas
	canvasHeight = $(window).height() - 25; // Update height of canvas
	context.canvas.width = canvasWidth; // update canvas width
	context.canvas.height = canvasHeight; // update canvas height
	inputText.y = canvasHeight - 41; // relocate input
	rect.graphics.clear().beginFill('black').drawRect(0,0,canvasWidth,80);
	rect.graphics.endFill();
	rect.y = canvasHeight - 80; // relocate input divider
	outputText.lineWidth = canvasWidth - 40; // change output line width with window
	outputText.y = 20; // Keep output at regular Y position


}

function dealWithKeyboard(e)
{
	e.preventDefault(); // prevent all keypress defaults from occuring
	
	if (e.key == "Backspace") // if user presses backspace
	{
		input = input.slice(0,-1); // remove one character from input
	}
	else if (e.key == "Enter") // if user presses enter
	{
		enterEvent(); // send an enter event
		
		if (!input == "") // if input is not empty
		{
			sendServer(); // Call send server function (Sending input and data to server)
		}

	}
	else if (e.key == "ArrowUp") // if user presses Up Arrow
	{
		if (outputText.y >= 20) // if output y position goes past initial y poisition
		{
			outputText.y = 20; // Set output back to initial Y poisition
		}
		else // if output y position is less than initial y poisition
		{
			outputText.y = outputText.y + 10; // Scroll text down
		}
	}
	else if (e.key == "ArrowDown") // if user presses Down Arrow
	{
		if (boundyHeight + 20 > canvasHeight - 80) // if output height reaches past input divider
		{
			if (outputText.y <= canvasHeight - boundyHeight -30) // if text has scrolled past end of outputtext
			{
				outputText.y = canvasHeight - boundyHeight -30;  // Set output back to end of text
			}
			else //Otherwise
			{
				outputText.y = outputText.y - 10; // Scroll Text Up
			}
		}
	}
	else if (e.key == "ArrowLeft") // if user presses left arrow
	{
	}
	else if (e.key == "ArrowRight")  // if user presses right arrow
	{
		
	}
	else if (e.key == "PageUp") // if user presses page up
	{
		if (outputText.y >= 20) // if output y position goes past initial y poisition
		{
			outputText.y = 20;  // Set output back to initial Y poisition
		}
		else // if output y position is less than initial y poisition
		{
			outputText.y = outputText.y + 100; // scroll text down fast
		}
	}
		else if (e.key == "PageDown") // if user presses page down
	{
		if (boundyHeight + 20 > canvasHeight - 80) // if output height reaches past input divider
		{
			if (outputText.y <= canvasHeight - boundyHeight -30) // if text has scrolled past end of outputtext
			{
				outputText.y = canvasHeight - boundyHeight -30; // Set output back to end of text
			}
			else
			{
				outputText.y = outputText.y - 100; // scroll text up fast
			}
		}
	}
	else if (e.key == "Home") // if user presses home
	{
		outputText.y = 20;  // Set output to initial Y poisition
	}
	else if (e.key == "End") // if user presses end
	{
		if (boundyHeight + 20 > canvasHeight - 80) // if output height reaches past input divider
		{
			outputText.y = canvasHeight - boundyHeight -30; // Set output to end of text
		}
	}
	else if (e.key == "Shift") // if user presses shift
	{
		// prevents the word "Shift" from being typed
	}
	else if (e.key == "Tab") // if user presses tab
	{
		
	}
	else if (e.key == "CapsLock") // if user presses CapsLock
	{
		
	}
	else // otherwise assume it's a symbol to be typed
	{
		keyPressed = e.key; // determines symbol pressed
		input = input + keyPressed; // adds symbol to input
	}
	
	inputText.text = input; // updates input object with new value
}
