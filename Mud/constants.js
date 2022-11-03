// Basic Mud Constants
// v1.2-a
// Created by ???
// Started on Jan 1, 2022

// Coding Rules
// -----Variables-----
// normalVariable = Camel caps no spacers (thisIsAnExample)
// CONSTANTS = All caps with "_" spacers (THIS_IS_AN_EXAMPLE)
// Functions = Each word Captitalized with "_" spacers (This_Is_An_Example)

module.exports = { // Exports all the constants
  // Add Control Panel here near the top for easy access
  // Game Constants
  MAX_STACK: 99, // Maximum stack Amount
  MIN_USERNAME: 3, // Minimum Username Length
  MAX_USERNAME: 20, // Maximum Username Length
  
  // Module Constants
  MOD_B_MUD: "M001", // Basic Mud Module
  MOD_GLOOP: "M002", // Game Loop
  
  // Function Constants
  // Basic Mud Functions
  FUNC_ADMIN: "BM000", // Administrator Functions ID
  FUNC_COMMAND: "BM001", // Basic Mud Functions ID
  FUNC_FACTORY: "BM002", // Factory Functions ID
  FUNC_GAME_DATA: "BM003", // Save/Load Data Function ID
  FUNC_LOG_IN: "BM004", // Login Function ID
  FUNC_STARTUP: "BM005", // Startup Function D
  FUNC_T_INTERPRET: "BM006", // Text Interpreter Function ID
  FUNC_T_PARSE: "BM007", // Text Parser Function ID
  
  // Game Loop Functions
  FUNC_LOOP: "GL000", // Main Loop Function ID
  
  // Admin Command Constants
  AD_D_MATCH: "AD000", // Door Match Command ID
  AD_L_LOOP: "AD001", // Light Loop Command ID
  AD_N_MATCH: "AD002", // Name Match Command ID
  AD_O_ADD: "AD003", // Object Add Command ID
  AD_O_SUB: "AD004", // Object Subtract Command ID
  AD_O_TRANS: "AD005", // Object Transfer Command ID
  
  // Command Constants
  CMD_CLEAR: "CMD000", // Clear Command ID
  CMD_CLOSE: "CMD001", // Close Command ID
  CMD_DROP: "CMD002", // Drop Command ID
  CMD_EXAMINE: "CMD003", // Examine Command ID
  CMD_GO: "CMD004", // Go Command ID
  CMD_HELP: "CMD005", // Help Command ID
  CMD_INV: "CMD006", // Inventory Command ID
  CMD_LIGHT: "CMD007", // Light Command ID
  CMD_LOCK: "CMD008", // Lock Command ID
  CMD_LOOK: "CMD009", // Look Command ID
  CMD_OPEN: "CMD010", // Open Command ID
  CMD_READ: "CMD011", // Read Command ID
  CMD_SAY: "CMD012", // Say Command ID
  CMD_TAKE: "CMD013", // Take Command ID
  CMD_UNLOCK: "CMD014", // Unlock Command ID
  CMD_WHISPER: "CMD015", // Whisper Command ID
  CMD_YELL: "CMD016", // Yell Command ID
  
  // Factory Constants
  FAC_USER_DATA: 1, // Factory User Data Build ID
  
  // General Constants
  ALL: "All",
  NULL: "Null",
  INDEX: "index", // Index ID
  GLOBAL: "Global",
  GLOBAL_NAME: "global",
  SAVE: 0, // Save ID
  LOAD: 1, // Load ID
  PLAYER: "User", // Player ID
  ROOM: "Room", // Room ID
  OBJECT: "Object",  // Object ID
  ITEM: "Item", // Item ID
  VERB: 0, // Verb ID
  PREP: 1, // Preposition ID
  DIR_O: 2, // Direct Object ID
  IND_O: 3, // Indirect Object ID
  QUANT: 4, // Quantity ID
  IND_PRO: 5, // Indefinite Pronoun ID
  
  // Dictionary for text parser
  DICTIONARY:
  {
    ARTIFACT:
	[
      "the",
	  "a",
	  "an",
	  "of"
	],
	IND_PRONOUN:
	[ // [0] = Indefinite Pronoun word 1, [1] = Indefinite Pronoun word 2, [2] = ID
	  ["all", "", "all"],
	  ["another", "", ""],
	  ["any", "body", ""],
	  ["any", "one", ""],
	  ["any", "thing", ""],
	  ["any", "", ""],
	  ["anybody", "", ""],
	  ["anyone", "", ""],
	  ["anything", "", ""],
	  ["every", "body", ""],
	  ["every", "one", ""],
	  ["every", "thing", ""],
	  ["every", "", "all"],
	  ["everybody", "", ""],
	  ["everyone", "", ""],
	  ["everything", "", ""],
	  ["few", "", ""],
	  ["many", "", ""],
	  ["none", "", ""],
	  ["several", "", ""],
	  ["some", "body", ""],
	  ["some", "one", ""],
	  ["some", "", ""],
	  ["somebody", "", ""],
	  ["someone", "", ""]
	],
	QUANT:
	[
	  ["one", "", 1],
	  ["two", "", 2],
	  ["three", "", 3],
	  ["four", "", 4],
	  ["five", "", 5],
	  ["six", "", 6],
	  ["seven", "", 7],
	  ["eight", "", 8],
	  ["nine", "", 9],
	  ["ten", "", 10],
	  ["eleven", "", 11],
	  ["twelve", "", 12],
	  ["thirteen", "", 13],
	  ["fourteen", "", 14],
	  ["fifteen", "", 15],
	  ["sixteen", "", 16],
	  ["seventeen", "", 17],
	  ["eighteen", "", 18],
	  ["nineteen", "", 19],
	  ["twenty", "one", 21],
	  ["twenty", "two", 22],
	  ["twenty", "three", 23],
	  ["twenty", "four", 24],
	  ["twenty", "five", 25],
	  ["twenty", "six", 26],
	  ["twenty", "seven", 27],
	  ["twenty", "eight", 28],
	  ["twenty", "nine", 29],
	  ["twenty", "", 20],
	  ["twenty-one", "", 21],
	  ["twentyone", "", 21],
	  ["twenty-two", "", 22],
	  ["twentytwo", "", 22],
	  ["twenty-three", "", 23],
	  ["twentythree", "", 23],
	  ["twenty-four", "", 24],
	  ["twentyfour", "", 24],
	  ["twenty-five", "", 25],
	  ["twentyfive", "", 25],
	  ["twenty-six", "", 26],
	  ["twentysix", "", 26],
	  ["twenty-seven", "", 27],
	  ["twentyseven", "", 27],
	  ["twenty-eight", "", 28],
	  ["twentyeight", "", 28],
	  ["twenty-nine", "", 29],
	  ["twentynine", "", 29],
	  ["thirty", "one", 31],
	  ["thirty", "two", 32],
	  ["thirty", "three", 33],
	  ["thirty", "four", 34],
	  ["thirty", "five", 35],
	  ["thirty", "six", 36],
	  ["thirty", "seven", 37],
	  ["thirty", "eight", 38],
	  ["thirty", "nine", 39],
	  ["thirty", "", 30],
	  ["thirty-one", "", 31],
	  ["thirtyone", "", 31],
	  ["thirty-two", "", 32],
	  ["thirtytwo", "", 32],
	  ["thirty-three", "", 33],
	  ["thirtythree", "", 33],
	  ["thirty-four", "", 34],
	  ["thirtyfour", "", 34],
	  ["thirty-five", "", 35],
	  ["thirtyfive", "", 35],
	  ["thirty-six", "", 36],
	  ["thirtysix", "", 36],
	  ["thirty-seven", "", 37],
	  ["thirtyseven", "", 37],
	  ["thirty-eight", "", 38],
	  ["thirtyeight", "", 38],
	  ["thirty-nine", "", 39],
	  ["thirtynine", "", 39],
	  ["fourty", "one", 41],
	  ["fourty", "two", 42],
	  ["fourty", "three", 43],
	  ["fourty", "four", 44],
	  ["fourty", "five", 45],
	  ["fourty", "six", 46],
	  ["fourty", "seven", 47],
	  ["fourty", "eight", 48],
	  ["fourty", "nine", 49],
	  ["fourty", "", 40],
	  ["fourty-one", "", 41],
	  ["fourtyone", "", 41],
	  ["fourty-two", "", 42],
	  ["fourtytwo", "", 42],
	  ["fourty-three", "", 43],
	  ["fourtythree", "", 43],
	  ["fourty-four", "", 44],
	  ["fourtyfour", "", 44],
	  ["fourty-five", "", 45],
	  ["fourtyfive", "", 45],
	  ["fourty-six", "", 46],
	  ["fourtysix", "", 46],
	  ["fourty-seven", "", 47],
	  ["fourtyseven", "", 47],
	  ["fourty-eight", "", 48],
	  ["fourtyeight", "", 48],
	  ["fourty-nine", "", 49],
	  ["fourtynine", "", 49],
	  ["fifty", "one", 51],
	  ["fifty", "two", 52],
	  ["fifty", "three", 53],
	  ["fifty", "four", 54],
	  ["fifty", "five", 55],
	  ["fifty", "six", 56],
	  ["fifty", "seven", 57],
	  ["fifty", "eight", 58],
	  ["fifty", "nine", 59],
	  ["fifty", "", 50],
	  ["fifty-one", "", 51],
	  ["fiftyone", "", 51],
	  ["fifty-two", "", 52],
	  ["fiftytwo", "", 52],
	  ["fifty-three", "", 53],
	  ["fiftythree", "", 53],
	  ["fifty-four", "", 54],
	  ["fiftyfour", "", 54],
	  ["fifty-five", "", 55],
	  ["fiftyfive", "", 55],
	  ["fifty-six", "", 56],
	  ["fiftysix", "", 56],
	  ["fifty-seven", "", 57],
	  ["fiftyseven", "", 57],
	  ["fifty-eight", "", 58],
	  ["fiftyeight", "", 58],
	  ["fifty-nine", "", 59],
	  ["fiftynine", "", 59],
	  ["sixty", "one", 61],
	  ["sixty", "two", 62],
	  ["sixty", "three", 63],
	  ["sixty", "four", 64],
	  ["sixty", "five", 65],
	  ["sixty", "six", 66],
	  ["sixty", "seven", 67],
	  ["sixty", "eight", 68],
	  ["sixty", "nine", 69],
	  ["sixty", "", 60],
	  ["sixty-one", "", 61],
	  ["sixtyone", "", 61],
	  ["sixty-two", "", 62],
	  ["sixtytwo", "", 62],
	  ["sixty-three", "", 63],
	  ["sixtythree", "", 63],
	  ["sixty-four", "", 64],
	  ["sixtyfour", "", 64],
	  ["sixty-five", "", 65],
	  ["sixtyfive", "", 65],
	  ["sixty-six", "", 66],
	  ["sixtysix", "", 66],
	  ["sixty-seven", "", 67],
	  ["sixtyseven", "", 67],
	  ["sixty-eight", "", 68],
	  ["sixtyeight", "", 68],
	  ["sixty-nine", "", 69],
	  ["sixtynine", "", 69],
	  ["seventy", "one", 71],
	  ["seventy", "two", 72],
	  ["seventy", "three", 73],
	  ["seventy", "four", 74],
	  ["seventy", "five", 75],
	  ["seventy", "six", 76],
	  ["seventy", "seven", 77],
	  ["seventy", "eight", 78],
	  ["seventy", "nine", 79],
	  ["seventy", "", 70],
	  ["seventy-one", "", 71],
	  ["seventyone", "", 71],
	  ["seventy-two", "", 72],
	  ["seventytwo", "", 72],
	  ["seventy-three", "", 73],
	  ["seventythree", "", 73],
	  ["seventy-four", "", 74],
	  ["seventyfour", "", 74],
	  ["seventy-five", "", 75],
	  ["seventyfive", "", 75],
	  ["seventy-six", "", 76],
	  ["seventysix", "", 76],
	  ["seventy-seven", "", 77],
	  ["seventyseven", "", 77],
	  ["seventy-eight", "", 78],
	  ["seventyeight", "", 78],
	  ["seventy-nine", "", 79],
	  ["seventynine", "", 79],
	  ["eighty", "one", 81],
	  ["eighty", "two", 82],
	  ["eighty", "three", 83],
	  ["eighty", "four", 84],
	  ["eighty", "five", 85],
	  ["eighty", "six", 86],
	  ["eighty", "seven", 87],
	  ["eighty", "eight", 88],
	  ["eighty", "nine", 89],
	  ["eighty", "", 80],
	  ["eighty-one", "", 81],
	  ["eightyone", "", 81],
	  ["eighty-two", "", 82],
	  ["eightytwo", "", 82],
	  ["eighty-three", "", 83],
	  ["eightythree", "", 83],
	  ["eighty-four", "", 84],
	  ["eightyfour", "", 84],
	  ["eighty-five", "", 85],
	  ["eightyfive", "", 85],
	  ["eighty-six", "", 86],
	  ["eightysix", "", 86],
	  ["eighty-seven", "", 87],
	  ["eightyseven", "", 87],
	  ["eighty-eight", "", 88],
	  ["eightyeight", "", 88],
	  ["eighty-nine", "", 89],
	  ["eightynine", "", 89],
	  ["ninty", "one", 91],
	  ["ninty", "two", 92],
	  ["ninty", "three", 93],
	  ["ninty", "four", 94],
	  ["ninty", "five", 95],
	  ["ninty", "six", 96],
	  ["ninty", "seven", 97],
	  ["ninty", "eight", 98],
	  ["ninty", "nine", 99],
	  ["ninty", "", 90],
	  ["ninty-one", "", 91],
	  ["nintyone", "", 91],
	  ["ninty-two", "", 92],
	  ["nintytwo", "", 92],
	  ["ninty-three", "", 93],
	  ["nintythree", "", 93],
	  ["ninty-four", "", 94],
	  ["nintyfour", "", 94],
	  ["ninty-five", "", 95],
	  ["nintyfive", "", 95],
	  ["ninty-six", "", 96],
	  ["nintysix", "", 96],
	  ["ninty-seven", "", 97],
	  ["nintyseven", "", 97],
	  ["ninty-eight", "", 98],
	  ["nintyeight", "", 98],
	  ["ninty-nine", "", 99],
	  ["nintynine", "", 99]
	],
	PREP:
	[ // [0] = Preposition word 1, [1] = Proposition word 2, [2] = ID
	  ["above", "", "over"],
	  ["across", "", "across"],
	  ["along", "", "along"],
	  ["among", "", "by"],
	  ["at", "", "at"],
	  ["behind", "", "behind"],
	  ["below", "", "below"],
	  ["beneath", "", "below"],
	  ["between", "", "between"],
	  ["by", "", "by"],
	  ["d", "", "down"],
	  ["down", "", "down"],
	  ["downward", "", "down"],
	  ["during", "", "during"],
	  ["e", "", "east"],
	  ["east", "", "east"],
	  ["for", "", "for"],
	  ["forward", "", "forward"],
	  ["from", "below", "from below"],
	  ["from", "under", "from below"],
	  ["from", "", "from"],
	  ["in", "", "in"],
	  ["inside", "", "in"],
	  ["into", "", "in"],
	  ["n", "", "north"],
	  ["ne", "", "northeast"],
	  ["nw", "", "northwest"],
	  ["near", "", "by"],
	  ["nearby", "", "by"],
	  ["next", "to", "by"],
	  ["next", "", "by"],
	  ["north", "east", "northeast"],
	  ["north", "west", "northwest"],
	  ["north", "", "north"],
	  ["northeast", "", "northeast"],
	  ["northwest", "", "northwest"],
	  ["off", "", "off"],
	  ["on", "top", "on"],
	  ["on", "", "on"],
	  ["opposite", "", "opposite"],
	  ["over", "", "over"],
	  ["past", "", "past"],
	  ["s", "", "south"],
	  ["se", "", "southeast"],
	  ["sw", "", "southwest"],
	  ["since", "", "since"],
	  ["south", "east", "southeast"],
	  ["south", "west", "southwest"],
	  ["south", "", "south"],
	  ["southeast", "", "southeast"],
	  ["southwest", "", "southwest"],
	  ["to", "", "to"],
	  ["toward", "", "toward"],
	  ["u", "", "up"],
	  ["under", "", "below"],
	  ["up", "", "up"],
	  ["upward", "", "up"],
	  ["w", "", "west"],
	  ["west", "", "west"],
	  ["with", "", "with"],
	  ["within", "", "in"]
	],
	VERB: // Two word verbs always go above single word verbs so they get identified right
	[ // [0] = verb word 1, [1] = verb word 2, [2] = ID
	  ["?", "", "help"],
	  ["clear", "", "clear"],
	  ["c", "", "close"],
	  ["close", "", "close"],
	  ["drop", "", "drop"],
	  ["ex", "", "examine"],
	  ["examine", "", "examine"],
	  ["h", "", "help"],
	  ["help", "", "help"],
	  ["i", "", "inventory"],
	  ["inventory", "" , "inventory"],
	  ["g", "", "go"],
	  ["go", "", "go"],
	  ["grab", "", "take"],
	  ["l", "at", "examine"],
	  ["l", "", "look"],
	  ["light", "", "light"],
	  ["lock", "", "lock"],
	  ["look", "at", "examine"],
	  ["look", "", "look"],
	  ["o", "", "open"],
	  ["open", "", "open"],
	  ["p", "", "drop"],
	  ["place", "", "drop"],
	  ["pick", "up", "take"],
	  ["put", "", "drop"],
	  ["r", "", "read"],
	  ["read", "", "read"],
	  ["say", "", "say"],
	  ["shut", "", "close"],
	  ["t", "", "take"],
	  ["take", "", "take"],
	  ["travel", "", "go"],
	  ["unl", "", "unlock"],
	  ["unlock", "", "unlock"],
	  ["wh", "", "whisper"],
	  ["whisper", "", "whisper"],
	  ["y", "", "yell"],
	  ["yell", "", "yell"]
	]
  },

  // Messages (Preset messages for the game)
  MSG: 
  [
  "Welcome traveller, what is your name?", // 0
  "Ah yes, ", // 1
  ", welcome back. What is your password?", // 2  
  " is it? It's nice to see some fresh faces. Please input a password.", // 3
  "Please enter your password in again.",  // 4
  "Your passwords don't match. Please input a password.",  // 5
  "Thank you. Please enjoy the game.",  // 6
  "Your passwords don't match. What is your name?",  // 7
  "You have been banned from entering this relm.", // 8
  "Incorrect Command. type help for assistance.", // 9
  "You cannot travel in that direction.", // 10
  "You travel"  // 11
  ]
}