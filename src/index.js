/**
 * Diese Datei ist Teil des Alexa Skills 'Carballo Chess'. Copyright (C) 2016-2017
 * Ferenc Hechler (github@fh.anderemails.de)
 * 
 * Der Alexa Skill 'Carballo Chess' ist Freie Software: Sie koennen es unter den
 * Bedingungen der GNU General Public License, wie von der Free Software
 * Foundation, Version 3 der Lizenz oder (nach Ihrer Wahl) jeder spaeteren
 * veroeffentlichten Version, weiterverbreiten und/oder modifizieren.
 * 
 * Der Alexa Skills 'Carballo Chess' wird in der Hoffnung, dass es nuetzlich sein
 * wird, aber OHNE JEDE GEWAEHRLEISTUNG, bereitgestellt; sogar ohne die
 * implizite Gewaehrleistung der MARKTFAEHIGKEIT oder EIGNUNG FUER EINEN
 * BESTIMMTEN ZWECK. Siehe die GNU General Public License fuer weitere Details.
 * 
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 */

/* App ID for the skill */
var APP_ID = process.env.APP_ID; // "amzn1.ask.skill.46c8454a-d474-4e38-a75e-c6c8017b1fe1"; 

var endpoint = process.env.ENDPOINT; // 'http://calcbox.de/devchess/rest/chess';
var dbEndpoint = process.env.DBENDPOINT; // 'http://calcbox.de/simdb/rest/db';

var URL = require('url');
var authUsername = process.env.AUTH_USERNAME; // 'rest';
var authPassword = process.env.AUTH_PASSWORD; // 'geheim';

var AlexaSkill = require('./AlexaSkill');

var speech = require('./Speech');

var http = require('http');
var querystring = require("querystring");

var imgBaseUrl = "https://calcbox.de/chsimgs/48px/";
var imgBaseSize = 48;
var headerWidth = 408;
var headerHeight = 16; 
var footerWidth = 408;
var footerHeight = 17; 
var spacerHWidth = 208;
var spacerHHeight = 16;
var spacerFWidth = 234;
var spacerFHeight = 16;
var leftWidth = 17;


var QUESTION_TO_INTENTS_MAPPING = {
		"INTRO.1" : ["AMAZON.YesIntent", "AMAZON.NoIntent"],
		"INTRO.2" : ["NumberAnswerIntent"],
		"INTRO.3" : ["AMAZON.YesIntent", "AMAZON.NoIntent"]
}

var TOKEN_TO_QUESTION_MAPPING = {
		"TOK_HELP" : "HELP_REGELN",
		"TOK_INTRO": "HELP_REGELN",
		"TOK_WELCOME": "HELP_REGELN",
		"TOK_HELP_REGELN": "HELP_REGELN",
		"TOK_HELP_REGELN_NOGUI": "HELP_REGELN",

		"ACT_ActionHELP": "ActionHOME",
		"ACT_ActionHELP_REGELN": "ActionHOME",
		"ACT_ActionHELP_SPRACHSTEUERUNG": "ActionHOME",
		"ACT_ActionHELP_KOMMANDOS": "ActionHOME",
		"ACT_ActionHELP_WEITERES": "ActionHOME",

		"TOK_MAIN": undefined
}

var NEXT_MSG_KEY_FOR_YES = {
		"HELP": "HELP_REGELN",
		"INTRO": "HELP_REGELN",
		"WELCOME": "HELP_REGELN",
		"HELP_REGELN": "HELP_REGELN",
		"HELP_REGELN_NOGUI": "HELP_REGELN"
	}

var ANIMAL_MAPPING = {

		  // LOCAL de-DE
		  "affe":			"AFFE",
		  "affen":			"AFFE",
		  "ameise":			"AMEISE",
		  "bär":			"BAER",
		  "bären":			"BAER",
		  "biene": 			"BIENE",
		  "dachs": 			"DACHS",
		  "delfin": 		"DELFIN",
		  "delphin": 		"DELFIN",
		  "eichhörnchen":	"EICHHOERNCHEN",
		  "elefant": 		"ELEFANT",
		  "elefanten":		"ELEFANT",
		  "ente": 			"ENTE",
		  "esel": 			"ESEL",
		  "fisch": 			"FISCH",
		  "fliege": 		"FLIEGE",
		  "frosch": 		"FROSCH",
		  "gans": 			"GANS",
		  "giraffe": 		"GIRAFFE",
		  "hahn": 			"HAHN",
		  "hai": 			"HAI",
		  "hase": 			"HASE",
		  "hasen": 			"HASE",
		  "hirsch": 		"HIRSCH",
		  "hund": 			"HUND",
		  "igel": 			"IGEL",
		  "kamel": 			"KAMEL",
		  "katze": 			"KATZE",
		  "krokodil": 		"KROKODIL",
		  "kuh": 			"KUH",
		  "löwe": 			"LOEWE",
		  "löwen": 			"LOEWE",
		  "marienkäfer": 	"MARIENKAEFER",
		  "maus": 			"MAUS",
		  "möwe": 			"MOEWE",
		  "nashorn": 		"NASHORN",
		  "panda": 			"PANDA",
		  "papagei": 		"PAPAGEI",
		  "pfau": 			"PFAU",
		  "pferd":			"PFERD",
		  "pinguin": 		"PINGUIN",
		  "raupe": 			"RAUPE",
		  "schaf": 			"SCHAF",
		  "schildkröte": 	"SCHILDKROETE",
		  "schlange": 		"SCHLANGE",
		  "schmetterling": 	"SCHMETTERLING",
		  "schnecke": 		"SCHNECKE",
		  "schwan": 		"SCHWAN",
		  "schwein": 		"SCHWEIN",
		  "spinne": 		"SPINNE",
		  "storch": 		"STORCH",
		  "tiger": 			"TIGER",
		  "wal": 			"WAL",
		  "wolf": 			"WOLF",
		  "wurm": 			"WURM",
		  "zebra": 			"ZEBRA",
		  
		  // LOCALE en-US
		  "monkey": 		"AFFE",
		  "ant": 			"AMEISE",
		  "bear": 			"BAER",
		  "bee": 			"BIENE",
		  "badger": 		"DACHS",
		  "dolphin": 		"DELFIN",
		  "squirrel": 		"EICHHOERNCHEN",
		  "elephant": 		"ELEFANT",
		  "duck": 			"ENTE",
		  "donkey": 		"ESEL",
		  "fish": 			"FISCH",
		  "fly": 			"FLIEGE",
		  "frog": 			"FROSCH",
		  "goose": 			"GANS",
		  "giraffe": 		"GIRAFFE",
		  "cock": 			"HAHN",
		  "shark": 			"HAI",
		  "rabbit": 		"HASE",
		  "deer": 			"HIRSCH",
		  "dog": 			"HUND",
		  "hedgehog": 		"IGEL",
		  "camel": 			"KAMEL",
		  "cat": 			"KATZE",
		  "crocodile": 		"KROKODIL",
		  "cow": 			"KUH",
		  "lion": 			"LOEWE",
		  "ladybug": 		"MARIENKAEFER",
		  "mouse": 			"MAUS",
		  "gull": 			"MOEWE",
		  "rhino": 			"NASHORN",
		  "panda": 			"PANDA",
		  "parrot": 		"PAPAGEI",
		  "peacock": 		"PFAU",
		  "horse":			"PFERD",
		  "penguin": 		"PINGUIN",
		  "caterpillar": 	"RAUPE",
		  "sheep": 			"SCHAF",
		  "turtle": 		"SCHILDKROETE",
		  "snake": 			"SCHLANGE",
		  "butterfly": 		"SCHMETTERLING",
		  "snail": 			"SCHNECKE",
		  "swan": 			"SCHWAN",
		  "pig": 			"SCHWEIN",
		  "spider": 		"SPINNE",
		  "stork": 			"STORCH",
		  "tiger": 			"TIGER",
		  "whale": 			"WAL",
		  "wolf": 			"WOLF",
		  "worm": 			"WURM",
		  "zebra": 			"ZEBRA"
		  
}


/**
 * ChessSkill is a child of AlexaSkill.
 */
var ChessSkill = function() {
	AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ChessSkill.prototype = Object.create(AlexaSkill.prototype);
ChessSkill.prototype.constructor = ChessSkill;

ChessSkill.prototype.eventHandlers.onSessionStarted = function(
		sessionStartedRequest, session) {
	console.log("ChessSkill onSessionStarted requestId: "
			+ sessionStartedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any initialization logic goes here
	clearSessionData(session);
};

ChessSkill.prototype.eventHandlers.onSessionEnded = function(
		sessionEndedRequest, session) {
	console.log("ChessSkill onSessionEnded requestId: "
			+ sessionEndedRequest.requestId + ", sessionId: "
			+ session.sessionId);
	// any cleanup logic goes here
	clearSessionData(session);
};

ChessSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
	doLaunch(session, response);
};

ChessSkill.prototype.intentHandlers = {

	"NewGameIntent" : doNewGameIntent,

	"PlayerMoveIntent" : doPlayerMoveIntent,
    
	"AIStartsIntent" : doAIStartsIntent,
	
	"RollbackIntent" : doRollbackIntent,

	"ActivateShowDisplayIntent" : doActivateShowDisplayIntent,
	"DeactivateShowDisplayIntent" : doDeactivateShowDisplayIntent,

	"ChangeAILevelIntent" : doChangeAILevelIntent,
	
	"AnimalConnectIntent" : doAnimalConnectIntent, 
		
	"ActivateInstantAnswerIntent" : doActivateInstantAnswerIntent,
	"DeactivateInstantAnswerIntent" : doDeactivateInstantAnswerIntent,

	"AMAZON.HelpIntent" : doHelpIntent,

	"AMAZON.StartOverIntent" : doStartOverIntent,
	"AMAZON.YesIntent" : doYesIntent,
	"AMAZON.NoIntent" : doNoIntent,
	
	"NumberAnswerIntent" : doNumberAnswerIntent,
	
	"AMAZON.PreviousIntent" : doPreviousIntent,
	"AMAZON.NextIntent" : doNextIntent,
	"AMAZON.ScrollUpIntent" : doScrollUpIntent,
	"AMAZON.ScrollLeftIntent" : doScrollLeftIntent,
	"AMAZON.ScrollDownIntent" : doScrollDownIntent,
	"AMAZON.ScrollRightIntent" : doScrollRightIntent,
	"AMAZON.PageUpIntent" : doPageUpIntent,
	"AMAZON.PageDownIntent" : doPageDownIntent,
	"AMAZON.MoreIntent" : doMoreIntent,
	"AMAZON.NavigateSettingsIntent" : doNavigateSettingsIntent,
	
	"AMAZON.StopIntent" : function(intent, session, response) {
		clearSessionData(session);
		speech.goodbye(intent.name, "*", response);
	}

};


ChessSkill.prototype.actionHandlers = {
	"ActionHELP" : doShowAction,
	"ActionHELP_REGELN" : doShowAction,
	"ActionHELP_SPRACHSTEUERUNG" : doShowAction,
	"ActionHELP_KOMMANDOS" : doShowAction,
	"ActionHELP_WEITERES" : doShowAction,
	"ActionHOME" : doActionHOME
};


// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
	logObject("EVENT", event);
	
	speech.set_locale(getEventLocale(event)); 
	
	// Create an instance of the ChessSkill skill.
	var chessSkill = new ChessSkill();
	removeSessionRequest(event.session);
	setRequestHasDisplay(event.session, hasEventDisplay(event));
	setRequestDisplayToken(event.session, getEventDisplayToken(event));
	chessSkill.execute(event, context);
};

// initialize tests
exports.initTests = function(url, param, callback) {
	endpoint = url;
	sendCommand([], "?", "initTests", param, "", function callbackFunc(result) {
		console.log(result);
		callback();
	});
}

/* ============== */
/* ENTRY METHODEN */
/* ============== */

function doLaunch(session, response) {
	initUserAndConnect(undefined, session, response, function successFunc() {
		if (!getUserPhase(session)) {
			execIntro(session, response);
		}
		else {
			if (getSessionGameMovesCount(session) === 0) {
				execWelcome(session, response);
			}
			else {
				msg = speech.createMsg("INTERN", "GAME_CONTINUED");
				execDisplayField(session, response, msg)
			}
		}
	});
}

function doNewGameIntent(intent, session, response) {
	// TODO: confirm with yes / no
	initUserAndConnect(intent, session, response, function successFunc() {
		execDoNewGame(intent, session, response);
	});
}

function doPlayerMoveIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execDoMove(intent, session, response);
	});
}


function doRollbackIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execDoRollback(session, response);
	});
}


function doAIStartsIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		if (getSessionGameMovesCount(session) === 0) {
			execDoAIMove(session, response);
		}
		else {
			msg = speech.createMsg("INTERN", "AI_STARTS_NOT_ALLOWED");
			execDisplayField(session, response, msg)
		}
	});
}

function doActivateShowDisplayIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execSetOptShow(intent, session, response, true);
	});
}

function doDeactivateShowDisplayIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execSetOptShow(intent, session, response, false);
	});
}

function doChangeAILevelIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execChangeAILevel(intent, session, response);
	});
}

function doAnimalConnectIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		execAnimalConnect(intent, session, response);
	});
}

function doActivateInstantAnswerIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		setUserInstantAnswer(session, true);
		execDisplayField(session, response);
	});
}

function doDeactivateInstantAnswerIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		setUserInstantAnswer(session, false);
		execDisplayField(session, response);
	});
}

function doHelpIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		askQuestion(session, response, "HELP");
	});
}

function doShowAction(actionName, session, response) {
	handleQuestion(session);
	initUserAndConnect(intent, session, response, function successFunc() {
		showAction(session, response, actionName);
	});
}

function doActionHOME(actionName, session, response) {
	handleQuestion(session);
	execDisplayField(session, response);
}

function doStartOverIntent(intent, session, response) {
	doNewGame(session, response);
}

function doYesIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		noQuestionAsked(session, response);
	});
}

function mapNoGUIMsg(session, msgKey) {
	if (getRequestHasDisplay(session)) {
		return msgKey;
	}
	if (msgKey === "HELP_REGELN") {
		return "HELP_REGELN_NOGUI";
	}
	return msgKey;
}


function doNoIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		noQuestionAsked(session, response);
	});
}

function doNumberAnswerIntent(intent, session, response) {
	initUserAndConnect(intent, session, response, function successFunc() {
		noQuestionAsked(session, response);
	});
}

function doPreviousIntent(intent, session, response) {
	var question = handleQuestion(session);
	initUserAndConnect(intent, session, response, function successFunc() {
		if (question === undefined) {
			didNotUnterstand(intent, session, response);
		}
		else {
			execDisplayField(session, response)
		}
	});
	
}


function handleQuestion(session) {
	var question = getSessionQuestion(session);
	var displayToken = getRequestDisplayToken(session);
	if (displayToken !== undefined) {
		question = TOKEN_TO_QUESTION_MAPPING[displayToken];
	}
	setSessionQuestion(session, "handled");
	logObject("QUESTION", question);
	return question;
}

function checkUnhandledQuestion(session) {
	var question = getSessionQuestion(session);
	if (question === "handled") {
		removeSessionQuestion(session);
		return undefined;
	}
	var displayToken = getRequestDisplayToken(session);
	if (displayToken !== undefined) {
		question = TOKEN_TO_QUESTION_MAPPING[displayToken];
	}
	return question;
}


function noQuestionAsked(session, response) {
	var msg = speech.createMsg("INTERN", "NO_QUESTION_ASKED");
	execDisplayField(session, response, msg)
}


function doNextIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollUpIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollLeftIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollDownIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doScrollRightIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doPageUpIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doPageDownIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doMoreIntent(intent, session, response) {
	didNotUnterstand(intent, session, response);
}

function doNavigateSettingsIntent(intent, session, response) {
	changeSettings(intent, session, response);
}

/* ============= */
/* SEND METHODEN */
/* ============= */

function handleSessionQuestion(intent, session, response) {
	var question = getSessionQuestion(session);
	if (!question) { 
		// no question set in session
		return false;
	}
	// check if intent is valid for question
	var validIntents = QUESTION_TO_INTENTS_MAPPING[question];
	if (!validIntents) {
		return false;
	}
	if (validIntents.indexOf(intent.name) === -1) {
		var prefixMsg = speech.createMsg("INTERN", "NO_ANSWER_TO_QUESTION");
		askQuestion(session, response, question, prefixMsg)
		return true;
	}
	execAnswer(question, intent, session, response);
	return true;
}

function execAnswer(question, intent, session, response) {
	switch (question) {
	case "INTRO.1": {
		var optShow = (intent.name === "AMAZON.YesIntent");
		setUserOptShow(session, optShow);
		var msg_code = (optShow) ? "OPT_SHOW_ACTIVATED" : "OPT_SHOW_DEACTIVATED";
		var prefixMsg = speech.createMsg("INTERN", msg_code, optShow);
		askQuestion(session, response, "INTRO.2", prefixMsg);
		break;
	}
	case "INTRO.2":
	case "INTRO.2b": {
		var aiLevel = getFromIntent(intent, "num");
		console.log("aiLevel=" + aiLevel);
		if ((!aiLevel) || (aiLevel < 1) || (aiLevel > 7)) {
			askQuestion(session, response, "INTRO.2b");
		}
		else {
			send(session, response, getSessionGameId(session), "setAILevel", aiLevel, "", function successFunc(result) {
				setUserAILevel(session, aiLevel);
				var prefixMsg = speech.createMsg("INTERN", "AI_LEVEL_CHANGED", aiLevel);
				askQuestion(session, response, "INTRO.3", prefixMsg);
			});
		}
		break;
	}
	case "INTRO.3": {
		var detailHelp = (intent.name === "AMAZON.YesIntent");
		if (detailHelp) {
			askQuestion(session, response, "HELP_DETAIL");
		}
		else {
			execDisplayField(session, response, msg)
		}
		break;
	}
	default: {
		speech.respond("Generic", "E_QUESTION", response, question);
		break;
	}
	}
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

function initUser(session, response, successCallback) {
	if (hasDBUserInSession(session)) {
		successCallback();
	} else {
		var amzUserId = getAmzUserId(session);
		if (!amzUserId) {
			speech.respond("INTERN", "NO_AMZ_USERID", response);
		} else {
			sendDB(session, response, "getOrCreateUserByAppAndName", "CHESS.USER", amzUserId, function callback(result) {
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

function getUserInstantAnswer(session, defaultValue) {
	return getUserProperty(session, "instantAnswer", defaultValue);
}
function getUserPhase(session, defaultValue) {
	return getUserProperty(session, "phase", defaultValue);
}
function getUserHadIntro(session, defaultValue) {
	return getUserProperty(session, "hadIntro", defaultValue);
}

function getUserOptShow(session, defaultValue) {
	return getUserProperty(session, "optShow", defaultValue);
}

function getUserAILevel(session, defaultValue) {
	return getUserProperty(session, "aiLevel", defaultValue);
}

function setUserAILevel(session, value) {
	return setUserProperty(session, "aiLevel", value);
}
function setUserOptShow(session, value) {
	return setUserProperty(session, "optShow", value);
}
function setUserPhase(session, value) {
	return setUserProperty(session, "phase", value);
}
function setUserHadIntro(session, value) {
	return setUserProperty(session, "hadIntro", value);
}
function setUserInstantAnswer(session, value) {
	return setUserProperty(session, "instantAnswer", value);
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

function send(session, response, gameId, cmd, param1, param2, successCallback, errorCallback) {
	sendCommand(session, gameId, cmd, param1, param2, function callbackFunc(
			result) {
		var code = ((!result) || (!result.code)) ? "?" : result.code;
		if (code.startsWith("S_")) {
			successCallback(result);
		} else if (errorCallback !== undefined) {
			errorCallback(result, code);
		} else {
			speech.respond("SEND_" + cmd, code, response);
		}
	});
}

function sendCommand(session, gameId, cmd, param1, param2, callback) {

	var result = "";

	var query = querystring.stringify({
		"gameId" : gameId,
		"cmd" : cmd,
		"param1" : param1,
		"param2" : param2
	});
	var url = endpoint + "?" + query;
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

function logObject(prefix, object) {
	console.log(prefix + ": " + JSON.stringify(object));
}
