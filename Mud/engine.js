// Basic Mud Engine
// v1.2-a
// Created by ???
// Started on Jan 1, 2022

// Bugs--------------------------------------------------------------------------------------------
// Fix Grammar for entering room from Up/Down/Special (Special probably different command like enter)
// Add player to room when logging on / Remove player from room upon logging out.
// Fix Look in issue where you can't look inside a door unless the door is open.
//
// Ideas-------------------------------------------------------------------------------------------
// Make Magic Spell (Animate) that can turn any Item/Object into a creature (Have Entity template that gains all object properties + add in missing ones with template)
// Being able to match Objects with Prepositions words like north?
// Create Linked Item Property in Objects (Treats both object as if they were the same object)
// When getting a new username check to see if it matches any current in game items and then refuse the name if any match "You expect me to believe your name is Wooden Table?"
// On startup match usernames against all item and then flag for username change if they do
//
// To Do-------------------------------------------------------------------------------------------
// Make Commands
// - Action
//  + Use [Uses an item from inventory] *Advanced - Game Specific*
//  + Quit/Logout
// - Quality of Life
//  + Help (?) [Lists all the Commands and gives information on how to use them]
//  + Repeat Last Command (>)
//  + Scroll Lock (Makes it so that the client text stops scrolling)
//  + Time (Gives the server time)
// - Administrator
//  + Create (Makes a temporary item/Object/Entity and places it in current room or creates a permanent room)
//  + Edit (Changes Room/item/Object/Entity/Player properties permanently)
//  + Event Handler
//   = Tigger (Open/Close/Toggle Switch)
//   = Condition (On/Off/None)
//   = Room (Target Room for effect)
//   = Target Type (Object/Player/Ect.)
//   = Target (Name of target)
//   = Effect (Interpreted and handled by Event handler) (Lock/Unlock Door/Change Weather)
//   = Range (Single/Multiple objects)
//  + Give (Gives player an item)
//  + Refresh (Resets all the rooms or just 1)
//
// Add in Room Resfresh Every 24 Hours
// Function to calculate capacity used <--- Important
// Make the light detection work
// if the text parser doesn't get at least one match on Noun then there is no winner
// Add all the scripted messages to constants
// Categorize Scripted Messages (Server, NPC, ETC)
// Add doors to the take function (Just to tell players no - immersion)
// Figure out how to deal with multiple objects that have exact same name across Inventory/Room Objects/Doors
// Get player to use right prepositions so saying "Unlock Door off Key" doesn't actually unlock the door (Maybe this is too much?)
// Make it so that Items on objects are displaed when looking at room.
// Make it so that you cannot place items under object in inventory. Also any item under an object that gets picked up gets droped into room. (Joke message when looking under items in inventory)
// Check object/item state before grabbing (Liquids/Gases cannot be picked up by hand)
// Make function that pluralizes words (Mouse > Mice, Moose > Moose, Cat > Cats). Just add an s unless it's a special word. Special word dictionary.
// Improve Light & Darkness system so that selecting inventory items in the darkness is random and finding objects/player in a dark room has a chance system.

// Current Features--------------------------------------------------------------------------------
// Light & Darkness System
// Text Parsing
// Text Interpreting
// Commands
// - Action
//  + Close [Closes door/object/item]
//  + Drop [Drops an item on the ground]
//  + Examine [Gives a full item description]
//  + Inventory (I) [Check Held Items & Money]
//  + Light [Sets an object on fire - IE Torch, Lantern, Campfire]
//  + Lock [Locks door/object/item]
//  + Look (L) [Get room description]
//  + Look in/Under/on [Checks to see what items are inside/Under/On an object]
//  + Open [Opens door/object/item]
//  + Put/Place [Places an item inside, under or on top of an object]
//  + Read [Read item or object]
//  + Say [Say something that everyone in the room can hear]
//  + Take [Takes an object/item from the ground]
//  + Take From/Under [Takes an item from/under an object/door]
//  + Unlock [Unlocks door/object/item]
//  + Whisper (Wh) [Say something to another player in the room without anyone else hearing]
//  + Yell (Y) (Say something that everyone in the entire area can hear
// - Movement [Move in specified direction - IE change rooms]
//  + North (N)
//  + Northeast (NE)
//  + East (E)
//  + Southeast (SE)
//  + South (S)
//  + Southwest (SW)
//  + West (W)
//  + Up (U)
//  + Down (D)
// - Quality of Life
//  + Clear [Removes all old text from client interface]

// Engine Format: Engine(Module, Function, Option1, Option2, ...)

var CONSTANT = require("./constants");
var fs = require('fs'); // Sync Reading and saving 
var fsp =  require('fs').promises; // Async Reading and saving 

module.exports = async function (module, func, opt1, opt2, opt3, opt4, opt5, opt6) //The engine for a basic Mud all functions are included in this one large function
{ 
	var result = ""; // initialize result holder
	
	async function Basic_Mud (func, opt1, opt2, opt3, opt4, opt5, opt6) // Module that holds all the basic MUD Functions
	{
		async function Admin (command, opt1, opt2, opt3, opt4, opt5) // Admin Functions
		{
			async function Add_Object(targetData, itemData, amount, limit) // Gives an object to a place
			{
				// Fix to allow checking for stacks that aren't full when invetory has no open slots left
				amount = parseInt(amount) || 1; // protection
				var leftover = 0; // Tell us how many items we have left to give on overflow
				var outcome = 
				{
					result: 0, // See outcome results below
					number: 0 // How many items given
				}; // we can determine what to tell players based on outcome
				
				// outcome results
				// 0 - failed to give any items (only current reason *Not enough room*)
				// 1 - succeeded in giving all items
				// 2 - gave partial amount of items (Not enough room)
				
				if (amount > CONSTANT.MAX_STACK) // if player tries to deposit more than one stack at a time
				{
					amount = CONSTANT.MAX_STACK; // make it a stack
				}
				else if (amount <= 0) // if trying to give zero or less items
				{
					amount = 1; // sets amount to 1
				}
				
				if (itemData.stackMax == 1) // If item is not stackable
				{
					var applied = 0; // Keeps track of items added to target
					
					async function addLoop()
					{
						if(amount > 1 && (targetData.length < limit || limit < 0)) // if more than one item and target has space
						{
							var tempArray = JSON.parse(JSON.stringify(itemData)); // pass item to temporary array while using parse/stringy to sever reference
							tempArray.quant = 1; // Non-stackable can only have 1 item per stack
							targetData.splice(0,0,tempArray); // Add new item to target
							
							applied++; // Increment
							amount--; // Decrement
							await addLoop(); // Make it loop again
						}
						else if(amount == 1 && (targetData.length < limit || limit < 0)) // if only one item and target has space
						{
							var tempArray = JSON.parse(JSON.stringify(itemData)); // pass item to temporary array while using parse/stringy to sever reference
							tempArray.quant = 1; // Non-stackable can only have 1 item per stack
							targetData.splice(0,0,tempArray); // Add new item to target
							
							applied++; // Increment
							amount--; // Decrement
							
							outcome.number = applied; // send number of items given to target
							outcome.result = 1; // set that all items were successfully given to target
						}
						else if(amount < 1) // Fail safe (Should never be executed)
						{
							if(applied > 0) // if some items were already given to target
							{
								outcome.number = applied; // send number of items given to target
								outcome.result = 1; // set that all items were successfully given to target
							}
							else // if no items were given to target yet
							{
								outcome.number = applied; // send number of items given to target
								outcome.result = 0; // set that no items were successfully given to target
							}
						}
						else // If target has no space
						{
							if(applied > 0) // if some items were already given to target
							{
								if (amount > 0)
								{
									outcome.number = applied; // send number of items given to target
									outcome.result = 2; // set that some items were successfully given to target
								}
								else // Failsafe (Should never be executed)
								{
									outcome.number = applied; // send number of items given to target
									outcome.result = 1; // set that all items were successfully given to target
								}
							}
							else // if no items were given to target yet
							{
								outcome.number = applied; // send number of items given to target
								outcome.result = 0; // set that no items were successfully given to target
							}
						}
					}
					
					await addLoop(); // Start the initial loop
				}
				else // if item is stackable
				{
					var itemPass = await Add_Match(targetData, itemData.name); // locate item in target
					
					if (!(itemPass == CONSTANT.NULL)) // if we found the item
					{
						if (targetData[itemPass].quant + amount <= targetData[itemPass].stackMax)// make sure putting all items in stack doesn't go over max stack
						{
							targetData[itemPass].quant = targetData[itemPass].quant + amount; // add all to stack
							
							outcome.number = amount; // set amount of items we gave
							outcome.result = 1; // set that giving items was successful
							
							//socket.emit('chat message', 'You dropped ' + playerData.inventory[itemPass].quant + ' '  + playerData.inventory[itemPass].name + 's.'); // tell player what they dropped
							//socket.broadcast.to(playerData.room).emit('chat message', playerData.username + ' dropped ' + playerData.inventory[itemPass].number + ' '  + playerData.inventory[itemPass].name) + 's.'; // tell room what player dropped
						}
						else // Stack overflow
						{
							leftover = targetData[itemPass].quant + amount - targetData[itemPass].stackMax; // calculate amount of overflow
							targetData[itemPass].quant = targetData[itemPass].stackMax; // max out current stack
						}
					}
					else // No stack exists
					{
						if (targetData.length < limit || limit < 0) // if target isn't full (-1 or less means no limit)
						{
							var tempArray = JSON.parse(JSON.stringify(itemData)); // pass item to temporary array while using parse/stringy to sever reference
							tempArray.quant = amount; // Change amount to the right amount
							targetData.splice(0,0, tempArray); // add new stack of item to room
						
							outcome.number = amount; // set amount of items we gave
							outcome.result = 1; // set that giving items was successful
							
							//socket.emit('chat message', 'You dropped ' + playerData.inventory[itemPass].number + ' '  + playerData.inventory[itemPass].name + 's.'); // tell player what they dropped
							//socket.broadcast.to(playerData.room).emit('chat message', playerData.username + ' dropped ' + playerData.inventory[itemPass].number + ' '  + playerData.inventory[itemPass].name) + 's.'; // tell room what player dropped
						}
						else // if target too full
						{
							outcome.number = 0; // set that we did not give any items
							outcome.result = 0; // set that giving items was not successful
						}
					}
					
					if (leftover > 0) // if we have leftovers
					{
						if ((!(targetData.length >= limit) || limit < 0)) // if target isn't full (-1 means no limit)
						{
							var tempArray = JSON.parse(JSON.stringify(itemData)); // insert item into target removing reference data (Clone Data)
							tempArray.quant = leftover; // adjust number
							targetData.splice(0,0, tempArray); // give new stack of items to target
							
							outcome.number = amount; // set amount of items we gave
							outcome.result = 1; // set that giving items was successful
							
							//socket.emit('chat message', 'You dropped ' + playerData.inventory[itemPass].number + ' '  + playerData.inventory[itemPass].name + 's.'); // tell player what they dropped
							//socket.broadcast.to(playerData.room).emit('chat message', playerData.username + ' dropped ' + playerData.inventory[itemPass].number + ' '  + playerData.inventory[itemPass].name) + 's.'; // tell room what player dropped
						}
						else // target is too full for more items
						{
							outcome.number = amount - leftover; // set amount of items we gave
							outcome.result = 2; // set that we gave a partial amount of items
						}
					}
				}
		
				result = {targetData, outcome} // set results
				return result; // send the results to the process
			}
			
			async function Subtract_Object(targetData, itemName, amount) // Removes an object from a place
			{
				amount = parseInt(amount) || 1; // protection
				var applied = 0; // tell us how many items have currently been subtracted on underflow
				var itemData = ""; // Holds the Item Data
				var outcome = // we can determine what to tell players based on outcome
				{
					result: 0, // See outcome results below
					number: 0 // how many items subtracted
				}; 
				
				// outcome results
				// 0 - failed to remove any items (only current reason *Item not found*)
				// 1 - succeeded in removing all items
				// 2 - removed partial amount of items (Not enough items found)
				
				if (amount > CONSTANT.MAX_STACK) // if trying to remove more than a stack
				{
					amount = CONSTANT.MAX_STACK; // make it a stack
				}
				else if (amount <= 0) // if trying to remove zero or less items
				{
					amount = 1; // sets amount to 1
				}
				
				var itemPass; // initialize
				
				async function subLoop() // for subtracting stacks of items until all items have been removed
				{   
					itemPass = await Name_Match(targetData, itemName); // locate item in target
					
					if (!(itemPass == CONSTANT.NULL)) // if we found the item
					{
						itemData = targetData[itemPass]; // Pass the item data to variable
						
						if (targetData[itemPass].quant > amount) // stack has more than what we are trying to remove
						{
							targetData[itemPass].quant = targetData[itemPass].quant - amount; // remove all from stack
						
							applied = applied + amount; // add amount to applied amount
						
							outcome.number = applied; // set amount of items we removed
							outcome.result = 1; // set that removing items was successful
						}
						else if (targetData[itemPass].quant == amount) // stack has the same amount of what we are trying to remove
						{
							targetData.splice(itemPass,1); // remove stack from target
							
							applied = applied + amount; // add amount to applied amount
						
							outcome.number = applied; // set amount of items we removed
							outcome.result = 1; // set that removing items was successful
						}
						else // stack has less than what we are trying to remove
						{
							applied = applied + targetData[itemPass].quant; // add amount of items removed to applied amount
							amount = amount - targetData[itemPass].quant; // remove stack amount from amount left to remove
							
							targetData.splice(itemPass,1); // remove stack from target
							
							await subLoop(); // restart the loop
						}
					}
					else // item was not found
					{
						if (applied > 0) // if we removed some items
						{
							outcome.number = applied; // set amount of items we removed
							outcome.result = 2; // set that we removed a partial amount of items
						}
						else // if we removed no items
						{
							outcome.number = 0; // set that we did not remove any items
							outcome.result = 0; // set that removing items was not successful
						}
					}
				}
				
				await subLoop(); // call subtract loop
				
				result = {targetData, itemData, itemPass, outcome} // set results
				return result; // send the results to the process
			}
				
			async function Object_Transfer(takeData, giveData, itemName, amount, limit) // Transfers one object to another place
			{
				amount = parseInt(amount) || 1; // protection
				// subtract item to move first if error do not give
				// Add to thing giving item to if error do not save (subtracted items go back)
				failed = true; // default to fail
				
				if (amount > CONSTANT.MAX_STACK) // if trying to move more than a stack
				{
					amount = CONSTANT.MAX_STACK; // make it a stack
				}
				else if (amount <= 0) // if trying to move zero or less items
				{
					amount = 1; // sets amount to 1
				}
				
				var subRes = await Subtract_Object(takeData, itemName, amount); // remove the item get results
				var subOutcome = subRes.outcome; // pass outcome to storage variable
				takeData = subRes.targetData; // update data
				var addRes; // initialize
				var addOutcome = {
					result: 0, // See outcome results below
					number: 0 // How many items given
				}; // we can determine what to tell players based on outcome
				
				if(subRes.outcome.result == 1) // if success
				{
					addRes = await Add_Object(giveData, subRes.itemData, amount, limit); // give the item get results
					addOutcome = addRes.outcome;
					giveData = addRes.targetData; // update data
				}
				else if(subRes.outcome.result == 2) // if partial success
				{
					amount = subRes.outcome.number; // correct amount
					addRes = await Add_Object(giveData, subRes.itemData, amount, limit); // give the item get results
					addOutcome = addRes.outcome;		
					giveData = addRes.targetData; // update data
				}
				
				// Refine this part later? (Making give back have no limit is a bit messy, but it should work theoretically since they held it first)
				if(addOutcome.number < subOutcome.number) // If the amount of items given is less than the amount of items taken
				{
					amount = subOutcome.number - addOutcome.number; // amount equals amount subtracted minus amount given
					addRes = await Add_Object(takeData, subRes.itemData, amount, -1); // give the leftover items back to giver
					subOutcome.number = subOutcome.number - addRes.outcome.number; // remove the given items from the amount initially subtracted
				}

				result = {takeData, giveData, subOutcome, addOutcome};
				return result; // give results to process
			}
			
			async function Door_Match(array, name) // Finds a Door by name
			{	
				// Add function to add in an exit name to check first. If object matches that door then stop matching and pick that one. Otherwise search all exits.
				result = CONSTANT.NULL; // Default as not found
				for (x = 0; x < array.length; x++) // Loop finds the Object (But only the first instance)
				{
					if (array[x].door.name == name) // If Name matches object
					{
						result = x; // Save position
						x = array.length; // End the Loop
					}
				}
				
				return result;
			}
			
			async function Name_Match(array, name) // Finds an Object by name
			{	
				// Add function to look through items inside other objects
			
				result = CONSTANT.NULL; // Default as not found
				for (x = 0; x < array.length; x++) // Loop finds the Object (But only the first instance)
				{
					if (array[x].name == name) // If Name matches object
					{
						result = x; // Save position
						x = array.length; // End the Loop
					}
				}
				
				return result;
			}
			
			async function Add_Match(array, name) // Finds an Object by name if Stack is less than 99
			{	
				// Add function to look through items inside other objects
			
				result = CONSTANT.NULL; // Default as not found
				for (x = 0; x < array.length; x++) // Loop finds the Object (But only the first instance)
				{
					if (array[x].name == name && array[x].quant < array[x].stackMax) // If Name matches object and quantity is less than Stack Maximum
					{
						result = x; // Save position
						x = array.length; // End the Loop
					}
				}
				
				return result;
			}
			
			async function Light_Loop (socket, serverData) // Used to find a light source in objects
			{
				var result = false; // default to false
				var globalData = await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.GLOBAL, CONSTANT.GLOBAL.toLowerCase()); // load the global Data
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => 
				{
					roomData = next;
				});
				
				if (roomData.light > 0) // If room has natural light
				{
					result = true; // light exists in the room
					return result; // End it with result
				}
				else if (roomData.ouside > 0 && globalData.daylight == 2) // If outside and it's daylight
				{
					result = true;
					return result;
				}
				
				for (x = 0; x < serverData.userData[socket.id].inventory.length; x++) // Loop for player inventory
				{
					if (serverData.userData[socket.id].inventory[x].light > 0) // if item emits light
					{ 
						result = true;
						return result;
					}
				}
				
				for (x = 0; x < roomData.objects.length; x++) // Loop for room objects
				{
					if (roomData.objects[x].light > 0) // if object emits light
					{ 
						result = true;
						return result;
					}
				}
				
				for (x = 0; x < roomData.exits.length; x++) // Loop for doors
				{
					if (roomData.exits[x].door != "") // if door exists
					{ 
						if (roomData.exits[x].door.light > 0) // if door emits light
						{ 
							result = true;
							return result;
						}
					}
				}
				
				return result;
			}
			
			switch (command) // The Command process
			{
				case CONSTANT.AD_D_MATCH:
					result = await Door_Match(opt1, opt2);
					break;
				case CONSTANT.AD_L_LOOP:
					result = await Light_Loop(opt1, opt2); // Check for light in room
					break;
				case CONSTANT.AD_N_MATCH:
					result = await Name_Match(opt1, opt2);
					break;
				case CONSTANT.AD_O_ADD:
					result = await Add_Object(opt1, opt2, opt3, opt4);
					break;
				case CONSTANT.AD_O_TRANS:
					result = await Object_Transfer(opt1, opt2, opt3, opt4, opt5);
					break;
				case CONSTANT.AD_O_SUB:
					result = await Subtract_Object(opt1, opt2, opt3);
					break;
				default:
					return result; // returns blank result
			}
			
			return result;
		}
		
		async function Command (command, socket, serverData, userInput) // Game Commands 
		{
			async function Clear(socket) // Clears player's screen
			{
				socket.emit('clear'); // call to clear client's output
			}
			
			async function Close(socket, serverData, data) // Closes Door/Room Object/Inventory Object
			{
				var itemPass = "";
				var ItemPass2 = "";
				var ItemPass3 = "";
				var roomData = "";
				
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.open == 1) // if object is open
					{
						roomData.exits[itemPass].door.open = 0; // close the door
						await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
						socket.emit('chat message', 'You close the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
						socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' closed the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
					}
					else if (roomData.exits[itemPass].door.open == 0)// if object is already closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already closed.' ); // Tell user the item is closed
					}
					else // if object cannot be opened/closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be closed.' ); // Tell user the item can't be closed
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If Player object exists
				{
					if (serverData.userData[socket.id].inventory[itemPass2].open == 1) // if object is open
					{
						serverData.userData[socket.id].inventory[itemPass2].open = 0; // close the door
						await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
						socket.emit('chat message', 'You close the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
						socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' closed the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
					}
					else if (serverData.userData[socket.id].inventory[itemPass2].open == 0)// if object is already closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already closed.' ); // Tell user the item is closed
					}
					else // if object cannot be opened/closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be closed.' ); // Tell user the item can't be closed
					}
				}
				else if (itemPass3 != CONSTANT.NULL) // If room object exists
				{
					if (roomData.objects[itemPass3].open == 1) // if object is open
					{
						roomData.objects[itemPass3].open = 0; // close the door
						await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
						socket.emit('chat message', 'You close the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
						socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' closed the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
					}
					else if (roomData.objects[itemPass3].open == 0)// if object is already closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already closed.' ); // Tell user the item is closed
					}
					else // if object cannot be opened/closed
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be closed.' ); // Tell user the item can't be closed
					}
				}
				else // If the object is nowhere
				{
					socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here to close.' ); // tell user the the item doesn't exist
				}
			}
			
			async function Drop(socket, serverData, data) // Drops Object from inventory
			{
				// Add functions to drop items in objects, on objects or under objects
				// Add functions to let player know if the room is just full of items so you cannot drop
				var indPro = data[CONSTANT.IND_PRO]; // Add indefinite pronouns to Text Parser
				var quant = data[CONSTANT.QUANT] || 1; // Default to 1 (Add Numbers to text parser)
				var objTrans = ""; // Initialize
				
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				if (quant > CONSTANT.MAX_STACK) // if player tries to deposit more than one stack at a time
				{
					quant = 99; // Set Quantity to Max
				}
				
				// Direct Object Checks
				var itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]);
				
				// Indirect Object Checks (Should build these checks into the transfer function and remove this)
				var itemPassInd = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.IND_O]); // for room objects
				var itemPassInd2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.IND_O]); // for Player Inventory
				var itemPassInd3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.IND_O]); // For Room Doors				
				
				if(serverData.userData[socket.id].inventory == "") // If user's inventory is empty
				{
					socket.emit('chat message', 'You have no items to drop.'); // Tell them they have nothing
				}
				else if (data[CONSTANT.DIR_O] == "") // If user didn't specify an object
				{
					socket.emit('chat message', 'What did you want to drop?'); // Get step to change and then resume this once player gives name of object
				}
				else if (itemPass == CONSTANT.NULL)
				{
					socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
				}
				else if (data[CONSTANT.PREP] == "in") // User wanted to place item in an object
				{
					if (data[CONSTANT.IND_O] == "") // if object isn't specified
					{
						socket.emit('chat message', 'What did you want to place the ' + data[CONSTANT.DIR_O] + ' in?');
					}
					else if (itemPassInd != CONSTANT.NULL) // Object is in room
					{
						if (roomData.objects[itemPassInd].open == 0) // if object is closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is closed, so items cannot be placed in it.');
						}
						else
						{
							if (indPro == 'all')
							{
								var itemCount = 0; // Keeps track of moved items
								
								async function Place_In_All()
								{
									if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
									{
										objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].items, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.objects[itemPassInd].capMax);
										
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										
										if(objTrans.addOutcome.result > 0) // if success
										{
											itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
											await Place_In_All(); // Restart the loop
										}
										else // if failure
										{
											return; // exit the loop
										}
									}
									else
									{
										return; // exit the loop
									}
								}
								
								await Place_In_All(); // Start the madness
								
								if (itemCount == 0) // aren't dropping any item
								{
									
									if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
									}
									else // If no removable item exists
									{
										socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
									}
								}
								else if(itemCount == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if placing more than 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].items, data[CONSTANT.DIR_O], quant, roomData.objects[itemPassInd].capMax);
							
								if (objTrans.addOutcome.result > 0)
								{
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									if(objTrans.addOutcome.result == 1) // if only placing 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
									else // if dropping more than 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
								}
								else
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
								}
							}
						}
					}
					else if (itemPassInd2 != CONSTANT.NULL)  // Object is in player inventory
					{
						if (serverData.userData[socket.id].inventory[itemPassInd2].open == 0) // if object is closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is closed, so items cannot be placed in it.');
						}
						else
						{
							if (indPro == 'all')
							{
								var itemCount = 0; // Keeps track of moved items
								
								async function Place_In_All()
								{
									if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
									{
										objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].items, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, serverData.userData[socket.id].inventory[itemPassInd2].capMax);
										
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										
										if(objTrans.addOutcome.result > 0) // if success
										{
											itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
											await Place_In_All(); // Restart the loop
										}
										else // if failure
										{
											return; // exit the loop
										}
									}
									else
									{
										return; // exit the loop
									}
								}
								
								await Place_In_All(); // Start the madness
								
								if (itemCount == 0) // aren't dropping any item
								{
									if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
									}
									else // If no removable item exists
									{
										socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
									}
								}
								else if(itemCount == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if placing more than 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].items, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].inventory[itemPassInd2].capMax);
							
								if (objTrans.addOutcome.result > 0)
								{
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									if(objTrans.addOutcome.result == 1) // if only placing 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
									else // if dropping more than 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
								}
								else
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
								}
							}
						}
					}
					else if (itemPassInd3 != CONSTANT.NULL)  // Object is a Door in room
					{
						if (roomData.exits[itemPassInd3].open == 0) // if object is closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is closed, so items cannot be placed in it.');
						}
						else
						{
							if (indPro == 'all')
							{
								var itemCount = 0; // Keeps track of moved items
								
								async function Place_In_All()
								{
									if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
									{
										objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.items, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.exits[itemPassInd3].door.capMax);
										
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										
										if(objTrans.addOutcome.result > 0) // if success
										{
											itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
											await Place_In_All(); // Restart the loop
										}
										else // if failure
										{
											return; // exit the loop
										}
									}
									else
									{
										return; // exit the loop
									}
								}
								
								await Place_In_All(); // Start the madness
								
								if (itemCount == 0) // aren't dropping any item
								{
									if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
									}
									else // If no removable item exists
									{
										socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
									}
								}
								else if(itemCount == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if placing more than 1 item
								{
									socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.items, data[CONSTANT.DIR_O], quant, roomData.exits[itemPassInd3].door.capMax);
							
								if (objTrans.addOutcome.result > 0)
								{
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									if(objTrans.addOutcome.result == 1) // if only placing 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
									else // if dropping more than 1 item
									{
										socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's in the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
									}
								}
								else
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' is too full.');
								}
							}
						}
					}
					else // Could not find object
					{
						socket.emit('chat message', 'There is no ' + data[CONSTANT.IND_O] + ' here.' ); // tell player we did not find the item
					}
					
					// Check Player inventory & Room Inventory (Check room first)
				}
				else if (data[CONSTANT.PREP] == "on") // User wanted to place item on an object
				{
					if (data[CONSTANT.IND_O] == "") // if object isn't specified
					{
						socket.emit('chat message', 'What did you want to place the ' + data[CONSTANT.DIR_O] + ' on?');
					}
					else if (itemPassInd != CONSTANT.NULL) // Object is in room
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].surfaceItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.objects[itemPassInd].surfCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface is too full.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].surfaceItems, data[CONSTANT.DIR_O], quant, roomData.objects[itemPassInd].surfCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface is too full.');
							}
						}
					}
					else if (itemPassInd2 != CONSTANT.NULL)  // Object is in player inventory
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined	
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].surfaceItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, serverData.userData[socket.id].inventory[itemPassInd2].surfCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface is too full.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].surfaceItems, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].inventory[itemPassInd2].surfCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface  is too full.');
							}
						}
					}
					else if (itemPassInd3 != CONSTANT.NULL)  // Object is a Door in room
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined	
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.surfaceItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.exits[itemPassInd3].door.surfCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else 
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface is too full.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.surfaceItems, data[CONSTANT.DIR_O], quant, roomData.exits[itemPassInd3].door.surfCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You dropped ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's on the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + '\'s surface  is too full.');
							}
						}
					}
				}
				else if (data[CONSTANT.PREP] == "below") // User wanted to place item under an object
				{
					if (data[CONSTANT.IND_O] == "") // if object isn't specified
					{
						socket.emit('chat message', 'What did you want to place the ' + data[CONSTANT.DIR_O] + ' under?');
					}
					else if (itemPassInd != CONSTANT.NULL) // Object is in room
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].underItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.objects[itemPassInd].undCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects[itemPassInd].underItems, data[CONSTANT.DIR_O], quant, roomData.objects[itemPassInd].undCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed in where
								}
							}
							else
							{
								socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
							}
						}
					}
					else if (itemPassInd2 != CONSTANT.NULL)  // Object is in player inventory
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined	
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].underItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, serverData.userData[socket.id].inventory[itemPassInd2].undCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, serverData.userData[socket.id].inventory[itemPassInd2].underItems, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].inventory[itemPassInd2].undCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed in where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
								}
							}
							else
							{
								socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
							}
						}
					}
					else if (itemPassInd3 != CONSTANT.NULL)  // Object is a Door in room
					{
						if (indPro == 'all')
						{
							var itemCount = 0; // Keeps track of moved items
							
							async function Place_In_All()
							{
								if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.underItems, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.exits[itemPassInd3].door.undCapMax);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Place_In_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else
								{
									return; // exit the loop
								}
							}
							
							await Place_In_All(); // Start the madness
							
							if (itemCount == 0) // aren't dropping any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
								}
								else // If no removable item exists
								{
									socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only placing 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed under where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
							else // if placing more than 1 item
							{
								socket.emit('chat message', 'You placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed under where
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
							}
						}
						else
						{
							objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.exits[itemPassInd3].door.underItems, data[CONSTANT.DIR_O], quant, roomData.exits[itemPassInd3].door.undCapMax);
						
							if (objTrans.addOutcome.result > 0)
							{
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								if(objTrans.addOutcome.result == 1) // if only placing 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed under where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
								}
								else // if dropping more than 1 item
								{
									socket.emit('chat message', 'You placed ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they placed under where
									socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' placed ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player placed under where
								}
							}
							else
							{
								socket.emit('chat message', 'It\'s too full under the ' + data[CONSTANT.IND_O] + '.');
							}
						}
					}
				}
				else
				{
					if (indPro	== 'all')
					{	
						var itemCount = 0; // Keeps track of moved items
						
						async function Drop_All ()
						{
							if (typeof serverData.userData[socket.id].inventory[itemPass] != "undefined") // If item is not undefined
							{
								objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects, data[CONSTANT.DIR_O], serverData.userData[socket.id].inventory[itemPass].quant, roomData.capacityMax);
								
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
								
								if(objTrans.addOutcome.result > 0) // if success
								{
									itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
									await Drop_All(); // Restart the loop
								}
								else // if failure
								{
									return; // exit the loop
								}
							}
							else
							{
								return; // exit the loop
							}
						}
						
						await Drop_All(); // Start the madness
						
						if (itemCount == 0) // aren't dropping any item
						{
							if (objTrans.subOutcome.result > 0) // If removable item exists
							{
								socket.emit('chat message', 'The room is too full.');
							}
							else // If no removable item exists
							{
								socket.emit('chat message', 'You are not carrying any ' + data[CONSTANT.DIR_O] + '.'); // tell player we did not find the item
							}
						}
						else if(itemCount == 1) // if only dropping 1 item
						{
							socket.emit('chat message', 'You dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + '.'); // tell player what they dropped
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + '.'); // tell room what player dropped
						}
						else // if dropping more than 1 item
						{
							socket.emit('chat message', 'You dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they dropped
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' dropped ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell room what player dropped
						}
					}
					else // if Quantity
					{	
						objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, serverData.userData[socket.id].inventory, roomData.objects, data[CONSTANT.DIR_O], quant, roomData.capacityMax);
						
						if (objTrans.addOutcome.result > 0)
						{
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							if(objTrans.addOutcome.result == 1) // if only dropping 1 item
							{
								socket.emit('chat message', 'You dropped ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O]); // tell player what they dropped
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].username + ' dropped ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + '.'); // tell room what player dropped
							}
							else // if dropping more than 1 item
							{
								socket.emit('chat message', 'You dropped ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they dropped
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].username + ' dropped ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell room what player dropped
							}
						}
						else
						{
							socket.emit('chat message', 'The room is too full.');
						}
					}
				}
			}
						
			async function Examine(socket, serverData, data) // Examines an object from Inventory or Room
			{
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.fullDesc != "") // if full description exists
					{
						socket.emit('chat message', roomData.exits[itemPass].door.fullDesc); // Give full description
					}
					else if (roomData.exits[itemPass].door.desc != "") // if basic description exists
					{
						socket.emit('chat message', roomData.exits[itemPass].door.desc); // give basic description
					}
					else // No description exits
					{
						socket.emit('chat message', 'There are no words that can describe this incredible object.' ); // Tell user the item is undescribible
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If object exists in player inventory
				{
					if (serverData.userData[socket.id].inventory[itemPass2].fullDesc != "") // if full description exists
					{
						socket.emit('chat message', serverData.userData[socket.id].inventory[itemPass2].fullDesc); // Give full description
					}
					else if (serverData.userData[socket.id].inventory[itemPass2].desc != "") // if basic description exists
					{
						socket.emit('chat message', serverData.userData[socket.id].inventory[itemPass2].desc); // give basic description
					}
					else // No description exits
					{
						socket.emit('chat message', 'There are no words that can describe this incredible object.' ); // Tell user the item is undescribible
					}
				}
				else if(itemPass3 != CONSTANT.NULL) // If object exists in room
				{
					if (roomData.objects[itemPass3].fullDesc != "") // if full description exists
					{
						socket.emit('chat message', roomData.objects[itemPass3].fullDesc); // Give full description
					}
					else if (roomData.objects[itemPass3].desc != "") // if basic description exists
					{
						socket.emit('chat message', roomData.objects[itemPass3].desc); // give basic description
					}
					else // No description exits
					{
						socket.emit('chat message', 'There are no words that can describe this incredible object.' ); // Tell user the item is undescribible
					}
				}
				else // if object does not exist
				{
					socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' );
				}
			}
			
			async function Inventory(socket, serverData) // Shows player what they are holding
			{
				var chatText = 'You are carrying:';
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => 
				{
					roomData = next;
				});
				var isLight = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_L_LOOP, socket, serverData); // check for light
					
				if (!(serverData.userData[socket.id].inventory == "")) // If player has items (not no items)
				{			
					for (i = 0; i < serverData.userData[socket.id].inventory.length; i++) // start loop
					{
						if (isLight) // if light exists
						{
							chatText = chatText + '\n' + serverData.userData[socket.id].inventory[i].name + ' x ' + serverData.userData[socket.id].inventory[i].quant; //add current item to variable								
						}
						else // if light does not exist
						{
							chatText = chatText + '\n??? x ??' // render item unidentifiable
						}
					}
					
					if (isLight) // if light exists
					{
						chatText = chatText + "\nBag: " + serverData.userData[socket.id].inventory.length + "/" + serverData.userData[socket.id].itemLimit;
						chatText = chatText + '\nGold: ' + serverData.userData[socket.id].gold[2] + "." + serverData.userData[socket.id].gold[1] + serverData.userData[socket.id].gold[0];
			
					}
					else // if light does not exist
					{
						chatText = chatText + "\nBag: " + serverData.userData[socket.id].inventory.length + "/" + serverData.userData[socket.id].itemLimit;
						chatText = chatText + '\nGold: ?????';
					}
				}
				else // if player is carrying nothing
				{
					chatText = 'You have no items.' + '\nGold: ' + serverData.userData[socket.id].gold[2] + "." + serverData.userData[socket.id].gold[1] + serverData.userData[socket.id].gold[0];
				}
				
				socket.emit('chat message', chatText); // give player list of inventory
			}
			
			async function Light(socket, serverData, data) // Sets objects on fire
			{
				if (data[CONSTANT.DIR_O] == "") // If user didn't specify an object
				{
					socket.emit('chat message', 'What are you trying to light?');
				}
				else if (data[CONSTANT.IND_O] == "") // if there isn't an indirect object
				{
					socket.emit('chat message', 'What are you trying to light the ' + data[CONSTANT.DIR_O] + ' with?');
				}
				else // We have what we need
				{
					var roomData = "";
					await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
					{
						roomData = next;
					});
					// check room and inventory for direct object.
					// Check inventory for Indirect object.
					var itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
					var itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
					var itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors		
				
					var itemPassInd = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.IND_O]); // Indirect object in player inventory
					
					// Later on make a check to see if item using to set things on fire has fuel/charges and deplete them by one stage
					
					if (itemPass != CONSTANT.NULL) // Object
					{
						if (itemPassInd != CONSTANT.NULL) // Found Indirect object
						{
							if(serverData.userData[socket.id].inventory[itemPassInd].canLight == 0) // If indirect object can't light things on fire
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' cannot be used to light anything.');
							}
							else if(roomData.objects[itemPass].light > 0) // if object is already lit
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' has already been lit.');
							}
							else if(roomData.objects[itemPass].flammable == 0) // If object isn't flammable
							{
								socket.emit('chat message', 'You cannot light the ' + data[CONSTANT.DIR_O] + '.');
							}
							else // All systems go. Light the object.
							{
								roomData.objects[itemPass].light = 1;
								socket.emit('chat message', 'You light the ' + data[CONSTANT.DIR_O] + '.');
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + 'lit the ' + data[CONSTANT.DIR_O] + '.');
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							}
						}
						else // object not found
						{
							socket.emit('chat message', 'You have no ' + data[CONSTANT.IND_O] + '.' );
						}
					}
					else if (itemPass2 != CONSTANT.NULL) // Player Inventory
					{
						if (itemPassInd != CONSTANT.NULL) // Found Indirect object
						{
							if(serverData.userData[socket.id].inventory[itemPassInd].canLight == 0) // If indirect object can't light things on fire
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' cannot be used to light anything.');
							}
							else if(serverData.userData[socket.id].inventory[itemPass2].light > 0) // if object is already lit
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' has already been lit.');
							}
							else if(serverData.userData[socket.id].inventory[itemPass2].flammable == 0) // If object isn't flammable
							{
								socket.emit('chat message', 'You cannot light the ' + data[CONSTANT.DIR_O] + '.');
							}
							else // All systems go. Light the object.
							{
								serverData.userData[socket.id].inventory[itemPass2].light = 1;
								socket.emit('chat message', 'You light the ' + data[CONSTANT.DIR_O] + '.');
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + 'lit the ' + data[CONSTANT.DIR_O] + '.');
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							}
						}
						else // object not found
						{
							socket.emit('chat message', 'You have no ' + data[CONSTANT.IND_O] + '.' );
						}
					}
					else if (itemPass3 != CONSTANT.NULL) // Door
					{
						if (itemPassInd != CONSTANT.NULL) // Found Indirect object
						{
							if(serverData.userData[socket.id].inventory[itemPassInd].canLight == 0) // If indirect object can't light things on fire
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' cannot be used to light anything.');
							}
							else if(roomData.exits[itemPass3].door.light > 0) // if object is already lit
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' has already been lit.');
							}
							else if(roomData.exits[itemPass3].door.flammable == 0) // If object isn't flammable
							{
								socket.emit('chat message', 'You cannot light the ' + data[CONSTANT.DIR_O] + '.');
							}
							else // All systems go. Light the object.
							{
								roomData.exits[itemPass3].door.light = 1;
								socket.emit('chat message', 'You light the ' + data[CONSTANT.DIR_O] + '.');
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + 'lit the ' + data[CONSTANT.DIR_O] + '.');
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							}
						}
						else // object not found
						{
							socket.emit('chat message', 'You have no ' + data[CONSTANT.IND_O] + '.' );
						}
					}
					else // Could not locate object
					{
						socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' );
					}
				}
			}
				
			async function Lock(socket, serverData, data) // Locks Door/Room Object/Inventory Object
			{
				var itemPass = "";
				var ItemPass2 = "";
				var ItemPass3 = "";
				var keyPass = "";
				var keyData = "";
				var roomData = "";
				
				// Make it so that you can use items off room floor?
				keyPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.IND_O]); // Find Key in Player Inventory
				
				if (keyPass != CONSTANT.NULL)
				{
					keyData = serverData.userData[socket.id].inventory[keyPass].id; // set the key Data
				}
				
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.locked == 0) // if door is unlocked
					{
						if (keyData == roomData.exits[itemPass].door.lock || roomData.exits[itemPass].door.lock == "") // If player has key or lock doesn't require key(A lock without a key is pretty pointless though unless we make only one side of the door have a lock with ID that has no matching key and the other side a lock with no key ID)
						{
							roomData.exits[itemPass].door.locked = 1; // lock the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You locked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they locked the door
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' locked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player locked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to lock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (roomData.exits[itemPass].door.locked == 1)// if door is already Locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already locked.' ); // Tell user the door is Locked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be locked.' ); // Tell user the door can't be Locked
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If Player object exists
				{
					if (serverData.userData[socket.id].inventory[itemPass2].locked == 0) // if object is unlocked
					{
						if (keyData == serverData.userData[socket.id].inventory[itemPass2].lock || serverData.userData[socket.id].inventory[itemPass2].lock == "") // If player has key or lock doesn't require key (Pretty Pointless for an object not to need a key)
						{
							serverData.userData[socket.id].inventory[itemPass2].locked = 1; // lock the object
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
							socket.emit('chat message', 'You locked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they locked the object
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' locked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player locked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to lock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (serverData.userData[socket.id].inventory[itemPass2].locked == 1)// if object is already Locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already locked.' ); // Tell user the object is Locked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be locked.' ); // Tell user the object can't be Locked
					}		
				}
				else if (itemPass3 != CONSTANT.NULL) // If room object exists
				{
					if (roomData.objects[itemPass3].locked == 0) // if object is unlocked
					{
						if (keyData == roomData.objects[itemPass3].lock || roomData.objects[itemPass3].lock == "") // If player has key or lock doesn't require key(A lock without a key is pretty pointless though unless we make only one side of the door have a lock with ID that has no matching key and the other side a lock with no key ID)
						{
							roomData.objects[itemPass3].locked = 1; // lock the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You locked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they locked the object
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' locked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player locked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to lock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (roomData.objects[itemPass3].locked == 1)// if object is already Locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already locked.' ); // Tell user the object is Locked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be locked.' ); // Tell user the object can't be Locked
					}
				}
			}
						
			async function Look(socket, serverData, data) // Give player room description
			{
				var chatText = "";
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => 
				{
					roomData = next;
				});
				
				var isLight = await Basic_Mud(CONSTANT.FUNC_ADMIN,CONSTANT.AD_L_LOOP, socket, serverData); // check for light
				
				if (data[CONSTANT.PREP] == "in") // Looking inside an object
				{
					if (data[CONSTANT.DIR_O] == "") // if there isn't a direct object
					{
						socket.emit('chat message', 'What are you trying to look in?');
					}
					else
					{
						var itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
						var itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
						var itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
						
						chatText = 'The ' + data[CONSTANT.DIR_O] + ' contains:';
						
						if (itemPass != CONSTANT.NULL) // If room object exists
						{		
							if (roomData.objects[itemPass].open == 0) // Object is closed
							{
								chatText = 'The ' + data[CONSTANT.DIR_O] + ' is closed.';
							}
							else if (roomData.objects[itemPass].capMax == 0) // Object cannot store items
							{
								chatText = 'You cannot look inside the ' + data[CONSTANT.DIR_O] + '.';
							}
							else if (!(roomData.objects[itemPass].items == "")) // If object has items (not no items)
							{			
								for (i = 0; i < roomData.objects[itemPass].items.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.objects[itemPass].items[i].name + ' x ' + roomData.objects[itemPass].items[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass2 != CONSTANT.NULL)
						{
							if (serverData.userData[socket.id].inventory[itemPass2].open == 0) // Object is closed
							{
								chatText = 'The ' + data[CONSTANT.DIR_O] + ' is closed.';
							}
							else if (serverData.userData[socket.id].inventory[itemPass2].capMax == 0) // Object cannot store items
							{
								chatText = 'You cannot look inside the ' + data[CONSTANT.DIR_O] + '.';
							}
							else if (!(serverData.userData[socket.id].inventory[itemPass2].items == "")) // If object has items (not no items)
							{											
								for (i = 0; i < serverData.userData[socket.id].inventory[itemPass2].items.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + serverData.userData[socket.id].inventory[itemPass2].items[i].name + ' x ' + serverData.userData[socket.id].inventory[itemPass2].items[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass3 != CONSTANT.NULL)
						{
							if (roomData.exits[itemPass3].door.capMax == 0) // Object cannot store items
							{
								chatText = 'You cannot look inside the ' + data[CONSTANT.DIR_O] + '.';
							}
							else if (!(roomData.exits[itemPass3].door.items == "")) // If object has items (not no items)
							{											
								for (i = 0; i < roomData.exits[itemPass3].door.items.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.exits[itemPass3].door.items[i].name + ' x ' + roomData.exits[itemPass3].door.items[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else // Object doesn't exist
						{
							socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' );
						}
					}
				}
				else if (data[CONSTANT.PREP] == "on") // Looking on an object
				{
					if (data[CONSTANT.DIR_O] == "") // if there isn't a direct object
					{
						socket.emit('chat message', 'What are you trying to look at?');
					}
					else
					{
						var itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
						var itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
						var itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
						
						chatText = 'On top of the ' + data[CONSTANT.DIR_O] + ' is:';
						
						if (itemPass != CONSTANT.NULL) // If room object exists
						{		
							if (!(roomData.objects[itemPass].surfaceItems == "")) // If object has items (not no items)
							{			
								for (i = 0; i < roomData.objects[itemPass].surfaceItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.objects[itemPass].surfaceItems[i].name + ' x ' + roomData.objects[itemPass].surfaceItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass2 != CONSTANT.NULL)
						{
							if (!(serverData.userData[socket.id].inventory[itemPass2].surfaceItems == "")) // If object has items (not no items)
							{											
								for (i = 0; i < serverData.userData[socket.id].inventory[itemPass2].surfaceItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + serverData.userData[socket.id].inventory[itemPass2].surfaceItems[i].name + ' x ' + serverData.userData[socket.id].inventory[itemPass2].surfaceItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass3 != CONSTANT.NULL)
						{
							if (!(roomData.exits[itemPass3].door.surfaceItems == "")) // If object has items (not no items)
							{											
								for (i = 0; i < roomData.exits[itemPass3].door.surfaceItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.exits[itemPass3].door.surfaceItems[i].name + ' x ' + roomData.exits[itemPass3].door.surfaceItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else // Object doesn't exist
						{
							socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' );
						}
					}
				}
				else if (data[CONSTANT.PREP] == "below") // Looking under an object
				{
					if (data[CONSTANT.DIR_O] == "") // if there isn't a direct object
					{
						socket.emit('chat message', 'What are you trying to look under?');
					}
					else
					{
						var itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
						var itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
						var itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
						
						chatText = 'Under the ' + data[CONSTANT.DIR_O] + ' is:';
						
						if (itemPass != CONSTANT.NULL) // If room object exists
						{		
							if (!(roomData.objects[itemPass].underItems == "")) // If object has items (not no items)
							{			
								for (i = 0; i < roomData.objects[itemPass].underItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.objects[itemPass].underItems[i].name + ' x ' + roomData.objects[itemPass].underItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass2 != CONSTANT.NULL)
						{
							if (!(serverData.userData[socket.id].inventory[itemPass2].underItems == "")) // If object has items (not no items)
							{											
								for (i = 0; i < serverData.userData[socket.id].inventory[itemPass2].underItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + serverData.userData[socket.id].inventory[itemPass2].underItems[i].name + ' x ' + serverData.userData[socket.id].inventory[itemPass2].underItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else if (itemPass3 != CONSTANT.NULL)
						{
							if (!(roomData.exits[itemPass3].door.underItems == "")) // If object has items (not no items)
							{											
								for (i = 0; i < roomData.exits[itemPass3].door.underItems.length; i++) // start loop
								{
									if (isLight == true) // if light exists
									{
										chatText = chatText + '\n' + roomData.exits[itemPass3].door.underItems[i].name + ' x ' + roomData.exits[itemPass3].door.underItems[i].quant; //add current item to variable								
									}
									else // if light does not exist
									{
										chatText = chatText + '\n??? x ??' // render item unidentifiable
									}
								}
							}
							else // if object contains nothing
							{
								chatText = chatText + '\nNothing';
							}
							
							socket.emit('chat message', chatText); // give player list of inventory
						}
						else // Object doesn't exist
						{
							socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' );
						}
					}
				}
				else // Regular Look Command
				{
					if (isLight == true) // if light exists
					{
						var chatText = roomData.roomName + '\n' + roomData.description;	 // add room name and description
						var chatObj = [];
						var chatItem = [];
						
							// object loop start *Change to Check Object Type*
					
						if (!(roomData.objects == ""))
						{
								
							for (i = 0; i < roomData.objects.length; i++) // Loop Through Room Object
							{
								if(roomData.objects[i].type == CONSTANT.OBJECT) // If Object is type Object
								{
									chatObj[chatObj.length] = roomData.objects[i]; // Sort it into object array
								}
								else 
								{
									chatItem[chatItem.length] =  roomData.objects[i]; // Sort it into item array
								}
							}
							
							for (i = 0; i < chatObj.length; i++) // Loop through the Objects
							{
								chatText = chatText + '\n				There is a ' + chatObj[i].name + ' here.';
								
								if (chatObj[i].open == 1)
								{
									chatText = chatText + ' It is open.';
								}
								
								if (chatObj[i].light == 1) // If Object emits dim light
								{
									chatText = chatText + ' It emits a dim light.';
								}
								else if (chatObj[i].light == 2)  // If Object emits bright light
								{
									chatText = chatText + ' It emits a bright light.';
								}
							}
							
							
							for (i = 0; i < chatItem.length; i++) // Loop through the Items
							{
								if (i == 0) // if the first item
								{
									chatText = chatText + '\n\nOn the ground lies';
								}
								
								if ( i == chatItem.length - 1) // If rendering last item
								{
									if (!(chatItem.length == 1)) // if more than one item in room
									{
										if (chatItem[i].quant == 1) // if item is not a stack
										{
											chatText = chatText + ' and a ' + chatItem[i].name + '.'; 
										}
										else // if stack of item exists
										{
											chatText = chatText +  ' and ' + chatItem[i].quant + ' ' + chatItem[i].name + 's.';
										}
									}
									else // if only one item in room
									{
										if (chatItem[i].quant == 1) // if item is not a stack
										{
											chatText = chatText + ' a ' + chatItem[i].name + '.';
										}
										else // if stack of item exists
										{
											chatText = chatText +  ' ' + chatItem[i].quant + ' ' + chatItem[i].name + 's.';
										}
									}
								}
								else // if rendering an item that is not the last
								{
									if (chatItem[i].quant == 1) // if item is not a stack
									{
										chatText = chatText + ' a ' + chatItem[i].name + ','; 
									}
									else // if stack of item exists
									{
										chatText = chatText +  ' ' + chatItem[i].quant + ' ' + chatItem[i].name + 's,';
									}
								}
							}
						}
						// Object Loop End
						
						
						// NPC loop Start
						if (!(roomData.mobs == ""))
						{
							chatText = chatText + '\n\n';
								
							for (i = 0; i < roomData.npcs.length; i++) 
							{
								npcData = kryptoGameEngine(DATA_PROCESS, NPC, LOAD, roomData.npcs[i].name); // load npc

								chatText = chatText + npcData.name + npcData.intro;
							}
						}
						// NPC Loop End
							
						var tempText = ""; // initialize
							
						// Player loop start
						if (roomData.players != "" && roomData.players.length > 1) // If room has players (not no players)(compensated for self being in room)
						{
							for (i = 0; i < roomData.players.length; i++) // start the loop
							{
								if(roomData.players[i].name != serverData.userData[socket.id].name && tempText == "") // if this is the first entry and not your own username
								{
									tempText = "\n\n" + roomData.players[i].name; // write in username
								}
								else if(roomData.players[i].name != serverData.userData[socket.id].name && i == roomData.players.length - 1) // if this is the last entry and not the first entry
								{
									tempText = tempText + " and " + roomData.players[i].name; // write in username using and
								}
								else if(roomData.players[i].name != serverData.userData[socket.id].name) // if this is not the first entry and not the last entry
								{
									tempText = tempText + ", " + roomData.players[i].name; // write in username using comma
								}
							}
							
							if(roomData.players.length <= 2 && roomData.players.length > 0) // if only one user
							{
								tempText = tempText + " is here." // write in flavor text (is)
							}
							else // if multiple users
							{
								tempText = tempText + " are here." // write in flavor text (are)
							}
						}
						// Player loop end
						
						chatText = chatText + tempText; // write what we got so far
						tempText = ""; // reset
						
						//Door data Start (Fix Up & Down exit grammar)
						for (i = 0; i < roomData.exits.length; i++) // start the loop
						{
							if (!(roomData.exits[i].door == "") && tempText == "") // if door exists and is first entry
							{ 
								var doorState = " a closed "; // default to " a closed "
								
								if(roomData.exits[i].door.open == 1)
								{
									doorState = " an open "; // set that the door is open
								}
								
								tempText = "\n\n" + "There is" + doorState + "door to the " + roomData.exits[i].name.toLowerCase() + "." ; // write in exit
							}
							else if(!(roomData.exits[i].door == "")) // if door exists and is not the first entry
							{
								var doorState = " a closed "; // default to " a closed "
								
								if(roomData.exits[i].open == 1)
								{
									doorState = " an open "; // set that the door is open
								}

								tempText = "\n" + "There is" + doorState + "door to the " + roomData.exits[i].name.toLowerCase() + "." ; // write in exit
							}
						}

						// exit data start
						chatText = chatText + tempText + "\n\nExits: "; // write in what we got so far plus exits header
						
						tempText = ""; // reset
						
						for (i = 0; i < roomData.exits.length; i++) // start the loop
						{
							if (!(roomData.exits[i].exit == "") && tempText == "") // if exit exists and is first entry
							{ 
								tempText = roomData.exits[i].name; // write in exit
							}
							else if(!(roomData.exits[i].exit == "")) // if exit exists and is not the first entry
							{
								tempText = tempText + ", " + roomData.exits[i].name; // write in the exit using a comma
							}
						}
						
						if (tempText == "") // if no exits exist
						{
							tempText = "There are none" // tell user no obvious exits exists
						}
						
						chatText = chatText + tempText; // add all the text together
						
					}
					else // No light exists
					{
						var chatText = '???\nIt is pitch-black in here. You cannot see a thing.';	 // add room name and description
						var chatObj = [];
						var chatItem = [];
						
						// Idea make objects/items that can glow in the dark "new glow property"
						if (!(roomData.objects == ""))
						{
								
							for (i = 0; i < roomData.objects.length; i++) // Loop Through Room Object
							{
								if(roomData.objects[i].type == CONSTANT.OBJECT) // If Object is type Object
								{
									chatObj[chatObj.length] = roomData.objects[i]; // Sort it into object array
								}
								else 
								{
									chatItem[chatItem.length] =  roomData.objects[i]; // Sort it into item array
								}
							}
						}
						
						// Item loopstart - checks for items emitting light so they can be seen in the dark
						if (!(chatItem == "")) // If room has items (not no items)
						{
							var lightArray = ""; // default to blank
							count = 0; // default to 0
							
							for (i = 0; i < chatItem.length; i++) 
							{
								if(chatItem[i].light > 0)
								{
									lightArray[count] = chatItem[i]; // sent to the array that holds the data for items that are emitting light
									count++; // Increment
								}
							}
							
							if(!(lightArray == "")) // if the variable is not empty
							{
								chatText = chatText + '\n\nOn the ground lies';
								
								for (i = 0; i < lightArray.length; i++) // loop the Light Array
								{
									if ( i == lightArray.length - 1) // If rendering last item
									{
										if (!(lightArray.length == 1)) // if more than one item in room
										{
											if (lightArray[i].number == 1) // if item is not a stack
											{
												chatText = chatText + ' and a ' + lightArray[i].name + '.'; 
											}
											else // if stack of item exists
											{
												chatText = chatText +  ' and ' + lightArray[i].number + ' ' + lightArray[i].name + 's.';
											}
										}
										else // if only one item in room
										{
											if (lightArray.number == 1) // if item is not a stack
											{
												chatText = chatText + ' a ' + lightArray[i].name + '.';
											}
											else // if stack of item exists
											{
												chatText = chatText +  ' ' + lightArray[i].number + ' ' + lightArray[i].name + 's.';
											}
										}
									}
									else // if rendering an item that is not the last
									{
										if (lightArray[i].number == 1) // if item is not a stack
										{
											chatText = chatText + ' a ' + lightArray[i].name + ','; 
										}
										else // if stack of item exists
										{
											chatText = chatText +  ' ' + lightArray[i].number + ' ' + lightArray[i].name + 's,';
										}
									}
									
								}
								
							}
						} // Item loop end
						
						// Make it so that NPCs that have items that emit light can be seen
							
						// Make it so that players that have items that emit light can be seen

						// exit data start
						chatText = chatText + "\n\nExits: ???"; // Add obvious exits (It's dark so none can be found)
					}
					socket.emit('chat message', chatText); // Give player room description
				}
				return; // give the results
			}
			
			async function Open(socket, serverData, data) // Opens Door/Room Object/Inventory Object
			{
				var itemPass = "";
				var ItemPass2 = "";
				var ItemPass3 = "";
				var roomData = "";
				
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.locked < 1) // if object isn't locked
					{
						if (roomData.exits[itemPass].door.open == 0) // if object is closed
						{
							roomData.exits[itemPass].door.open = 1; // open the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You open the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' opened the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
						}
						else if (roomData.exits[itemPass].door.open == 1)// if object is already open
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already open.' ); // Tell user the item is closed
						}
						else // if object cannot be opened/closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be opened.' ); // Tell user the item can't be closed
						}
					}
					else // if the object is locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is locked and cannot be opened.' ); // Tell user the object is locked
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If Player object exists
				{
					if (serverData.userData[socket.id].inventory[itemPass2].locked < 1) // if object isn't locked
					{
						if (serverData.userData[socket.id].inventory[itemPass2].open == 0) // if object is closed
						{
							serverData.userData[socket.id].inventory[itemPass2].open = 1; // open the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
							socket.emit('chat message', 'You open the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' opened the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
						}
						else if (serverData.userData[socket.id].inventory[itemPass2].open == 1)// if object is already open
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already open.' ); // Tell user the item is closed
						}
						else // if object cannot be opened/closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be opened.' ); // Tell user the item can't be closed
						}
					}
					else // if the object is locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is locked and cannot be opened.' ); // Tell user the object is locked
					}
				}
				else if (itemPass3 != CONSTANT.NULL) // If room object exists
				{
					if (roomData.objects[itemPass3].locked < 1) // if object isn't locked
					{
						if (roomData.objects[itemPass3].open == 0) // if object is closed
						{
							roomData.objects[itemPass3].open = 1; // open the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You open the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they closed the door
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' opened the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player closed
						}
						else if (roomData.objects[itemPass3].open == 1)// if object is already open
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already open.' ); // Tell user the item is closed
						}
						else // if object cannot be opened/closed
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be opened.' ); // Tell user the item can't be closed
						}
					}
					else // if the object is locked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is locked and cannot be opened.' ); // Tell user the object is locked
					}
				}
				else // If the object is nowhere
				{
					socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here to open.' ); // tell user the the item doesn't exist
				}
			}
			
			async function Read(socket, serverData, data) // Gives player any text witten on an object
			{
				var textStart = 'You read the ' + data[CONSTANT.DIR_O] + '. It says:\n'; // begining of the text
				// Edit so that object can have pages any object without any pages is treated like an object with one page
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.read != "") // if text exists
					{
						socket.emit('chat message', textStart + roomData.exits[itemPass].door.read[0]); // Give text
					}
					else // No description exits
					{
						socket.emit('chat message', 'There is nothing written on the ' + data[CONSTANT.DIR_O] + '.') // Tell user the item is indescribable
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If object exists in player inventory
				{
					if (serverData.userData[socket.id].inventory[itemPass2].read != "") // if text exists
					{
						socket.emit('chat message', textStart + serverData.userData[socket.id].inventory[itemPass2].read[0]); // Give text
					}
					else // No description exits
					{
						socket.emit('chat message', 'There is nothing written on the ' + data[CONSTANT.DIR_O] + '.') // Tell user the item is indescribable
					}
				}
				else  // If object exists in room
				{
					if (roomData.objects[itemPass3].read != "") // if text exists
					{
						socket.emit('chat message', textStart + roomData.objects[itemPass3].read[0]); // Give text
					}
					else // No description exits
					{
						socket.emit('chat message', 'There is nothing written on the ' + data[CONSTANT.DIR_O] + '.') // Tell user the item is indescribable
					}
				}
			}
			
			async function Say(socket, serverData, msg) // Give's player's message to room
			{
				var word = ["say "]; // List of possible words
				for (x = 0; x < word.length; x++) // loop through all words
				{
					if (msg.toLowerCase().search(word[x]) != -1) // if word found
					{
						msg = msg.substring(msg.toLowerCase().search(word[x]) + word[x].length, msg.length); // Remove Verb text and all text before verb
						x = word.length // Stop the loop
					}
				}
				socket.emit('chat message', 'You say: ' + msg); // tell player what they said
				socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' says: ' + msg); // tell room what player said
			}
			
			async function Take(socket, serverData, data) // Puts items in Inventory
			{	
				// Update function to be able to take items that are inside objects
				// Add functions to let player know if their inventory is just full of items so you cannot take
				// Make it so that items under and on top of the object drop to the room when you take the object.
			
				var indPro = data[CONSTANT.IND_PRO]; // Add indefinite pronouns to Text Parser
				var quant = data[CONSTANT.QUANT] || 1; // Default to 1 (Add Numbers to text parser)
				var objTrans = ''; // Initialize
				
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				if (quant > CONSTANT.MAX_STACK) // if player tries to deposit more than one stack at a time
				{
					quant = 99; // Set Quantity to Max
				}
				
				if (data[CONSTANT.PREP] == "from") // taking from an object
				{
					// taking from a surface or from inside an object (Don't assume player looks under object)
					if (data[CONSTANT.IND_O] == "") // if there isn't an indirect object
					{
						socket.emit('chat message', 'What are you trying to take from?');
					}
					else if (data[CONSTANT.DIR_O] == "") // If user didn't specify an object
					{
						socket.emit('chat message', 'What are you trying to take?'); // Get step to change and then resume this once player gives name of object
					}
					else
					{
						objPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.IND_O]); // for room objects
						objPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.IND_O]); // For Room Doors
						
						// Make program to check how many slots items are currently taking up *do for drop and ground too*
						// Figure out solution for when object is in room and is in doors (Right now object in room is priority due to doors always being anchored for now)
						if (objPass != CONSTANT.NULL) // Object is found
						{
							itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].items, data[CONSTANT.DIR_O]); // for inside object
							itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].surfaceItems, data[CONSTANT.DIR_O]); // for on top of object
							
							// If itempass 1 & 2 are yes then need to check second loaction if taking all
							if (itemPass != CONSTANT.NULL || itemPass2 != CONSTANT.NULL) //if item is found in/on object
							{
								if (indPro	== 'all')
								{	
									var itemCount = 0; // Keeps track of moved items
									
									async function Take_All_Surface()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].surfaceItems, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].surfaceItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.objects[objPass].surfaceItems[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All_Surface(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									async function Take_All_Inside()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].items, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.objects[objPass].items[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All_Inside(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									await Take_All_Surface(); // Start the madness
									await Take_All_Inside(); // Madness x2
									
									if (itemCount == 0) // aren't taking any item
									{
										if (objTrans.subOutcome.result > 0) // If removable item exists
										{
											socket.emit('chat message', 'You cannot carry any more items.' ); // tell user inventory is full
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.'); // tell player we did not find the item
										}
									}
									else if(itemCount == 1) // if only taking 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									else // if taking more than 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									
								}
								else // If we have a quantity of items
								{	
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].surfaceItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Transfer Ho!
									
									if (objTrans.addOutcome.result > 0)
									{
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										if(objTrans.addOutcome.number == 1) // if only taking 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
										else if(objTrans.addOutcome.number < quant) // if less items were taken than desired
										{
											objTrans2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant - objTrans.addOutcome.number, serverData.userData[socket.id].itemLimit); // Check Inside the object
										
											if (objTrans2.addOutcome.result > 0) // A positive result means you took more than one item
											{
												await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
												await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
												
												totalQuant = objTrans.addOutcome.number + objTrans2.addOutcome.number
												
												socket.emit('chat message', 'You took ' + totalQuant + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + totalQuant + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
											else
											{
												socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
										}
										else // if taking more than 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
									}
									else if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'Your inventory is too full.'); // Tell them they have too much
									}
									else // If no items were able to be removed
									{
										objTrans2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Check Inside the object
										
										if (objTrans2.addOutcome.result > 0)
										{
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans2.addOutcome.number == 1) // if only taking 1 item
											{
												socket.emit('chat message', 'You took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
											else // if taking more than 1 item
											{
												socket.emit('chat message', 'You took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.');
										}
									}
									
								}
							}
							else
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.');
							}
						}
						else if (objPass2 != CONSTANT.NULL) // if object is a door
						{
							itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.items, data[CONSTANT.DIR_O]); // for inside object
							itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.surfaceItems, data[CONSTANT.DIR_O]); // for on top of object
							
							// If itempass 1 & 2 are yes then need to check second loaction if taking all
							if (itemPass != CONSTANT.NULL || itemPass2 != CONSTANT.NULL) //if item is found in/on object
							{
								if (indPro	== 'all')
								{	
									var itemCount = 0; // Keeps track of moved items
									
									async function Take_All_Surface()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.surfaceItems, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.surfaceItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.exits[objPass2].door.surfaceItems[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All_Surface(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									async function Take_All_Inside()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.items, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.exits[objPass2].door.items[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All_Inside(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									await Take_All_Surface(); // Start the madness
									await Take_All_Inside(); // Madness x2
									
									if (itemCount == 0) // aren't taking any item
									{
										if (objTrans.subOutcome.result > 0) // If removable item exists
										{
											socket.emit('chat message', 'You cannot carry any more items.' ); // tell user inventory is full
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.'); // tell player we did not find the item
										}
									}
									else if(itemCount == 1) // if only taking 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									else // if taking more than 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									
								}
								else // If we have a quantity of items
								{	
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.surfaceItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Transfer Ho!
									
									if (objTrans.addOutcome.result > 0)
									{
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										if(objTrans.addOutcome.number == 1) // if only taking 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
										else if(objTrans.addOutcome.number < quant) // if less items were taken than desired
										{
											objTrans2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant - objTrans.addOutcome.number, serverData.userData[socket.id].itemLimit); // Check Inside the object
										
											if (objTrans2.addOutcome.result > 0) // A positive result means you took more than one item
											{
												await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
												await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
												
												totalQuant = objTrans.addOutcome.number + objTrans2.addOutcome.number
												
												socket.emit('chat message', 'You took ' + totalQuant + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + totalQuant + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
											else
											{
												socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
										}
										else // if taking more than 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
									}
									else if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'Your inventory is too full.'); // Tell them they have too much
									}
									else // If no items were able to be removed
									{
										objTrans2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.items, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Check Inside the object
										
										if (objTrans2.addOutcome.result > 0)
										{
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans2.addOutcome.number == 1) // if only taking 1 item
											{
												socket.emit('chat message', 'You took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
											else // if taking more than 1 item
											{
												socket.emit('chat message', 'You took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
												socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans2.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
											}
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.');
										}
									}
									
								}
							}
							else
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's.');
							}
						}
						else // If the object is not in room
						{
							socket.emit('chat message', 'There is no ' + data[CONSTANT.IND_O] + ' here.' ); // Tell user the item isn't in the room
						}
					}
				}
				else if (data[CONSTANT.PREP] == "from below" || data[CONSTANT.PREP] == "below") // taking from under an object
				{
					// taking from a surface or from inside an object (Don't assume player looks under object)
					if (data[CONSTANT.IND_O] == "") // if there isn't an indirect object
					{
						socket.emit('chat message', 'What are you trying to take from?');
					}
					else if (data[CONSTANT.DIR_O] == "") // If user didn't specify an object
					{
						socket.emit('chat message', 'What are you trying to take?'); // Get step to change and then resume this once player gives name of object
					}
					else
					{
						objPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.IND_O]); // for room objects
						objPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.IND_O]); // For Room Doors
						
						// Make program to check how many slots items are currently taking up *do for drop and ground too*
						// Figure out solution for when object is in room and is in doors (Right now object in room is priority due to doors always being anchored for now)
						if (objPass != CONSTANT.NULL) // Object is found
						{
							itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].underItems, data[CONSTANT.DIR_O]); // for under object
							
							// Make program to check how many slots items are currently taking up *do for drop and ground too*
							// Figure out solution for when object is in room and is in doors (Right now object in room is priority due to doors always being anchored for now)
							if (itemPass != CONSTANT.NULL)
							{
								if (indPro	== 'all')
								{	
									var itemCount = 0; // Keeps track of moved items
									
									async function Take_All ()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects[objPass].underItems, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item (Prevents objTrans from being undefined)
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].underItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.objects[objPass].underItems[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									await Take_All(); // Start the madness
									
									if (itemCount == 0) // aren't taking any item
									{
										if (objTrans.subOutcome.result > 0) // If removable item exists
										{
											socket.emit('chat message', 'You cannot carry any more items.' ); // tell user inventory is full
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.'); // tell player we did not find the item
										}
									}
									else if(itemCount == 1) // if only taking 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									else // if taking more than 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									
								}
								else // If we have a quantity of items
								{	
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects[objPass].underItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Transfer Ho!
									
									if (objTrans.addOutcome.result > 0)
									{
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										if(objTrans.addOutcome.number == 1) // if only taking 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
										else // if taking more than 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
									}
									else if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'Your inventory is too full.'); // Tell them they have too much
									}
									else // If no items were able to be removed
									{
										socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.'); // tell user the the item doesn't exist
									}		
								}
							}
							else 
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.');
							}
						}
						else if (objPass2 != CONSTANT.NULL) // if object is a door
						{
							itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.underItems, data[CONSTANT.DIR_O]); // for under object
							
							// Make program to check how many slots items are currently taking up *do for drop and ground too*
							// Figure out solution for when object is in room and is in doors (Right now object in room is priority due to doors always being anchored for now)
							if (itemPass != CONSTANT.NULL)
							{
								if (indPro	== 'all')
								{	
									var itemCount = 0; // Keeps track of moved items
									
									async function Take_All ()
									{
										var roomData = ""; // Reload the room data to account for what was taken
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
										{
											roomData = next;
										});
										
										itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.exits[objPass2].door.underItems, data[CONSTANT.DIR_O]);
										
										if (!(itemPass == CONSTANT.NULL)) // if we found the item (Prevents objTrans from being undefined)
										{
											objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.underItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.exits[objPass2].door.underItems[itemPass].quant, serverData.userData[socket.id].itemLimit);
											
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
											await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
											
											if(objTrans.addOutcome.result > 0) // if success
											{
												itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
												await Take_All(); // Restart the loop
											}
											else // if failure
											{
												return; // exit the loop
											}
										}
										else // if we did not find the item
										{
											return;  // exit the loop
										}
									}
									
									await Take_All(); // Start the madness
									
									if (itemCount == 0) // aren't taking any item
									{
										if (objTrans.subOutcome.result > 0) // If removable item exists
										{
											socket.emit('chat message', 'You cannot carry any more items.' ); // tell user inventory is full
										}
										else
										{
											socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.'); // tell player we did not find the item
										}
									}
									else if(itemCount == 1) // if only taking 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									else // if taking more than 1 item
									{
										socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
									}
									
								}
								else // If we have a quantity of items
								{	
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.exits[objPass2].door.underItems, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Transfer Ho!
									
									if (objTrans.addOutcome.result > 0)
									{
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
										await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
										if(objTrans.addOutcome.number == 1) // if only taking 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + ' from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
										else // if taking more than 1 item
										{
											socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell player what they took
											socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's from under the ' + data[CONSTANT.IND_O] + '.'); // tell room what player took
										}
									}
									else if (objTrans.subOutcome.result > 0) // If removable item exists
									{
										socket.emit('chat message', 'Your inventory is too full.'); // Tell them they have too much
									}
									else // If no items were able to be removed
									{
										socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.'); // tell user the the item doesn't exist
									}				
								}
							}
							else 
							{
								socket.emit('chat message', 'The ' + data[CONSTANT.IND_O] + ' does not have any ' + data[CONSTANT.DIR_O] + 's under it.');
							}
						}
						else // If the object is not in room
						{
							socket.emit('chat message', 'There is no ' + data[CONSTANT.IND_O] + ' here.' ); // Tell user the item isn't in the room
						}
					}
				}
				else // Regular take function (Taking from room)
				{
					itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
					itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
					
					// Make program to check how many slots items are currently taking up *do for drop and ground too*
					// Figure out solution for when object is in room and is in doors (Right now object in room is priority due to doors always being anchored for now)
					if (itemPass != CONSTANT.NULL)
					{
						if (roomData.objects[itemPass].anchored == 1) // if item is anchored
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' won\'t budge from the spot.' ); // Tell user the item isn't in the room
						}
						else if (data[CONSTANT.DIR_O] == "") // If user didn't specify an object (Make this a first check)
						{
							socket.emit('chat message', 'What did you want to take?'); // Get step to change and then resume this once player gives name of object
						}
						else if (indPro	== 'all')
						{	
							var itemCount = 0; // Keeps track of moved items
							
							async function Take_All ()
							{
								var roomData = ""; // Reload the room data to account for what was taken
								await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
								{
									roomData = next;
								});
								
								itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]);
								
								if (!(itemPass == CONSTANT.NULL)) // if we found the item
								{
									objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], roomData.objects[itemPass].quant, serverData.userData[socket.id].itemLimit);
									
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									
									if(objTrans.addOutcome.result > 0) // if success
									{
										itemCount = itemCount + objTrans.addOutcome.number; // add results to the count
										await Take_All(); // Restart the loop
									}
									else // if failure
									{
										return; // exit the loop
									}
								}
								else // if we did not find the item
								{
									return;  // exit the loop
								}
							}
							
							await Take_All(); // Start the madness
							
							if (itemCount == 0) // aren't taking any item
							{
								if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'You cannot carry any more items.' ); // tell user inventory is full
								}
								else
								{
									socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' ); // tell player we did not find the item
								}
							}
							else if(itemCount == 1) // if only taking 1 item
							{
								socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O]); // tell player what they took
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O]); // tell room what player took
							}
							else // if taking more than 1 item
							{
								socket.emit('chat message', 'You took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they took
								socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + itemCount + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell room what player took
							}
							
						}
						else // If we have a quantity of items
						{	
							if(roomData.objects.length == 0) // if room has no items (Make this a top check)(What about doors?)
							{
								socket.emit('chat message', 'There are no items to take'); // tell player no items to take
							}
							else // there are items to take!!!!
							{
								objTrans = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_O_TRANS, roomData.objects, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O], quant, serverData.userData[socket.id].itemLimit); // Transfer Ho!
								
								if (objTrans.addOutcome.result > 0)
								{
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
									await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
									if(objTrans.addOutcome.number == 1) // if only taking 1 item
									{
										socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + '.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + '.'); // tell room what player took
									}
									else // if taking more than 1 item
									{
										socket.emit('chat message', 'You took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell player what they took
										socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' took ' + objTrans.addOutcome.number + ' '  + data[CONSTANT.DIR_O] + 's.'); // tell room what player took
									}
								}
								else if (objTrans.subOutcome.result > 0) // If removable item exists
								{
									socket.emit('chat message', 'Your inventory is too full.'); // Tell them they have too much
								}
								else // If no items were able to be removed
								{
									socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' ); // tell user the the item doesn't exist
								}
							}
						}
					}
					else if (itemPass2 != CONSTANT.NULL) // if object is a door
					{
						if (roomData.exits[itemPass2].door.anchored == 1) // if item is anchored (Doors are always anchored for now)
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' won\'t budge from the spot.' ); // Tell user the item isn't in the room
						}
						// if door isn't anchored nothing happens right now
					}
					else // If the object is not in room
					{
						socket.emit('chat message', 'There is no ' + data[CONSTANT.DIR_O] + ' here.' ); // Tell user the item isn't in the room
					}
				}
			}
			
			async function Travel(socket, serverData, data) // Moves the Player to a different room if able
			{
				var exitNo = "";
				var exitName = "";
				
				if (!data[CONSTANT.PREP] == "")
				{
					var roomData = "" // Initialize
					await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load Room Data
					{
						roomData = next;
					});
						
					for (x = 0; x < roomData.exits.length; x++) // loop through all exits
					{
						if(roomData.exits[x].name == data[CONSTANT.PREP]) // if exit is found
						{
							if (!roomData.exits[x].exit == "") // If exit isn't empty
							{
								exitName = roomData.exits[x].exit; // Save the Exit name
								exitNo = x; // Store exit location
							}
							x = roomData.exits.length // End the loop
						}
					}
					
					if (!exitName == "") // If exit exists
					{
						if (roomData.exits[exitNo].door == "" || roomData.exits[exitNo].door.open == 1) // If door is not in your way
						{
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name +' leaves ' + roomData.exits[exitNo].name + '.'); // tell room player left (Fix for Up/Down/Special)
							socket.leave(serverData.userData[socket.id].room); // leave old room
							socket.leave(serverData.userData[socket.id].area); // leave old area
							socket.join(roomData.exits[exitNo].exit); // join new room
							socket.emit('chat message', CONSTANT.MSG[11] + ' ' + roomData.exits[exitNo].name + '.'); // tell player that they left 
							
							for (x = 0; x < roomData.players.length; x++) // loop through players in old room
							{
								if(roomData.players[x].name == serverData.userData[socket.id].name) // if we find your username
								{
									roomData.players.splice(x,1); // remove player from room
									x = x-1; // push the loop back to compensate for splice
								}
							}
							
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the Room
							
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, roomData.exits[exitNo].exit).then(next => // Load New Room Data
							{
								roomData = next;
							});
							
							serverData.userData[socket.id].room = roomData.room; // add new room to player data
							serverData.userData[socket.id].area = roomData.area; // add new area to player data
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // saves player data
							socket.join(serverData.userData[socket.id].area); // join new area
							
							var temp =
							{
								id: socket.id,
								name: serverData.userData[socket.id].name
							}
							roomData.players.splice(0,0, temp); // shove the user into the room
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Saves the New Room // saves Room data

							for (x = 0; x < roomData.exits.length; x++) // loop through all exits
							{
								if(roomData.exits[x].name == exitName) // if exit is found
								{
									if (!roomData.exits[x].exit == "") // If exit isn't empty
									{
										exitNo = x; // Store exit location
									}
									x = roomData.exits.length // End the loop
								}
							}
							
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name +' enters from the ' + roomData.exits[exitNo].name + '.'); // tell room player is entering (Need to fix for Up/Down/Special Exits)

							//ee.emit(serverData.userData[socket.id].room, serverData.userData[socket.id].name); // send username to room entering events
							var cmdData = await Basic_Mud(CONSTANT.FUNC_T_PARSE, socket, serverData, "look"); // Puts Text into the Text Parser
							Basic_Mud(CONSTANT.FUNC_T_INTERPRET, socket, serverData, cmdData, "look"); // Call look command	
						}
						else // If door is in your way
						{
							socket.emit('chat message', "There is a closed door in your way."); // tell player door blocks them
						}
					}
					else // If exit  does not exist
					{
						socket.emit('chat message', "You cannot travel " + data[CONSTANT.PREP] + ".");
					}
				}
				else // User has not selected a direction
				{
					socket.emit('chat message', "Where are you trying to go?"); // Tell user direction is missing
					// Fix this so that game knows to wait for a direction and player can just type a direction like west and coninue on
				}
			}
			
			async function Unlock(socket, serverData, data) // Unlocks Door/Room Object/Inventory Object
			{
				var itemPass = "";
				var ItemPass2 = "";
				var ItemPass3 = "";
				var keyPass = "";
				var keyData = "";
				var roomData = "";
				
				// Make it so that you can use items off room floor?
				keyPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.IND_O]); // Find Key in Player Inventory
				
				if (keyPass != CONSTANT.NULL)
				{
					keyData = serverData.userData[socket.id].inventory[keyPass].id; // set the key Data
				}
		
				
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load room data
				{
					roomData = next;
				});
				
				// Code a system when object is in multiple places like Room, Inventory, Door
				itemPass = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_D_MATCH, roomData.exits, data[CONSTANT.DIR_O]); // For Room Doors
				itemPass2 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, serverData.userData[socket.id].inventory, data[CONSTANT.DIR_O]); // for Player Inventory
				itemPass3 = await Basic_Mud(CONSTANT.FUNC_ADMIN, CONSTANT.AD_N_MATCH, roomData.objects, data[CONSTANT.DIR_O]); // for room objects
				
				if (itemPass != CONSTANT.NULL) // If door exists
				{
					if (roomData.exits[itemPass].door.locked == 1) // if object is locked
					{
						if (keyData == roomData.exits[itemPass].door.lock || roomData.exits[itemPass].door.lock == "") // If player has key or lock doesn't require key(A lock without a key is pretty pointless though unless we make only one side of the door have a lock with ID that has no matching key and the other side a lock with no key ID)
						{
							roomData.exits[itemPass].door.locked = 0; // unlock the door
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You unlocked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they unlocked the door
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' unlocked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player unlocked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to unlock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (roomData.exits[itemPass].door.locked == 0)// if object is already unocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already unlocked.' ); // Tell user the item is Unlocked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be unlocked.' ); // Tell user the item can't be Unlocked
					}
				}
				else if (itemPass2 != CONSTANT.NULL) // If Player object exists
				{
					if (serverData.userData[socket.id].inventory[itemPass2].locked == 1) // if object is locked
					{
						if (keyData == serverData.userData[socket.id].inventory[itemPass2].lock || serverData.userData[socket.id].inventory[itemPass2].lock == "") // If player has key or lock doesn't require key (Pretty Pointless for an object not to need a key)
						{
							serverData.userData[socket.id].inventory[itemPass2].locked = 0; // unlock the object
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
							socket.emit('chat message', 'You unlocked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they unlocked the object
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' unlocked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player unlocked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to unlock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (serverData.userData[socket.id].inventory[itemPass2].locked == 0)// if object is already Unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already unlocked.' ); // Tell user the Object is Unlocked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be unlocked.' ); // Tell user the Object can't be Unlocked
					}		
				}
				else if (itemPass3 != CONSTANT.NULL) // If room object exists
				{
					if (roomData.objects[itemPass3].locked == 1) // if object is locked
					{
						if (keyData == roomData.objects[itemPass3].lock || roomData.objects[itemPass3].lock == "") // If player has key or lock doesn't require key(A lock without a key is pretty pointless though unless we make only one side of the door have a lock with ID that has no matching key and the other side a lock with no key ID)
						{
							roomData.objects[itemPass3].locked = 0; // unlock the object
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.ROOM, roomData.room, roomData); // Save the room data
							socket.emit('chat message', 'You unlocked the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they unlocked the Object
							socket.broadcast.to(serverData.userData[socket.id].room).emit('chat message', serverData.userData[socket.id].name + ' unlocked the '  + data[CONSTANT.DIR_O]) + '.'; // tell room what player unlocked
						}
						else if (keyData == "") // If player doesn't have key
						{
							socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' requires a key to lock it.' ); // Tell user they need a key
						}
						else // If player doesn't have the right key
						{
							socket.emit('chat message', 'This key doesn\'t fit the ' + data[CONSTANT.DIR_O] + '.' ); // Tell user they need a key
						}
					}
					else if (roomData.objects[itemPass3].locked == 0)// if object is already Unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' is already unlocked.' ); // Tell user the Object is Unlocked
					}
					else // if object cannot be locked/unlocked
					{
						socket.emit('chat message', 'The ' + data[CONSTANT.DIR_O] + ' cannot be unlocked.' ); // Tell user the Object can't be Unlocked
					}
				}
			}
			
			async function Whisper(socket, serverData, msg) // Give's player's message to single player
			{
				var playerId = "";
				var playerPass = CONSTANT.NULL;
				var word = ["wh ", "whisper "]; // List of possible words		
				var roomData = "";
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next => // Load Room Data
				{
					roomData = next;
				});
				
				for (x = 0; x < roomData.players.length; x++) // loop through all words
				{
					if (msg.toLowerCase().search(roomData.players[x].name.toLowerCase() + " ") != -1) // if player found
					{
						playerId = roomData.players[x].id; // store user's Socket ID
						playerPass = x; // pass on the index number
						x = word.length; // Stop the loop
					}
				}
				
				for (x = 0; x < word.length; x++) // loop through all words
				{
					if (msg.toLowerCase().search(word[x]) != -1) // if word found
					{
						msg = msg.substring(msg.toLowerCase().search(word[x]) + word[x].length, msg.length); // Remove Verb text and all text before verb
						x = word.length // Stop the loop
					}
				}
				
				if (playerPass != CONSTANT.NULL) // If a user has been found
				{
					msg = msg.substring(msg.toLowerCase().search(roomData.players[playerPass].name.toLowerCase() + " ") + roomData.players[playerPass].name.length + 1, msg.length); // Remove Username text and all text before Username
					
					if (serverData.userData[socket.id].name == roomData.players[playerPass].name) // if you picked your own username
					{
						if (msg.replace(" ", "") == "") // if there is no text
						{
							socket.emit('chat message', 'You whisper softly to yourself.' + msg); // tell player what they said
						}
						else
						{
							socket.emit('chat message', 'You whisper to yourself: ' + msg); // tell player what they said
						}
					}
					else
					{
						if (msg.replace(" ", "") == "")  // if there is no text
						{
							socket.emit('chat message', 'You whisper softly to ' + roomData.players[playerPass].name + '.'); // tell player what they said
							socket.broadcast.to(playerId).emit('chat message', serverData.userData[socket.id].name + ' whispers softly to you.'); // tell room what player said
						}
						else
						{
							socket.emit('chat message', 'You whisper to ' + roomData.players[playerPass].name + ': ' + msg); // tell player what they said
							socket.broadcast.to(playerId).emit('chat message', serverData.userData[socket.id].name + ' whispers: ' + msg); // tell room what player said
						}
					}
				}
				else // If a user hasn't been found
				{
					socket.emit('chat message', 'Who are you trying to whisper to?'); // Tell player the user isn't here
				}
				
			}
			
			async function Yell(socket, serverData, msg) // Give's player's message to entire area
			{
				var word = ["y ", "yell "]; // List of possible words
				for (x = 0; x < word.length; x++) // loop through all words
				{
					if (msg.toLowerCase().search(word[x]) != -1) // if word found
					{
						msg = msg.substring(msg.toLowerCase().search(word[x]) + word[x].length, msg.length); // Remove Verb text and all text before verb
						x = word.length // Stop the loop
					}
				}
				socket.emit('chat message', 'You yell: ' + msg); // tell player what they said
				socket.broadcast.to(serverData.userData[socket.id].area).emit('chat message', serverData.userData[socket.id].name + ' yells: ' + msg); // tell room what player said
			}
			switch (command) // The Command process
			{
				case CONSTANT.CMD_CLEAR:
					result = await Clear(socket);
					break;
				case CONSTANT.CMD_CLOSE:
					result = await Close(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_DROP:
					result = await Drop(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_EXAMINE:
					result = await Examine(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_GO:
					result = await Travel(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_INV:
					result = await Inventory(socket, serverData);
					break;
				case CONSTANT.CMD_LIGHT:
					result = await Light(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_LOCK:
					result = await Lock(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_LOOK:
					result = await Look(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_OPEN:
					result = await Open(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_READ:
					result = await Read(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_SAY:
					result = await Say(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_TAKE:
					result = await Take(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_UNLOCK:
					result = await Unlock(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_WHISPER:
					result = await Whisper(socket, serverData, userInput);
					break;
				case CONSTANT.CMD_YELL:
					result = await Yell(socket, serverData, userInput);
					break;
				default:
					return result; // returns blank result
			}
			
			return result;
		}
		
		async function Factory (type, dat1, dat2) // Contructs Variables
		{
			function Fac_User_Data (name, pass) // Make New User Data
			{
				this.name = name; // username
				this.password = pass; // Password
				this.online = 1;    // are they online?
				this.banned = 0;    // banned status (0 - not banned, 1 - banned)
				this.state = 0;       // player's current state (Reading/Talking/Sleeping/Normal) (Create server variable later to replace)
				this.area = "Training Grounds";  // Area data
				this.room = "Training Grounds 1"; // Room data
				this.gold = [0,0,0]; // money (Copper, Silver, Gold)
				this.target = ""; // Target of player's focus (Create server variable?)
				this.ready = 0;   // is player done selecting action? (0 - no, 1- yes) *For battles and locking keyboard for events* (Create server variable?)
				this.bag = 0;       // current bag quality
				this.itemLimit = 20; // max items a player can carry (Stacks)
				this.inventory = []; // player's inventory of items
				this.bank = [];  // player's banked items
				this.flags = []; // Event flags
			}
			
			switch (type) // The Login / Account creation process
			{
				case CONSTANT.FAC_USER_DATA:
					result = await new Fac_User_Data (dat1, dat2);
					break;
				default:
					return result; // returns blank result
			}
				
			return result;
		}
		
		async function Game_Data (action, type, target, data) // Loads and Saves Data
		{
			async function Load(type,target) // Loads Game Data
			{
				try
				{
					if(fs.existsSync('Server\\Data\\' + type + '\\' + target + '.json'))
					{
						result = await fsp.readFile('Server\\Data\\' + type + '\\' + target + '.json'); // async code
						result = JSON.parse(result); // convert from Json
					}
					else
					{
						result = "Not Found";
					}

					return result; // Give the Results
				}
				catch(error)
				{
					console.log("there was an error");
				}
				
				return await result.next();
			}

			async function Save(type, target, data) // Saves Game Data
			{
			
				fs.writeFileSync('Server\\Data\\' + type + '\\' + target + '.json', JSON.stringify(data, undefined, "\t"), function (err) { // Write the playerData to JSON file
					if (err) return console.log(err); // Tell the server about the errors lassie!
				});
				
				return result; // Return Blank maybe add some extra error handling in the future
			}
			
			switch (action) // Picks the function to use
			{
			case CONSTANT.SAVE:
			    await Save(type, target, data); // Save Function 
				break;
			case CONSTANT.LOAD:
			    result = await Load(type, target); // Load Function 
				break;
			default:
				return result; // returns blank result
			}
			
			return result; // Returns results
		}
		
		async function Log_In (socket, msg, serverData, userInput, userDir) // Logs the user in
		{
			switch (serverData.step[socket.id]) // The Login / Account creation process
			{
				case 0:
					socket.emit('chat message', CONSTANT.MSG[0]); // Send initial message when user firsts visits page
					serverData.step[socket.id]++
					break;
				case 1:
					if(!fs.existsSync(userDir + userInput.toLowerCase() + '.json')) // If user doesn't exist
					{
						var found = /[^a-zA-Z0-9+_+-]/.test(userInput); // make sure illegal symbols aren't present

						if (found == true)
						{
							socket.emit('chat message', "Your username contains a banned special character. Please choose another username.");
						}
						else if(userInput.length > CONSTANT.MAX_USERNAME) // if username is too big
						{
							socket.emit('chat message', "Your username cannot be more than 20 characters. Please choose another username.");
						}
						else if(userInput.length < CONSTANT.MIN_USERNAME) // if username is too small
						{
							socket.emit('chat message', "Your username cannot be less than 3 characters. Please choose another username.");
						}
						else // username is good to go
						{
							socket.emit('usernameSet', userInput); // Give the client their username
							serverData.step[socket.id]++; // bump the client up to step 2
							socket.emit('chat message', userInput + CONSTANT.MSG[3]); // give newbie message
						}
					}
					else // If user does exist
					{
						socket.emit('usernameSet',  userInput);  // Give the client their username
						serverData.step[socket.id] = 3; // bump the client up to step 3
						socket.emit('chat message', CONSTANT.MSG[1] +   userInput + CONSTANT.MSG[2]); // give welcome back message
					}
					break;
				case 2:
					socket.emit('passSet', userInput); // give client their typed password
					serverData.step[socket.id] = 4; // bump the client up to step 4
					socket.emit('chat message', CONSTANT.MSG[4]); // Ask user to confirm password
					break;
				case 3:
				    // load Player's Data to userData variable
					await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.PLAYER, msg.username.toLowerCase()).then(next =>  // Load the Player Data
					{
						serverData.userData[socket.id] = next;
					});
					if (msg.input == serverData.userData[socket.id].password) // if user inputs the correct password
					{
						if (serverData.userData[socket.id].banned == 1) // if user is currently banned
						{
							socket.emit('chat message', CONSTANT.MSG[8]); // Tell user they have been banned
							serverData.step[socket.id] = 5; // Toss banned user into step 5 (The damned step)
						}
						else if(serverData.userData[socket.id].online == 1) // if player is already online
						{
							socket.emit('chat message', "This account is already online, please choose a different account."); // Tell user they are aleady online
							serverData.step[socket.id] = 1; // Toss em back to step 1
						}
						else // if user is not banned or online
						{	
							/*
							console.log("Test");
							console.log(socketIndex);
		
							var indexPass = kryptoGameEngine(MISC_PROCESS, FIND_LOOP, socketIndex, socket.id, ID_LOOP); // find where in the index the player's socket id is stored
					
							if(!(indexPass == "Not Found"))
							{
								console.log("Test");
								console.log(socketIndex); 
								socketIndex[indexPass].username = serverData.userData[socket.id].name; // input username for socket ID
								console.log("Test");
								console.log(socketIndex); 
							}
							else
							{
								console.log("Socket index username insertion error"); // report error to console
							}
							*/
							
							socket.emit('usernameSet', serverData.userData[socket.id].username);
							socket.emit('passSet', msg.input); // set password to client
							socket.emit('chat message', CONSTANT.MSG[6]); // thank player and tell them to enjoy the game
							serverData.gameMode[socket.id] = 1; // Put user into gameMode 1 (Only current real game mode, just placed there for future use)
							serverData.step[socket.id] = 0; // reset step count
							socket.join(serverData.userData[socket.id].room); // put user in last saved room
							socket.join(serverData.userData[socket.id].area); // put user in last saved area (shout purposes)
							socket.join(serverData.userData[socket.id].name); // put user in own room as well (whispering)
							
							serverData.userData[socket.id].online = 1; // set player as online
							await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // Save the player data
							
							var cmdData = await Basic_Mud(CONSTANT.FUNC_T_PARSE, socket, serverData, "look"); // Puts Text into the Text Parser
							Basic_Mud(CONSTANT.FUNC_T_INTERPRET, socket, serverData, cmdData, "look"); // Call look command
						}
					}
					else // if user fails to input password
					{
						socket.emit('chat message', CONSTANT.MSG[7]); // prompt user for new username
						serverData.step[socket.id] = 1; // Toss em back to step 1 for their foolishness
					}
					break;
				case 4:
				    if (msg.password == msg.input) // If correct make new user
					{
						await Basic_Mud(CONSTANT.FUNC_FACTORY, CONSTANT.FAC_USER_DATA, msg.username, msg.password).then(next => // Set the New User Data
						{
							serverData.userData[socket.id] = next; 
						});
						Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, serverData.userData[socket.id].name.toLowerCase(), serverData.userData[socket.id]); // save new player data
						/*
						// add new player to the index
						indexData = kryptoGameEngine(DATA_PROCESS, USER_INDEX, LOAD, "users"); // load index
						console.log("indexData");
						console.log(indexData);
						indexData.dir.splice(0,0,newPlayer.username); // add the new player's username to the index
						console.log("indexData");
						console.log(indexData);
						kryptoGameEngine(DATA_PROCESS, USER_INDEX, SAVE, indexData); // save index
						
						var indexPass = kryptoGameEngine(MISC_PROCESS, FIND_LOOP, socketIndex, socket.id, ID_LOOP); // find where in the index the player's socket id is stored
					
						if(!(indexPass == "Not Found"))
						{
							console.log("Test");
							console.log(socketIndex); 
							socketIndex[indexPass].username = newPlayer.username; // input username for socket ID
							console.log("Test");
							console.log(socketIndex); 
						}
						else
						{
							console.log("Socket index username insertion error"); // report error to console
						}
						*/
						
						socket.emit('chat message', CONSTANT.MSG[6]); // thank player and tell them to enjoy the game
						socket.join(serverData.userData[socket.id].room); // Place new user in first room
						socket.join(serverData.userData[socket.id].area); // place new user in first area
						socket.join(serverData.userData[socket.id].name); // add user to own room as well (Whispers,trade,personal notifications)
						serverData.gameMode[socket.id] = 1; // set client's game mode to 1
						serverData.step[socket.id] = 0; // reset step count

						socket.emit('chat message', 'Type in \"read sign\" for help.');
						
						var cmdData = await Basic_Mud(CONSTANT.FUNC_T_PARSE, socket, serverData, "look"); // Puts Text into the Text Parser
						Basic_Mud(CONSTANT.FUNC_T_INTERPRET, socket, serverData, cmdData, "look"); // Call look command
					}
					else // if incorrect prompt user to reenter a password
					{
						socket.emit('chat message', CONSTANT.MSG[5]); // tell user passwords don't match
						steps[socket.id] = 2; // put user back to step 2
					}
					break;
				default:
					socket.emit('chat message', CONSTANT.MSG[8]); // Repeat that the user is banned whenever they send chat request
					
				return; // We're done here
			}
			
			return;
		}
		
		async function Startup () // Sets the sever up
		{
			// User Data
			var indexData =  // initialize
			{
				name: "user", // set name
				dir:[] // initialize directory
			} // initialize
			var count = 0; // initialize

			fs.readdirSync("server\\data\\user\\").forEach(file => 
			{
				if(!(file == "index.json"))
				{
					indexData.dir[count] = file.replace(".json", ""); // set filename to directory
					count++; // increment count
				}
			})

			fs.writeFileSync('server\\data\\User\\index.json', JSON.stringify(indexData, undefined, "\t"), function (err) { // Create new index for users
				if (err) return console.log(err); // Tell the server about the errors lassie!
			});
			console.log("User Index Updated"); // tell server index has been updated
			
			// Room Data
			indexData =  // New Data
			{
				name: "room", // set name
				dir:[] // initialize directory
			} // initialize
			count = 0; // reinitialize

			fs.readdirSync("server\\data\\Room\\").forEach(file => 
			{
				if(!(file == "index.json"))
				{
					indexData.dir[count] = file.replace(".json", ""); // set filename to directory
					count++; // increment count
				}
			})

			fs.writeFileSync('server\\data\\room\\index.json', JSON.stringify(indexData, undefined, "\t"), function (err) { // Create new index for users
				if (err) return console.log(err); // Tell the server about the errors lassie!
			});
			
			console.log("Room Index Updated"); // tell server index has been updated
			
			// Item Data
			indexData =  // New Data
			{
				name: "item", // set name
				dir:[] // initialize directory
			} // initialize
			count = 0; // reinitialize

			fs.readdirSync("server\\data\\Item\\").forEach(file => 
			{
				if(!(file == "index.json"))
				{
					indexData.dir[count] = file.replace(".json", ""); // set filename to directory
					count++; // increment count
				}
			})

			fs.writeFileSync('server\\data\\Item\\index.json', JSON.stringify(indexData, undefined, "\t"), function (err) { // Create new index for users
				if (err) return console.log(err); // Tell the server about the errors lassie!
			});
			
			console.log("Item Index Updated"); // tell server index has been updated
			
			// Object Data
			indexData =  // New Data
			{
				name: "object", // set name
				dir:[] // initialize directory
			} // initialize
			count = 0; // reinitialize

			fs.readdirSync("server\\data\\Object\\").forEach(file => 
			{
				if(!(file == "index.json"))
				{
					indexData.dir[count] = file.replace(".json", ""); // set filename to directory
					count++; // increment count
				}
			})

			fs.writeFileSync('server\\data\\Object\\index.json', JSON.stringify(indexData, undefined, "\t"), function (err) { // Create new index for users
				if (err) return console.log(err); // Tell the server about the errors lassie!
			});
			
			console.log("Object Index Updated"); // tell server index has been updated

			// Make sure all players are offline before server startup
			await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.PLAYER, CONSTANT.INDEX).then(next => // load user index
			{
				indexData = next; // set index data
			});

			for (x = 0; x < indexData.dir.length; x++) // Loop through all players and set that they are offline
			{
				var userData = "" // Initialize
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.PLAYER, indexData.dir[x]).then(next => // load user data
				{
					userData = next; // set user data
				}); 

				userData.online = 0; // make the player offline
				await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.SAVE, CONSTANT.PLAYER, indexData.dir[x], userData) // save player data
			}
			console.log("All Users Set to Offline"); // Tell server offline status has been set
			
			// Add Room Index
			// Add Removal of all players from existing rooms
			// Add Refresh of every room
			// Make option toggles in Constants "The Control Panel"

			console.log("Server Startup Finished"); // Tell server Startup is done
		}
		
		async function Text_Interpreter (socket, serverData, data, userInput) // Inteprets Parsed Text
		{
			// Needs to me modified for each different Command Set used
			// 0 = Verb
			// 1 = preposition
			// 2 = Direct Object
			// 3 = Indirect Object
			// 4 = Quantity
			// 5 = Indefinite Pronoun
			
			// For Object ties
			
			if (!data[CONSTANT.VERB] == "") // If verb exists
			{
				switch (data[CONSTANT.VERB]) // Picks the Command to use
				{
				case "clear":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_CLEAR, socket, serverData); // Call Clear Command
					break;
				case "close":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_CLOSE, socket, serverData, data); // Call Close Command
					break;
				case "drop":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_DROP, socket, serverData, data); // Call Drop Command
					break;
				case "examine":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_EXAMINE, socket, serverData, data); // Call Examine Command
					break;
				case "go":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_GO, socket, serverData, data); // Call Travel Command
					break;
				case "inventory":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_INV, socket, serverData); // Call Light Command
					break;
				case "light":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_LIGHT, socket, serverData, data); // Call Lock Command
					break;
				case "lock":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_LOCK, socket, serverData, data); // Call Lock Command
					break;
				case "look":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_LOOK, socket, serverData, data); // Gives player room description
					break;
				case "open":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_OPEN, socket, serverData, data); // Call Open Command
					break;
				case "read":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_READ, socket, serverData, data); // Call Read Command
					break;
				case "say":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_SAY, socket, serverData, userInput); // Call Say Command
					break;
				case "take":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_TAKE, socket, serverData, data); // Call Take Command
					break;
				case "unlock":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_UNLOCK, socket, serverData, data); // Call Unlock Command
					break;
				case "whisper":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_WHISPER, socket, serverData, userInput); // Call Whisper Command
					break;
				case "yell":
					await Basic_Mud(CONSTANT.FUNC_COMMAND, CONSTANT.CMD_YELL, socket, serverData, userInput); // Call Yell Command
					break;
				default:
					return result; // returns blank result
				}
			}
			else // If no Verb
			{
				// Allow Prepositions with North / South / East / West / Etc. to travel without a verb
				socket.emit('chat message', "Stop speaking nonsense!"); // tell off the player
				return; // Exit
			}
		}		
		
		async function Text_Parse (socket, serverData, data) // Parses User Input
		{
			var indPronounId = "";// Stores the Indefinite Pronoun ID
			var quantId = ""; // Stores the Quantity ID
			var verbId = ""; // Stores the verb ID
			var prepId = ""; // Stores the Perposition ID
			var dirObjId = ""; // Stores the indirect object ID
			var indObjId = ""; // Stores the direct obj ID
			var dirNoun = []; // Stores direct object nouns
			var indNoun = []; // Stores indirect object nouns
			var doorNoun = []; // Stores the nouns for the exit doors
			var nounDic = []; // Stores noun dictionary
			var dirObjScore = []; // Holds direct object scores
			var indObjScore = []; // Holds indirect object scores
			var dirObjWinner = []; // Holds the winner for the direct object
			var indObjWinner = []; // Holds the winner for the indirect object
			var roomData = ""; // Holds room data
			
			// Cleanup Functions
			data = data.replace(",", ""); // Remove Commas
			data = data.toLowerCase(); // Make User Input lowercase
			data = data.split(" "); // Separate each word
			
			// Load Room Data
			await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.ROOM, serverData.userData[socket.id].room).then(next =>
			{
				roomData = next;
			});
			
			for (x = 0; x < data.length; x++) // Loop removes artifacts from input
			{
				for (y = 0; y < CONSTANT.DICTIONARY.ARTIFACT.length; y++) // Loop Through artifacts
				{
					if (data[x] == CONSTANT.DICTIONARY.ARTIFACT[y]) // If artifact present
					{
						data.splice(x, 1);  // Remove Artifact
						x = x - 1; // set the data back one step
						y = CONSTANT.DICTIONARY.ARTIFACT.length; // stop the dictionary Loop
					}
				}
			}
			
			for (x = 0; x < data.length; x++) // Loop finds any Indefinite Pronoun (Stores the first and removes the rest)
			{
				for (y = 0; y < CONSTANT.DICTIONARY.IND_PRONOUN.length; y++) // Loop Through Indefinite Pronouns
				{
					if (data[x] == CONSTANT.DICTIONARY.IND_PRONOUN[y][0]) // If Indefinite Pronoun present
					{
						if (!CONSTANT.DICTIONARY.IND_PRONOUN[y][1] == "") // if second Indefinite Pronoun word isn't empty
						{
							if(data.length > x + 1) // If more words are left
							{
								if (data[x+1] == CONSTANT.DICTIONARY.IND_PRONOUN[y][1]) // If second Indefinite Pronoun word matches
								{
									if (indPronounId == "") // if Indefinite Pronoun ID has not been assigned
									{
										indPronounId = CONSTANT.DICTIONARY.IND_PRONOUN[y][2]; // Set the Indefinite Pronoun ID
									}
									data.splice(x, 2);  // Remove the Indefinite Pronouns
									x = x - 1; // set the data back one step
									y = CONSTANT.DICTIONARY.IND_PRONOUN.length; // stop the dictionary Loop
								}
							}
						}
						else // If this Indefinite Pronoun is only a single word
						{
							if (indPronounId == "") // if Indefinite Pronoun ID has not been assigned
							{
								indPronounId = CONSTANT.DICTIONARY.IND_PRONOUN[y][2]; // Set the Indefinite Pronoun ID
							}
							data.splice(x, 1);  // Remove the Indefinite Pronoun
							x = x - 1; // set the data back one step
							y = CONSTANT.DICTIONARY.IND_PRONOUN.length; // stop the dictionary Loop
						}
					}
				}
			}
			
			for (x = 0; x < data.length; x++) // Loop finds any quantities (Stores the first and removes the rest)
			{
				if (isFinite(data[x]) == true) // If number is present
				{
					if (quantId == "") // If no Quantity set
					{
						quantId = data[x];  // Set Quantity
					}
					data.splice(x, 1);  // Remove Quantity
					x = x - 1; // set the data back one step
				}
				else // if not a number Swap to dictionary
				{
					for (y = 0; y < CONSTANT.DICTIONARY.QUANT.length; y++) // Loop Through Quantities
					{
						if (data[x] == CONSTANT.DICTIONARY.QUANT[y][0]) // If Quantity present
						{
							if (!CONSTANT.DICTIONARY.QUANT[y][1] == "") // if second Quantity word isn't empty
							{
								if(data.length > x + 1) // If more words are left
								{
									if (data[x+1] == CONSTANT.DICTIONARY.QUANT[y][1]) // If second Quantity word matches
									{
										if (quantId == "") // if Quantity ID has not been assigned
										{
											quantId = CONSTANT.DICTIONARY.QUANT[y][2]; // Set the Quantity ID
										}
										data.splice(x, 2);  // Remove the Quantitys
										x = x - 1; // set the data back one step
										y = CONSTANT.DICTIONARY.QUANT.length; // stop the dictionary Loop
									}
								}
							}
							else // If this Quantity is only a single word
							{
								if (quantId == "") // if Quantity ID has not been assigned
								{
									quantId = CONSTANT.DICTIONARY.QUANT[y][2]; // Set the Quantity ID
								}
								data.splice(x, 1);  // Remove the Quantity
								x = x - 1; // set the data back one step
								y = CONSTANT.DICTIONARY.QUANT.length; // stop the dictionary Loop
							}
						}
					}
				}
			}
			
			// Find the action
			for (x = 0; x < data.length; x++) // Loop finds the verb (Stores the first and removes the rest)
			{
				for (y = 0; y < CONSTANT.DICTIONARY.VERB.length; y++) // Loop Through verbs
				{
					if (data[x] == CONSTANT.DICTIONARY.VERB[y][0]) // If verb present
					{
						if (!CONSTANT.DICTIONARY.VERB[y][1] == "") // if second verb word isn't empty
						{
							if(data.length > x + 1) // If more words are left
							{
								if (data[x+1] == CONSTANT.DICTIONARY.VERB[y][1]) // If second verb word matches
								{
									if (verbId == "") // if verb ID has not been assigned
									{
										verbId = CONSTANT.DICTIONARY.VERB[y][2]; // Set the verb ID
									}
									data.splice(x, 2);  // Remove the Verbs
									x = x - 1; // set the data back one step
									y = CONSTANT.DICTIONARY.VERB.length; // stop the dictionary Loop
								}
							}
						}
						else // If this verb is only a single word
						{
							if (verbId == "") // if verb ID has not been assigned
							{
								verbId = CONSTANT.DICTIONARY.VERB[y][2]; // Set the verb ID
							}
							data.splice(x, 1);  // Remove the Verb
							x = x - 1; // set the data back one step
							y = CONSTANT.DICTIONARY.VERB.length; // stop the dictionary Loop
						}
					}
				}
			}
			
			// Figure out the direct object and indirect object
			for (x = 0; x < data.length; x++) // Loop finds the preposition (Stores the first and removes the rest)
			{
				for (y = 0; y < CONSTANT.DICTIONARY.PREP.length; y++) // Loop Through prepositions
				{
					if (data[x] == CONSTANT.DICTIONARY.PREP[y][0]) // If preposition present
					{
						if (!CONSTANT.DICTIONARY.PREP[y][1] == "") // if second preposition word isn't empty
						{
							if(data.length > x + 1) // If more words are left
							{
								if (data[x+1] == CONSTANT.DICTIONARY.PREP[y][1]) // If second preposition word matches
								{
									if (prepId == "") // if Preposition ID has not been assigned
									{
										prepId = CONSTANT.DICTIONARY.PREP[y][2]; // Set the preposition ID
										data.splice(x, 2);  // Remove the prepositions
										dirNoun = data.slice(0, x); // Store Direct Object Nouns
										indNoun = data.slice(x, CONSTANT.DICTIONARY.PREP.length); // Store Indirect object Nouns
										x = x - 1; // move the data back one step
										y = CONSTANT.DICTIONARY.PREP.length; // stop the dictionary loop
									}
									else
									{
										indNoun.splice(x, 2);  // Remove the prepositions
										x = x - 1; // move the data back one step
										y = CONSTANT.DICTIONARY.PREP.length; // stop the dictionary loop
									}
								}
							}
						}
						else // If this preposition is only a single word
						{
							if (prepId == "") // if Preposition ID has not been assigned
							{
								prepId = CONSTANT.DICTIONARY.PREP[y][2]; // Set the preposition ID
								data.splice(x, 1);  // Remove the preposition
								dirNoun = data.slice(0, x); // Store Direct Object Nouns
								indNoun = data.slice(x, CONSTANT.DICTIONARY.PREP.length); // Store Indirect object Nouns
								x = x - 1; // move the data back one step
								y = CONSTANT.DICTIONARY.PREP.length; // stop the dictionary loop
							}
							else
							{
								indNoun.splice(x, 1);  // Remove the preposition
								x = x - 1; // move the data back one step
								y = CONSTANT.DICTIONARY.PREP.length; // stop the dictionary loop
							}
						}
					}
				}
			}	
			
			if (!data.length == 0) // if data exists (We don't need a noun dictionary if player doesn't have any noun data left)
			{
				if (prepId == "") // if Preposition ID has not been assigned
				{
					dirNoun = data;
					indNoun = [];
				}
				
				// Determining which objects are which
				// Prepare the door nouns for the exits
				for (x = 0; x < roomData.exits.length; x++) // Loop finds any doors on exits
				{
					if (!roomData.exits[x].exit == "") // If an exit exists
					{
						if (!roomData.exits[x].door == "") // If exit has a door
						{
							doorNoun[doorNoun.length] = roomData.exits[x].door; // Add the door object to the list
							nounDic = roomData.exits[x].door.items.concat(roomData.exits[x].door.surfaceItems.concat(roomData.exits[x].door.underItems.concat(nounDic))); // Add all the items In/On/Under the door to the Noun Dictionary
						}
					}
				}
				
				for (x = 0; x < serverData.userData[socket.id].inventory.length; x++) // Loop add objects within objects to the noun dictionary (Player inventory)
				{
					nounDic = serverData.userData[socket.id].inventory[x].items.concat(serverData.userData[socket.id].inventory[x].surfaceItems.concat(serverData.userData[socket.id].inventory[x].underItems.concat(nounDic))); // Adds noun list to the array
				}
				
				for (x = 0; x < roomData.objects.length; x++) // Loop add objects within objects to the noun dictionary (Room inventory)
				{
					nounDic = roomData.objects[x].items.concat(roomData.objects[x].surfaceItems.concat(roomData.objects[x].underItems.concat(nounDic))); // Adds noun list to the array
				}
				
				nounDic = serverData.userData[socket.id].inventory.concat(roomData.objects.concat(doorNoun.concat(nounDic))); // combine all the object in player's inventory and room into one array along with what we have
			}
			
			for (x = 0; x < nounDic.length; x++) // Loop scores the Objects
			{
				dirObjScore[x] = 0; // Zeros out the Direct Object Score
				indObjScore[x] = 0; // Zeros out the indirect Object Score
				for (y = 0; y < nounDic[x].dict.length; y++) // Loop goes though each adjective
				{
					for (z = 0; z < dirNoun.length; z++) // Loop scores the direct objects
					{
						if (nounDic[x].dict[y] == dirNoun[z]) // if one of the noun adjectives match
						{
							dirObjScore[x] = dirObjScore[x] + 1; // increase the score by 1
						}
					}
					for (z = 0; z < indNoun.length; z++) // Loop scores the indirect objects
					{
						if (nounDic[x].dict[y] == indNoun[z]) // if one of the noun adjectives match
						{
							indObjScore[x] = indObjScore[x] + 1; // increase the score by 1
						}
					}
				}
			}

			for (x = 0; x < dirObjScore.length; x++) // Loop picks highest score for direct object
			{
				if (x == 0) // if just starting the loop
				{
					dirObjWinner[0] = []; // makes 2d array
					dirObjWinner[0][0] = dirObjScore[x];
					dirObjWinner[0][1] = x;
				}
				else if (dirObjWinner.length > 1) // if more than one object stored
				{
					for (y = 0; y < dirObjWinner.length; y++) // Loops through each tied winner to see if we can break the tie
					{
						if (dirObjScore[x] > dirObjWinner[y][0])
						{
							dirObjWinner = []; // Clears Array
							dirObjWinner[0] = []; // makes a 2D array
							dirObjWinner[0][0] = dirObjScore[x];
							dirObjWinner[0][1] = x;
							y = dirObjWinner.length;
						}
						else if (dirObjScore[x] == dirObjWinner[y][0])
						{
							dirObjWinner[dirObjWinner.length] = []; // makes 2D array
							dirObjWinner[dirObjWinner.length - 1][0] = dirObjScore[x];
							dirObjWinner[dirObjWinner.length - 1][1] = x;
							y = dirObjWinner.length;
						}
					}
				}
				else // if only one object stored
				{
					if (dirObjScore[x] > dirObjWinner[0][0])
					{
						dirObjWinner[0][0] = dirObjScore[x];
						dirObjWinner[0][1] = x;
					}
					else if (dirObjScore[x] == dirObjWinner[0][0])
					{
						dirObjWinner[1] = []; // makes  a 2D array
						dirObjWinner[1][0] = dirObjScore[x];
						dirObjWinner[1][1] = x;
					}
				}
			}
			
			for (x = 0; x < indObjScore.length; x++) // Loop picks highest score for indirect object
			{
				if (x == 0) // if just starting the loop
				{
					indObjWinner[0] = []; // makes 2d array
					indObjWinner[0][0] = indObjScore[x];
					indObjWinner[0][1] = x;
				}
				else if (indObjWinner.length > 1) // if more than one object stored
				{
					for (y = 0; y < indObjWinner.length; y++) // Loops through each tied winner to see if we can break the tie
					{
						if (indObjScore[x] > indObjWinner[y][0])
						{
							indObjWinner = []; // Clears Array
							indObjWinner[0] = []; // makes a 2D array
							indObjWinner[0][0] = indObjScore[x];
							indObjWinner[0][1] = x;
							y = indObjWinner.length;
						}
						else if (indObjScore[x] == indObjWinner[y][0])
						{
							indObjWinner[indObjWinner.length] = []; // makes 2D array
							indObjWinner[indObjWinner.length - 1][0] = indObjScore[x];
							indObjWinner[indObjWinner.length - 1][1] = x;
							y = indObjWinner.length;
						}
					}
				}
				else // if only one object stored
				{
					if (indObjScore[x] > indObjWinner[0][0])
					{
						indObjWinner[0][0] = indObjScore[x];
						indObjWinner[0][1] = x;
					}
					else if (indObjScore[x] == indObjWinner[0][0])
					{
						indObjWinner[1] = []; // makes  a 2D array
						indObjWinner[1][0] = indObjScore[x];
						indObjWinner[1][1] = x;
					}
				}
			}

			if (dirObjWinner.length == 1) // If only one winner
			{
				dirObjId = nounDic[dirObjWinner[0][1]].name;
			}
			else if (dirObjWinner.length == 0) // If no winners
			{ 
				dirObjId = dirNoun.toString().replace(/,/g, " ");
			}
			else // If a Tie
			{
				for (x = 0; x < dirObjWinner.length; x++) // Loop weeds out identical Objects
				{
					if (x < dirObjWinner.length - 1) // If not on the last loop
					{
						if (nounDic[dirObjWinner[x][1]].name == nounDic[dirObjWinner[x+1][1]].name)
						{
							dirObjWinner.splice(x, 1);
							x--;
						}
					}
				}
				
				if (dirObjWinner.length == 1) // If we narrowed it down to 1
				{
					dirObjId = nounDic[dirObjWinner[0][1]].name;
				}
				else // Still have a tie
				{
					dirObjId = dirNoun.toString().replace(/,/g, " "); // Temp add in a better method(Make array to pass back to player for clarification)
				}
			}
			
			if (indObjWinner.length == 1) // If only one winner
			{
				indObjId = nounDic[indObjWinner[0][1]].name;
			}
			else if (indObjWinner.length == 0) // If no winners
			{
				indObjId = indNoun.toString().replace(/,/g, " ");
			}
			else // If a Tie
			{
				indObjId = ""; // Temp add in a better method (Make array to pass back to player for clarification)
				for (x = 0; x < indObjWinner.length; x++) // Loop weeds out identical Objects
				{
					if (x < indObjWinner.length - 1) // If not on the last loop
					{
						if (nounDic[indObjWinner[x][1]].name == nounDic[indObjWinner[x+1][1]].name)
						{
							indObjWinner.splice(x, 1);
							x--;
						}
					}
				}
				
				if (indObjWinner.length == 1) // If we narrowed it down to 1
				{
					indObjId = nounDic[indObjWinner[0][1]].name;
				}
				else // Still have a tie
				{
					indObjId = indNoun.toString().replace(/,/g, " "); // Temp add in a better method(Make array to pass back to player for clarification)
				}
			}
			
			if (dirObjId == "") // if no direct object
			{
				dirObjId = indObjId; // Swap indirect object to direct object 
				indObjId = "";
				// If there is only a direct object it can sometimes get tossed into the indirect object if it's to the right of the preposition in the sentence. This fixes that problem
			}
			
			// Make system that selects Highest scoring item and sets it to the ID's
			// Or kick back an error in the case of a tie (give player an option to choose from tied items maybe?)
			// if item is a tie need to double check to see if it isn't the same item first (On ground and in inventory)
			// if they are the same then just remove one of the items from array and try again
			// or we can check for duplicates when we put together the array (Probably at the end is easier)
			
			// 0 = Verb
			// 1 = preposition
			// 2 = Direct Object
			// 3 = Indirect Object
			// 4 = Quantity
			// 5 = Indefinite Pronoun
			// 6 = Conjunction?
			
			result = [verbId, prepId, dirObjId, indObjId, quantId, indPronounId]; // Store parsing results
			
			return result; // Let's fucking go
		}
		
		switch (func) // Picks the function to use
		{
			case CONSTANT.FUNC_ADMIN:
			    result = await Admin(opt1, opt2, opt3, opt4, opt5, opt6);
				break;
			case CONSTANT.FUNC_COMMAND:
			    result = await Command(opt1, opt2, opt3, opt4);
				break;
			case CONSTANT.FUNC_FACTORY:
				result = await Factory(opt1, opt2, opt3);
				break;
			case CONSTANT.FUNC_GAME_DATA:
				result = await Game_Data(opt1, opt2, opt3, opt4);
				break;
			case CONSTANT.FUNC_LOG_IN:
				result = await Log_In(opt1, opt2, opt3, opt4, opt5);
				break;
			case CONSTANT.FUNC_STARTUP:
				result = await Startup();
				break;
			case CONSTANT.FUNC_T_INTERPRET:
				result = await Text_Interpreter(opt1, opt2, opt3, opt4); // Interpret Text
				break;
			case CONSTANT.FUNC_T_PARSE:
				result = await Text_Parse(opt1, opt2, opt3); // Parse Text
				break;
			default:
				return result; // returns blank result
		}

		return result; // gives the result
	}
	
	async function Game_Loop (func, opt1, opt2, opt3, opt4, opt5) // Module that holds all the Game Loop Functions
	{
		async function Loop (socket, serverData, msg, userInput)
		{
			await Basic_Mud(CONSTANT.FUNC_GAME_DATA, CONSTANT.LOAD, CONSTANT.PLAYER, serverData.userData[socket.id].name).then(next => // Load Player Data (Incase some outside force changed something)
			{
				 serverData.userData[socket.id] = next;
			});
			var cmdData = await Basic_Mud(CONSTANT.FUNC_T_PARSE, socket, serverData, userInput); // Puts Text into the Text Parser
			Basic_Mud(CONSTANT.FUNC_T_INTERPRET, socket, serverData, cmdData, userInput);
			// Setup Index Saving / Loading first
		}
		
		switch (func) // Picks the function to use
		{
			case CONSTANT.FUNC_LOOP:
			    result = await Loop(opt1, opt2, opt3, opt4, opt5); // Main Game Loop
				break;
			default:
				return result; // returns blank result
		}
		
		return result;
	}
		
	switch (module) // Picks the function to use
	{
		case CONSTANT.MOD_B_MUD: // if Basic Mud Module selected
		    result = await Basic_Mud(func, opt1, opt2, opt3, opt4, opt5); // call Basic Mud Module
			break;
		case CONSTANT.MOD_GLOOP:
		    result = await Game_Loop(func, opt1, opt2, opt3, opt4, opt5); // call Game Loop Module
			break; 
		default:
			return result; // returns blank result
	}
	
	if (!(result === "")) // if result not empty
	{
		return result; // gives the result
	}
	
	// Shortcuts
	
}
