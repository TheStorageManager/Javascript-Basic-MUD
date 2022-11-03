// Basic Mud Main
// v1.2-a
// Created by ???
// Started on Jan 1, 2022

// Imports
var Engine = require("./engine"); // Imports the Game Engine
var CONSTANT = require("./constants"); // Imports the Constants

// Server Functions Imports
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');

// Server Variables
var serverData = { // Holds all the server data for the users
	adminMode: [], // Gives Admin Privileges
	userData: [], // Holds all user data
	userState: [], // Holds the user state
	gameMode: [], // Holds the user game mode
	step: [], // Holds the user's position during certain processes (Logging in)
	eventStep: [] // Holds the user's position in an event
} 

// Directories
var userDir = "Server\\Data\\User\\"; // Directory for user data
var dataDir = "Server\\Data\\"; // Directory for Server data

// Add Directory
app.use('/Server', express.static(path.join(__dirname + '/Server'))); // Add Server Directory "Public"

// Server Startup
Engine(CONSTANT.MOD_B_MUD, CONSTANT.FUNC_STARTUP);

// Get server page
app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html'); // Send the player the webpage
});

//on connection
io.on('connect', function(socket)
{
	
	console.log(String(socket.handshake.address) + " Connected"); // server logs connection with IP
	
	socket.on('join', function() // when user joins
	{
		serverData.adminMode[socket.id] = false; // set user as non-Admin
		serverData.userData[socket.id] = Engine(CONSTANT.MOD_B_MUD, CONSTANT.FUNC_FACTORY, CONSTANT.FAC_USER_DATA, "guest", ""); // set user as guest
		serverData.userState[socket.id] = 0; // set user to the normal state
		serverData.gameMode[socket.id] = 0; // set current game mode to 0
		serverData.step[socket.id] = 0; // set current step to 0
		serverData.eventStep[socket.id] = 0; // set current event step
		
		Engine(CONSTANT.MOD_B_MUD, CONSTANT.FUNC_LOG_IN, socket, "", serverData); // Starts the Login Process 
	});
	
	socket.on('disconnect', function() // when user leaves page or disconnects
	{ 
		if (serverData.userData[socket.id])
		{
			console.log(String(socket.handshake.address) + ' (' + serverData.userData[socket.id].name + ') disconnected'); // Tell us who left
			if (!serverData.userData[socket.id].name == "") // if user name isn't undefined
			{
				// Remove Player from current room as well (Do it first)
				serverData.userData[socket.id].online = 0 // Make user offline
				Engine(CONSTANT.MOD_B_MUD, CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save user data
			}
		}
		else
		{
			console.log(String(socket.handshake.address) +  ' disconnected');
		}
	});

    socket.on('chat message', function(msg) // when user types and sends a message
	{ 
		switch (serverData.gameMode[socket.id]) // Picks the function to throw for each different mode
		{
			case 0: // Logging In
				Engine(CONSTANT.MOD_B_MUD, CONSTANT.FUNC_LOG_IN, socket, msg, serverData, msg.input, userDir); // Continues the Login Process 
				break;
			case 1:
				Engine(CONSTANT.MOD_GLOOP, CONSTANT.FUNC_LOOP, socket, serverData, msg, msg.input); // Game Loop
				break;
			default: // User is Banned
				socket.emit('chat message', "You are Banned"); // Repeat that the user is banned whenever they send chat request
		}
	});
});

function update() // runs every second
{
  date = new Date();
}

setInterval(function(){ update(); }, 1000); // Executes code every second

// Listen on port 3000
http.listen(3000, function()
{ 
  console.log('listening on *:3000'); // Tell the server that you're listening...
});;