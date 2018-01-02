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
	logVariable("EVENT", event);
	
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


/* ============= */
/* INTENT-ACCESS */
/* ============= */


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

function getAmzUserId(session) {
	if (!session || (!session.user)) {
		return undefined;
	}
	return session.user.userId;
}


function clearSessionData(session) {
	session.attributes = {};
}

function getSessionQuestion(session, defaultValue) {
	return getFromSession(session, "question", defaultValue);
}

function setSessionQuestion(session, questionKey) {
	setInSession(session, "question", questionKey);
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
		executeSagHalloIntent(session, response);
	});
}

function doAddiereZahlenIntent(intent, session, response) {
	initUser(intent, session, response, function successFunc() {
		var zahl1 = getFromIntent(intent, "zahlA");
		var zahl2 = getFromIntent(intent, "zahlB");
		executeAddiereZahlenIntent(session, response, zahl1, zahl2);
	});
}


/* =============== */
/* HILFSFUNKTIONEN */
/* =============== */


function ask(session, response, text) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.ask(response, text);
	});
}

function tell(session, response, text) {
	saveUserData(session, response, function successCallback() {
		removeSessionRequest(session);
		speech.tell(response, text)
	});
}

function logVariable(prefix, variable) {
	console.log(prefix + ": " + JSON.stringify(variable));
}

/* ================== */
/* EXECUTE FUNKTIONEN */
/* ================== */

function executeFirstTimeLaunch(session, response) {
	ask(session, response, "Willkommen zum ersten Mal. Hier ist eine Einführung. Fertig. Was möchtest Du jetzt tun?");
}

function executeLaunch(session, response) {
	ask(session, response, "Willkommen zurück, Was möchtest Du jetzt tun?");
}

function executeSagHalloIntent(session, response) {
	tell(session, response, "Halli, Hallo!");
}

function executeAddiereZahlenIntent(session, response, zahlA, zahlB) {
	logVariable("Zahl A", zahlA);
	logVariable("Zahl B", zahlB);
	tell(session, response, "Das weiss ich doch nicht!");
}




