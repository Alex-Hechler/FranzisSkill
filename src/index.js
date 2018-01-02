/**
 * JavasScript Sourcen zu Franzis Skill.
 */

/* App ID for the skill */
var APP_ID = process.env.APP_ID; // "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; 

var dbEndpoint = process.env.DBENDPOINT; // 'http://calcbox.de/simdb/rest/db';

var URL = require('url');
var authUsername = process.env.AUTH_USERNAME; // 'rest';
var authPassword = process.env.AUTH_PASSWORD; // 'geheim';

var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');

var http = require('http');
var querystring = require("querystring");

/**
 * FranzisSkill is a child of AlexaSkill.
 */
var FranzisSkill = function() {
	AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
FranzisSkill.prototype = Object.create(AlexaSkill.prototype);
FranzisSkill.prototype.constructor = FranzisSkill;

FranzisSkill.prototype.eventHandlers.onSessionStarted = function(
		sessionStartedRequest, session) {
	console.log("FranzisSkill onSessionStarted requestId: "
			+ sessionStartedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any initialization logic goes here
	clearSessionData(session);
};

FranzisSkill.prototype.eventHandlers.onSessionEnded = function(
		sessionEndedRequest, session) {
	console.log("FranzisSkill onSessionEnded requestId: "
			+ sessionEndedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any cleanup logic goes here
	clearSessionData(session);
};

FranzisSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
	doLaunch(session, response);
};


FranzisSkill.prototype.intentHandlers = {

	"SagHalloIntent" : doSagHalloIntent,
	"AddiereZahlenIntent" : doAddiereZahlenIntent,
    
	"AMAZON.StopIntent" : function(intent, session, response) {
		clearSessionData(session);
		speech.goodbye(intent.name, "*", response);
	}

};


FranzisSkill.prototype.actionHandlers = {
};


// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
	logObject("EVENT", event);
	
	speech.set_locale(getEventLocale(event)); 
	
	// Create an instance of the FranzisSkill skill.
	var franzisSkill = new FranzisSkill();
	removeSessionRequest(event.session);
	franzisSkill.execute(event, context);
};

// initialize tests
exports.initTests = function(url, param, callback) {
	endpoint = url;
	sendCommand([], "?", "initTests", param, "", function callbackFunc(result) {
		console.log(result);
		callback();
	});
}


/* ============= */
/* SEND METHODEN */
/* ============= */

function initUserAndConnect(intent, session, response, successCallback) {
	initUser(session, response, function successFunc1() {
		connect(session, response, function successFunc2() {
			var handled = handleSessionQuestion(intent, session, response);
			if (!handled) {
				successCallback();
			};
		});
	});
}

function connect(session, response, successCallback) {
	if (isConnectedToGame(session)) {
		successCallback();
	} else {
		var userId = getDBUserIdFromSession(session);
		var userAILevel = getUserAILevel(session, 2);
		send(session, response, "", "connect", userId, userAILevel,
				function callbackFunc(result) {
					console.log("Connected with GameId: " + result.gameId);
					setSessionGameId(session, result.gameId);
					setSessionGameMovesCount(session, result.movesCount);
					successCallback();
				});
	}
}

function execDoNewGame(intent, session, response) {
	var gameId = getSessionGameId(session);
	sendCommand(session, gameId, "restartGame", "", "", function callbackFunc(result) {
		clearSessionData(session);
		initUserAndConnect(intent, session, response, function successCallback() {
			msg = speech.createMsg("INTERN", "NEW_GAME_STARTED");
			execDisplayField(session, response, msg);
		});
	});
}

function execDoMove(intent, session, response) {
	send(session, response, getSessionGameId(session), "doMove", getMove(intent), "", 
			function successFunc(result) {
				if (result.code === "S_OK") {
					execDoAIMove(session, response);
				} else {
					execDisplayField(session, response);
				}
			},
			function errorFunc(result, code) {
				var moveText = getMoveText(intent);
				speech.respond("SEND_doMove", code, response, moveText);
			}
	);
}

function execDoAIMove(session, response) {
	send(session, response, getSessionGameId(session), "doAIMove", "", "",
			function successFunc(result) {
				setSessionLastAIMove(session, result.move.move);
				setSessionLastAIMoveCheck(session, result.move.check);
				execDisplayField(session, response);
			});
}

function execDoRollback(session, response) {
	send(session, response, getSessionGameId(session), "rollback",
			"2", "", function successFunc(result) {
				msg = speech.createMsg("INTERN", "LAST_MOVE_ROLLEDBACK");
				execDisplayField(session, response, msg);
			});
}




function execIntro(session, response) {
	// TODO: set phase to INTRO
//	setUserPhase(session, "INTRO");
	askQuestion(session, response, "INTRO.1");
}

function execWelcome(session, response) {
	askQuestion(session, response, "WELCOME");
}

function askQuestion(session, response, MSG_KEY, prefixMsg) {
	var msg = speech.createMsg("TEXT", MSG_KEY);
	addPrefixMsg(msg, prefixMsg);
	setSessionQuestion(session, MSG_KEY);
	respondText(session, response, msg, "TOK_" + MSG_KEY, true);
}


function addPrefixMsg(baseMsg, prefixMsg) {
	if (!prefixMsg) {
		return;
	}
	if (prefixMsg.speechOut && baseMsg.speechOut) {
		baseMsg.speechOut = prefixMsg.speechOut + " " + baseMsg.speechOut;
	}
	if (prefixMsg.display && baseMsg.display) {
		baseMsg.display = prefixMsg.display + " " + baseMsg.display;
	}
}


function showAction(session, response, ACTION_KEY) {
	var msg = speech.createMsg("TEXT", ACTION_KEY);
	respondText(session, response, msg, "ACT_"+ACTION_KEY, false);
}


function execDisplayField(session, response, msg) {
	var gameId = getSessionGameId(session);
	send(session, response, gameId, "getGameData", "", "",
			function callbackFunc(result) {
				setSessionGameMovesCount(session, result.movesCount);
				respondField(session, response, result, msg);
			});
}

function execChangeAILevel(intent, session, response) {
	var aiLevel = getAILevel(intent);
	send(session, response, getSessionGameId(session), "setAILevel", aiLevel, "", function successFunc(result) {
		setUserAILevel(session, aiLevel);
		var prefixMsg = speech.createMsg("INTERN", "AI_LEVEL_CHANGED", aiLevel);
		var prefixMsg2 = speech.createMsg("INTERN", "MAKE_YOUR_MOVE");
		addPrefixMsg(prefixMsg, prefixMsg2);
		execDisplayField(session, response, prefixMsg);
	});
}

function execSetOptShow(intent, session, response, optShow) {
	setUserOptShow(session, optShow);
	var msg_code = (optShow) ? "OPT_SHOW_ACTIVATED" : "OPT_SHOW_DEACTIVATED";
	var prefixMsg = speech.createMsg("INTERN", msg_code, optShow);
	var prefixMsg2 = speech.createMsg("INTERN", "MAKE_YOUR_MOVE");
	addPrefixMsg(prefixMsg, prefixMsg2);
	execDisplayField(session, response, prefixMsg);
}

function execAnimalConnect(intent, session, response) {
	var animal = getMappedAnimal(intent);
	send(session, response, getSessionGameId(session), "connectImage", animal, "", function successFunc(result) {
		msg = speech.createMsg("INTERN", "ANIMAL_CONNECTED", animal);
		execDisplayField(session, response, msg);
	});
}

function didNotUnterstand(intent, session, response) {
	msg = speech.createMsg("INTERN", "DID_NOT_UNDERSTAND");
	execDisplayField(session, response, msg)
}

function changeSettings(intent, session, response) {
	msg = speech.createMsg("INTERN", "CHANGE_SETTINGS");
	execDisplayField(session, response, msg)
}

function closeGame(session, response, successCallback) {
	send(session, response, getSessionGameId(session), "closeGame", "", "", function callbackFunc(result) {
		successCallback();
	});
}


/* ============ */
/* TEXT DISPLAY */
/* ============ */

function respondText(session, response, msg, token, instantAnswer) {
	var directives = createTextDirective(session, msg, token);
	if (instantAnswer) {
		respondMsgWithDirectives(session, response, msg, directives);
	}
	else {
		outputMsgWithDirectives(session, response, msg, directives);
	}
}

function createTextDirective(session, msg, token) {
	if (!getRequestHasDisplay(session)) {
		return undefined;
	}
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate3",
			"token" : token,
			"title" : msg.title,
			"image": {
				"sources": [ { "url": "https://calcbox.de/chsimgs/help/chess_help-340.png" } ]
			},
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : msg.richText
				}
			},
			"backButton" : "VISIBLE",
		}
	} ];
	return directives;
}

/* ============= */
/* FIELD DISPLAY */
/* ============= */

function respondField(session, response, gameData, msg) {
	var lastAIMove = getSessionLastAIMove(session);
	var lastAIMoveCheck = getSessionLastAIMoveCheck(session);
	removeSessionLastAIMove(session);
	removeSessionLastAIMoveCheck(session);
	if (!msg) {
		msg = createStatusMsg(gameData.winner, lastAIMove, lastAIMoveCheck);
	}
	var gameStatusInfo = createGameStatusInfo(gameData);
	var directives = createFieldDirectives(session, gameData, msg, lastAIMove, lastAIMoveCheck, gameStatusInfo);
	if (gameData.winner != 0) {
		closeGame(session, response, function closedCallback() {
			outputMsgWithDirectives(session, response, msg, directives);
		});
	} else {
		var instantAnswer = getUserInstantAnswer(session, true);
		if (instantAnswer) {
			respondMsgWithDirectives(session, response, msg, directives);
		} else {
			outputMsgWithDirectives(session, response, msg, directives);
		}
	}
}

function createFieldDirectives(session, gameData, msg, lastAIMove, lastAIMoveCheck, gameStatusInfo) {
	if (!getRequestHasDisplay(session)) {
		logObject("createFieldDirectives-session", session)
		return undefined;
	}
	var optShow = getUserOptShow(session);
	var hintMsg = createHintMsg(gameData.winner, lastAIMove);
	var fieldText = createFieldText(gameData.fieldView.fen, gameData.fieldView.lastMove, optShow);
	var directives = [ {
		"type" : "Display.RenderTemplate",
		"template" : {
			"type" : "BodyTemplate1",
			"token" : "TOK_MAIN",
			"title" : gameStatusInfo + msg.display,
			"textContent" : {
				"primaryText" : {
					"type" : "RichText",
					"text" : fieldText
				}
			},
			"backButton" : "HIDDEN",
			"hint" : {
				"type" : "PlainText",
				"text" : hintMsg.display
			}
		}
	} ];
	return directives;
}

function outputMsgWithDirectives(session, response, msg, directives) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.outputMsgWithDirectives(response, msg, directives)
	});
}

function respondMsgWithDirectives(session, response, msg, directives) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.respondMsgWithDirectives(response, msg, directives);
	});
}

function createGameStatusInfo(gameData) {
	if (!gameData) {
		return "";
	}
	return "[Zug:"+(gameData.movesCount+1)+"/AI:"+gameData.aiLevel+"] - ";
}

function createStatusMsg(winner, lastAIMove, lastAIMoveCheck) {
	var msg;
	var status = !lastAIMove ? "STATUS" : "STATUS_AIMOVE";
	var lastMoveText = move2text(lastAIMove, lastAIMoveCheck);
	if ((winner === 1) || (winner === 2)) {
		if (!lastAIMove) {
			msg = speech.createMsg(status, "PLAYER_WINS", lastMoveText);
		}
		else {
			msg = speech.createMsg(status, "AI_PLAYER_WINS", lastMoveText);
		}
	} else if (winner === -1) {
		msg = speech.createMsg(status, "DRAW", lastMoveText);
	} else {
		msg = speech.createMsg(status, "MAKE_YOUR_MOVE", lastMoveText);
	}
	return msg;
}

function move2text(lastMove, lastMoveCheck) {
	if (!lastMove) {
		return undefined;
	}
	var result = lastMove.charAt(0) + " " + lastMove.charAt(1) + " nach " + lastMove.charAt(2) + " " + lastMove.charAt(3);
	if (lastMoveCheck) {
		result = result + " (SCHACH)"
	}
	return result;
}
	


function createHintMsg(winner, lastAIMove) {
	var msg;
	if ((winner === 1) || (winner === 2)) {
		if (!lastAIMove) {
			msg = speech.createMsg("HINT", "PLAYER_WINS");
		} else {
			msg = speech.createMsg("HINT", "AI_PLAYER_WINS");
		}
	} else if (winner === -1) {
		msg = speech.createMsg("HINT", "DRAW");
	} else {
		msg = speech.createMsg("HINT", "MAKE_YOUR_MOVE");
	}
	return msg;
}

function createFieldText(fieldStr, lastMove, optShow) {
	var result = "";
	var numericMove = move2numeric(lastMove);
	result = result + "<font size='3'><action token='ActionHELP'>(?)</action></font><font size='2'>";
	result = result + addImageWH("spacer_h", spacerHWidth, spacerHHeight);
	result = result + addImageWH("header", headerWidth, headerHeight);

	if (optShow) {
		result = result + addImageWH("spacer_h", spacerHWidth, spacerHHeight); // use this as linebreak to avoid a gap between lines. Does not work on simulator (no 1024px width?)
	}
	else {
		result = result + "<br/>";                   // this is the normal linebreak, but puts some extra pixels between the lines. 
	}
	
	for (var row = 7; row >= 0; row--) {
		var y = 7-row;
		result = result + addImage("space_5", 5);
		result = result + addImageWH("left_"+(row+1), leftWidth, imgBaseSize);
		for (var col = 0; col < 8; col++) {
			var code = fieldStr.charAt(y*9+col);
			var img = code2Img(code, col, row, numericMove);
			result = result + addImage(img, 1);
		}
		if (optShow) {
			result = result + addImage("space_4", 4);  // use this as linebreak to avoid a gap between lines. Does not work on simulator (no 1024px width?)
		}
		else {
			result = result + "<br/>";                 // this is the normal linebreak, but puts some extra pixels between the lines. 
		}
	}

	
	result = result + addImageWH("spacer_f", spacerFWidth, spacerFHeight);
	result = result + addImageWH("footer", footerWidth, footerHeight);
	result = result + "</font>";
	return result;
}

function move2numeric(move) {
	if (move === undefined) {
		return undefined;
	}
	colFrom = move.charCodeAt(0) - "a".charCodeAt(0); 
	rowFrom = move.charCodeAt(1) - "1".charCodeAt(0);
	colTo = move.charCodeAt(2) - "a".charCodeAt(0); 
	rowTo = move.charCodeAt(3) - "1".charCodeAt(0);
	return {
		"colFrom": colFrom,
		"rowFrom": rowFrom,
		"colTo": colTo,
		"rowTo": rowTo
	}
}

function code2Img(code, col, row, numericMove) {
	var img;
	if (code == '1') {
		img = "00";
	} 
	else {
		var lowerCase = code.toLowerCase();
		if (lowerCase === code) {
			img = "b"+lowerCase;  
		}
		else {
			img = "w"+lowerCase;  
		}
	}
	var odd = ((col+row) % 2 === 1);
	if (odd) {
		img = img + "l";
	}
	else {
		img = img + "d";
	}
	if (numericMove !== undefined) {
		if ((col === numericMove.colFrom) && (row === numericMove.rowFrom)) {
			img = img + "m"
		}
		else if ((col === numericMove.colTo) && (row === numericMove.rowTo)) {
			img = img + "m"
		}
	}
	return img;
}

function addImage(imgName, size) {
	return addImageWH(imgName, size * imgBaseSize, imgBaseSize);
}

function addImageWH(imgName, width, height) {
	return "<img src='" + imgBaseUrl + imgName + ".png' width='" + width + "' height='" + height + "'/>";
}

/* ============= */
/* INTENT-ACCESS */
/* ============= */

function getMove(intent) {
	var from_col = getFromIntent(intent, "from_col", "?");
	var from_row = getFromIntent(intent, "from_row", 0);
	var to_col = getFromIntent(intent, "to_col", "?");
	var to_row = getFromIntent(intent, "to_row", 0);
	return from_col + "-" + from_row + ":" + to_col + "-" + to_row;
}

function getMoveText(intent) {
	var from_col = getFromIntent(intent, "from_col", "?");
	var from_row = getFromIntent(intent, "from_row", "?");
	var to_col = getFromIntent(intent, "to_col", "?");
	var to_row = getFromIntent(intent, "to_row", "?");
	return from_col + " " + from_row + " nach " + to_col + " " + to_row;
}

function getAILevel(intent) {
	return getFromIntent(intent, "aiLevel", "?");
}

function getMappedAnimal(intent) {
	var animal = getFromIntent(intent, "animal", "?");
	if (animal === undefined) {
		return '?';
	}
	animal = animal.toLowerCase();
	var mappedAnimal = ANIMAL_MAPPING[animal];
	if (mappedAnimal !== undefined) {
		return mappedAnimal;
	}
	return animal.toUpperCase();
}

function getFromIntent(intent, attribute_name, defaultValue) {
	var result = intent.slots[attribute_name];
	if (!result || !result.value) {
		return defaultValue;
	}
	return result.value;
}

/* ======================== */
/* SESSION VARIABLES ACCESS */
/* ======================== */

function isConnectedToGame(session) {
	return getSessionGameId(session) !== undefined;
}

function getAmzUserId(session) {
	if (!session || (!session.user)) {
		return undefined;
	}
	return session.user.userId;
}


function clearSessionData(session) {
	session.attributes = {};
}

function getSessionGameId(session, defaultValue) {
	return getFromSession(session, "gameId", defaultValue);
}
function getSessionGameMovesCount(session, defaultValue) {
	return getFromSession(session, "gameMovesCount", defaultValue);
}
function getSessionLastAIMove(session, defaultValue) {
	return getFromSession(session, "lastAIMove", defaultValue);
}
function getSessionLastAIMoveCheck(session, defaultValue) {
	return getFromSession(session, "lastAIMoveCheck", defaultValue);
}
function getSessionQuestion(session, defaultValue) {
	return getFromSession(session, "question", defaultValue);
}
function getRequestDisplayToken(session, defaultValue) {
	return getFromSessionRequest(session, "displayToken", defaultValue);
}
function getRequestHasDisplay(session, defaultValue) {
	return getFromSessionRequest(session, "hasDisplay", defaultValue);
}

function setSessionGameId(session, gameId) {
	setInSession(session, "gameId", gameId);
}
function setSessionGameMovesCount(session, gameMovesCount) {
	setInSession(session, "gameMovesCount", gameMovesCount);
}
function setSessionLastAIMove(session, lastAIMove) {
	setInSession(session, "lastAIMove", lastAIMove);
}
function setSessionLastAIMoveCheck(session, lastAIMoveCheck) {
	setInSession(session, "lastAIMoveCheck", lastAIMoveCheck);
}
function setSessionQuestion(session, questionKey) {
	setInSession(session, "question", questionKey);
}
function setRequestDisplayToken(session, displayToken) {
	setInSessionRequest(session, "displayToken", displayToken);
}
function setRequestHasDisplay(session, hasDisplay) {
	setInSessionRequest(session, "hasDisplay", hasDisplay);
}

function removeSessionLastAIMove(session) {
	removeFromSession(session, "lastAIMove");
}
function removeSessionLastAIMoveCheck(session) {
	removeFromSession(session, "lastAIMoveCheck");
}
function removeSessionQuestion(session) {
	removeFromSession(session, "question");
}


function getFromSession(session, key, defaultValue) {
	if (!session || (!session.attributes)) {
		return defaultValue;
	}
	var result = session.attributes[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}
function setInSession(session, key, value) {
	if (value === undefined) {
		removeFromSession(session, key);
		return;
	}
	if (!session) {
		return;
	}
	if (!session.attributes) {
		session.attributes = {};
	}
	session.attributes[key] = value;
}
function removeFromSession(session, key) {
	if (!session || (!session.attributes) || (!session.attributes[key])) {
		return;
	}
	delete session.attributes[key];
}

function getFromSessionRequest(session, key, defaultValue) {
	if (!session || (!session.request)) {
		return defaultValue;
	}
	var result = session.request[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}
function setInSessionRequest(session, key, value) {
	if (value === undefined) {
		removeFromSessionRequest(session, key);
		return;
	}
	if (!session) {
		return;
	}
	if (!session.request) {
		session.request = {};
	}
	session.request[key] = value;
}
function removeFromSessionRequest(session, key) {
	if (!session || (!session.request) || (!session.request[key])) {
		return;
	}
	delete session.request[key];
}
function removeSessionRequest(session) {
	if (!session || (!session.request)) {
		return;
	}
	delete session.request;
}


function hasEventDisplay(event) {
	if (!event || (!event.context) || (!event.context.System) || (!event.context.System.device) 
			|| (!event.context.System.device.supportedInterfaces) || (!event.context.System.device.supportedInterfaces.Display)) {
		return false;
	}
	return true;
}

function getEventLocale(event) {
	if (!event || (!event.request)) {
		return undefined;
	}
	return event.request.locale;
}

function getEventDisplayToken(event) {
	if (!event || (!event.context) || (!event.context.Display)) {
		return undefined;
	}
	return event.context.Display.token;
}



/* ======= */
/* USER DB */
/* ======= */

function initUser(intent, session, response, successCallback) {
	if (hasDBUserInSession(session)) {
		successCallback();
	} else {
		var amzUserId = getAmzUserId(session);
		if (!amzUserId) {
			speech.respond("INTERN", "NO_AMZ_USERID", response);
		} else {
			sendDB(session, response, "getOrCreateUserByAppAndName", "FRANZI.USER", amzUserId, function callback(result) {
						var dbUser = result.user;
						var userDataOk = unmarshallUserData(dbUser);
						if (!userDataOk) {
							speech.respond("INTERN", "INVALID_USERDATA", response);
						} else {
							setDBUserInSession(session, dbUser);
							console.log("User initialized: " + dbUser.userId);
							successCallback();
						}
					});
		}
	}
}

/* save / load */

function saveUserData(session, response, callbackSuccess) {
	if (!hasUserDataChanged(session)) {
		callbackSuccess();
	} else {
		clearUserDataChanged(session);
		updateUserDataInDB(session, response, function callback() {
			callbackSuccess();
		});

	}
}

function unmarshallUserData(dbUser) {
	if (!dbUser) {
		return false;
	}
	if (!dbUser.data) {
		dbUser.data = {};
		return true;
	}
	try {
		var unmarshalledData = JSON.parse(dbUser.data);
		dbUser.data = unmarshalledData;
		return true;
	} catch (e) {
		return false;
	}
}

function updateUserDataInDB(session, response, callbackSuccess) {
	var userId = getDBUserIdFromSession(session);
	var marshalledUserData = getMarshalledUserData(session);
	sendDB(session, response, "updateUserData", userId, marshalledUserData, function callback(result) {
		callbackSuccess();
	});
}

function getMarshalledUserData(session) {
	var data = getUserDataFromSession(session);
	if (!data) {
		return undefined;
	}
	var result = JSON.stringify(data);
	return result;
}

/* user properties */

function getUserPhase(session, defaultValue) {
	return getUserProperty(session, "phase", defaultValue);
}

function setUserPhase(session, value) {
	return setUserProperty(session, "phase", value);
}


function setUserProperty(session, key, value) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	userData[key] = value;
	userData.changed = true;
}
function getUserProperty(session, key, defaultValue) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return defaultValue;
	}
	var result = userData[key];
	if (result === undefined) {
		result = defaultValue;
	}
	return result;
}

/* user data changed flag */

function hasUserDataChanged(session) {
	var userData = getUserDataFromSession(session);
	if (!userData || (!userData.changed)) {
		return false;
	}
	return true;
}

function clearUserDataChanged(session) {
	var userData = getUserDataFromSession(session);
	if (!userData) {
		return;
	}
	delete userData.changed;
}

/* user data */

function getDBUserIdFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.userId;
}

function getUserDataFromSession(session) {
	var dbUser = getDBUserFromSession(session);
	if (!dbUser) {
		return undefined;
	}
	return dbUser.data;
}

/* dbUser */

function hasDBUserInSession(session) {
	if (!getDBUserFromSession(session)) {
		return false;
	}
	return true;
}
function getDBUserFromSession(session) {
	if (!session || (!session.attributes)) {
		return undefined;
	}
	return session.attributes.dbUser;
}
function setDBUserInSession(session, dbUser) {
	if (!session || (!session.attributes)) {
		return;
	}
	session.attributes.dbUser = dbUser;
}

/* ========= */
/* REST CALL */
/* ========= */

function sendDB(session, response, cmd, param1, param2, successCallback) {
	sendDBCommand(session, cmd, param1, param2, function callbackFunc(result) {
		var code = ((!result) || (!result.code)) ? "?" : result.code;
		if (code.startsWith("S_")) {
			successCallback(result);
		} else {
			speech.respond("SENDDB_" + cmd, code, response);
		}
	});
}

function sendDBCommand(session, cmd, param1, param2, callback) {

	var result = "";

	var query = querystring.stringify({
		"cmd" : cmd,
		"param1" : param1,
		"param2" : param2
	});
	var url = dbEndpoint + "?" + query;
	console.log('CALL: ' + url);

	var urlObj = URL.parse(url);
	var options = {
		protocol : urlObj.protocol,
		host : urlObj.hostname,
		port : urlObj.port,
		path : urlObj.path,
		auth : authUsername + ':' + authPassword
	};

	http.get(options, function(res) {
		var responseString = '';
		if (res.statusCode != 200) {
			console.log("ERROR HTTP STATUS " + res.statusCode);
			result = {
				code : "E_CONNECT",
				errmsg : "h.t.t.p. Status " + res.statusCode
			};
			callback(result);
		}
		res.on('data', function(data) {
			responseString += data;
		});
		res.on('end', function() {
			console.log("get-end: " + responseString);
			var responseObject;
			try {
				responseObject = JSON.parse(responseString);
			} catch (e) {
				console.log("E_CONNECT INVALID JSON-FORMAT: " + e.message);
				responseObject = {
					code : "E_CONNECT",
					errmsg : "Die Serverantwort ist nicht valide."
				};
			}
			callback(responseObject);

		});
	}).on('error', function(e) {
		console.log("E_CONNECT: " + e.message);
		result = {
			code : "E_CONNECT",
			errmsg : e.message
		};
		callback(result);
	});
}


/* ============= */
/* DO FUNKTIONEN */
/* ============= */

function doLaunch(session, response) {
	initUser(undefined, session, response, function successFunc() {
		if (!getUserPhase(session)) {
			executeFirstTimeLaunch(session, response);
		}
		else {
			executeLaunch(session, response);
		}
	});
}

function doSagHalloIntent(intent, session, response) {
	initUser(intent, session, response, function successFunc() {
		executeSagHalloIntent(intent, session, response);
	});
}

function doAddiereZahlenIntent(intent, session, response) {
	initUser(intent, session, response, function successFunc() {
		var zahl1 = getFromIntent(intent, "zahl1");
		var zahl2 = getFromIntent(intent, "zahl2");
		executeAddiereZahlenIntent(intent, session, response, zahl1, zahl2);
	});
}


/* =============== */
/* HILFSFUNKTIONEN */
/* =============== */


function logVariable(prefix, variable) {
	console.log(prefix + ": " + JSON.stringify(variable));
}


/* ================== */
/* EXECUTE FUNKTIONEN */
/* ================== */

function executeFirstTimeLaunch(session, response) {
	speech.ask("Willkommen zum ersten Mal. Hier ist eine Einführung. Fertig. Was möchtest Du jetzt tun?");
}

function executeLaunch(session, response) {
	speech.ask("Willkommen zurück, Was möchtest Du jetzt tun?");
}

function executeSagHalloIntent(session, response) {
	speech.tell("Halli, Hallo!");
}

function executeAddiereZahlenIntent(session, response, zahl1, zahl2) {
	logVariable("Zahl 1", zahl1);
	logVariable("Zahl 2", zahl2);
	speech.tell("Das weiss ich doch nicht!");
}




