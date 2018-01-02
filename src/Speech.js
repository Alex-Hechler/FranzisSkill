/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

 
var messages;
var cardTitle;


var currentLocale = "?";

//https://developer.amazon.com/de/docs/custom-skills/develop-skills-in-multiple-languages.html
function set_locale(locale) {

	if (currentLocale != locale) {
		if (locale === undefined) {
			locale = "en-US";
		}
		if (locale.startsWith("de")) {

			cardTitle = "Carballo-Schach Skill";
			messages = {
					
				SEND_getOrCreateUserByAppAndName: {
					E_DB_ERROR: {
						speechOut: "Bei der Abfrage der Benutzerdatenbank ist ein Fehler aufgetreten.",
						display: "Bei der Abfrage der Benutzerdatenbank ist ein Fehler aufgetreten."
					}
				},
				
				SEND_connect: {
					S_OK: { 
						speechOut: "Du bist am Zug. welchen Zug machst Du?",
						display :  "Du bist am Zug. welchen Zug machst Du?"
					}
				},
				
				SEND_connectImage: {
					"E_IMAGE_NOT_FOUND": { 
						speechOut: "Das Tier ist nicht zu sehen, versuche es noch einmal oder mache einen Zug.",
						display :  "Das Tier ist nicht zu sehen, versuche es noch einmal oder mache einen Zug."
					},
					"E_INVALID_PARAMETER": { 
						speechOut: "Du musst den Namen des Tiers sagen, das auf der Webseite calcbox.de zu sehen ist, versuche es noch einmal oder mache einen Zug.",
						display :  "Du musst den Namen des Tiers sagen, das auf der Webseite https://calcbox.de zu sehen ist, versuche es noch einmal oder mache einen Zug."
					},
				},
				
				SEND_doMove: {
					"E_INVALID_PARAMETER": { 
						speechOut: "Bitte wiederhole den Zug, ich habe %1 verstanden.",
						display :  "Bitte wiederhole den Zug, ich habe %1 verstanden."
					},
					"E_INVALID_RANGE": { 
						speechOut: "Der Zug %1 ist nicht gültig, welchen Zug möchteste du machen?",
						display :  "Der Zug %1 ist nicht gültig, welchen Zug möchteste du machen?"
					},
					"E_INVALID_MOVE": { 
						speechOut: "Der Zug %1 ist nicht erlaubt, welchen Zug möchteste du machen?",
						display :  "Der Zug %1 ist nicht erlaubt, welchen Zug möchteste du machen?"
					}
					
				},
				
				SEND_setAILevel: {
					"E_INVALID_PARAMETER": { 
						speechOut: "Ich habe die Spielstärke nicht richtig verstanden. Du bist am Zug.",
						display :  "Ich habe die Spielstärke nicht richtig verstanden. Du bist am Zug."
					},
					"E_INVALID_RANGE": { 
						speechOut: "Die Spielstärke muss eine Zahl von 1 bis 7 sein. Du bist am Zug.",
						display :  "Die Spielstärke muss eine Zahl von 1 bis 7 sein. Du bist am Zug."
					}
				},
				
				TEXT: {
					HELP: {
						title:     	"Carballo-Schach Schnellhilfe",
						richText:   "Hier die Kurzhilfe: <br/><br/>" +
									"Du kannst eines der Kommandos <br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich ziehe von ... nach ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop' verwenden. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Hier die Kurzhilfe: " +
						   			"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', Ich ziehe von - nach, 'Du darfst anfangen', 'Setze die Spielstärke auf' oder Stop verwenden. " + 
						   			"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Hier die Kurzhilfe: " +
									"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich ziehe von ... nach ...', 'Du darfst anfangen', 'Setze die Spielstärke auf ...' oder 'Stop' verwenden. " + 
									"Möchtest Du eine ausführliche Anleitung?"
					},
					
					ActionHELP: {
						title:     	"Carballo-Schach Hilfe",
						richText:   "<font size='5'>Wähle ein Thema:<br/>" +
									"<br/>" +
									"<action token='ActionHELP_REGELN'>Regeln</action><br/>" +
									"<action token='ActionHELP_SPRACHSTEUERUNG'>Sprachsteuerung</action><br/>" +
									"<action token='ActionHELP_KOMMANDOS'>Kommandos</action><br/>" +
									"<action token='ActionHELP_WEITERES'>Weiteres</action><br/>" +
									"<br/>" +
									"Zurück zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_REGELN: {
						title:     	"Carballo-Schach Regeln",
						richText:   "<font size='3'>" +
									"Es wird nach den ganz normalen Schach Regeln gespielt. Da die Anzeige aber immer nur 30 Sekunden angezeigt wird, hat das ganze am ehesten den Character einer Partie Blitzschach. Auch Alexas Denkzeit ist auf 5 Sekunden begrenzt.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_SPRACHSTEUERUNG: {
						title:     "Carballo-Schach Sprachsteuerung",
						richText:  "<font size='2'>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font><br/>" +
									"<br/>" +
								    "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								    "Sage dazu entweder 'Ich ziehe von ... nach ...' oder 'Du darfst anfangen'. " +
								    "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								    "Wenn Du sofort antwortest, dann kannst Du einfach '... nach ...' sagen. " +
								    "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								    "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								    "Also  zum Beispiel 'Alexa, ich ziehe von E2 nach E4'. " +
								    "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								    "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								    "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet.", 
						speechOut: ""
					},
					ActionHELP_KOMMANDOS: {
						title:     "Carballo-Schach Sprachkommandos",
						richText:  "<font size='3'>" +
								   "'Hilfe': Starte die Hilfe.<br/>" +
								   "'Starte ein neues Spiel': bricht das aktuelle Spiel ab und startet ein neues.<br/>" +
								   "'Setze die Spielstärke auf ...': ändert die Spielstärke (AI) von Alexa. 1 ist am leichtesten und 7 am schwersten.<br/>" +
								   "'Du darfst anfangen': lässt Alexa den ersten Zug machen.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					ActionHELP_WEITERES: {
						title:     "Carballo-Schach Weiteres",
						richText:  "<font size='3'>" +
								   "Links oben in der Anzeige wird die aktulle Zugzahl und die Spielstärke (AI) angezeigt.<br/>" +
								   "<br/>" +
								   "Ein Hinweis noch zum Schluss: <br/>" +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com.<br/></font>" +
									"<font size='2'><br/>" +
									"Zurück zur <action token='ActionHELP'>Themenwahl</action> oder zum <action token='ActionHOME'>Spiel</action></font>",
						speechOut: ""
					},
					
					
					INTRO: {   		// Allererste Begrüßung, danach nie wieder.   
						title:     	"Willkommen zum Spiel 'Carballo-Schach'",
						richText:   "Das Spiel kann mit den folgenden Kommandos gesteuert werden: <br/><br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich ziehe von ... nach ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Nimm meinen letzten Zug zurück', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop'. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Willkommen zum Spiel Carballo-Schach: " +
									"Das Spiel kann mit den folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', Ich ziehe von - nach, 'Du darfst anfangen', 'Nimm meinen letzten Zug zurück', 'Setze die Spielstärke auf' oder Stop. " + 
									"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Willkommen zum Spiel 'Carballo-Schach': " +
									"Das Spiel kann mit den folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', 'Ich ziehe von ... nach ...', 'Du darfst anfangen', 'Nimm meinen letzten Zug zurück', 'Setze die Spielstärke auf ...' oder 'Stop'. " + 
									"Möchtest Du eine ausführliche Anleitung?"
					},

					"INTRO.1": {
						title:     	"Willkommen zum Spiel 'Carballo-Schach'",
						richText:   "Fragen zum ersten Start des Skills. <br/><br/>" +
									"Anzeige: <br/>" +
									"Es gibt zwei Modi: Standard oder Optimiert für Echo Show. <br/><br/>" +
									"Spielst Du Carballo-Schach auf einem Echo Show? ",
						speechOut:  "Willkommen zum Spiel Carballo-Schach: " +
									"Da Du das Spiel das erste Mal startest, werde ich Dir ein paar Fragen stellen, " + 
									"um das Spiel an Deine Wünsche anzupassen. " + 
									"Du kannst Diese Einstellungen später jederzeit wieder ändern, " + 
									"indem Du das Kommando 'Ändere die Einstellungen' aufrufst. " + 
									"Aber nun zu den Fragen. " + 
									"Die Anzeige: " + 
									"Es gibt zwei Modi für die Anzeige. " + 
									"Die standard Anzeige und eine Anzeige, die für das Gerät Echo Show optimiert wurde. " + 
									"Spielst Du Carballo-Schach auf einem Echo Show? " + 
									"Bitte antworte mit 'Ja' oder 'Nein'. ",
						display:   	"Willkommen zum Spiel Carballo-Schach: " +
									"Da Du das Spiel das erste mal startest, werde ich Dich ein paar Fragen stellen, " + 
									"um das Spiel an Deine Wünsche anzupassen. " + 
									"Du kannst Diese Einstellungen später jederzeit wieder ändern, " + 
									"indem Du das Kommando \'Ändere die Einstellungen\' aufrufest. " + 
									"Aber nun zu den Fragen, " + 
									"Die Anzeige: " + 
									"Es gibt zwei Modi für die Anzeige. " + 
									"Die Standardanzeige und eine Anzeige, die für das Geräte Echo Show optimiert wurde. " + 
									"Spielst Du Carballo-Schach auf einem Echo Show? " + 
									"Bitte antworte mit 'Ja' oder 'Nein'. "
					},
					"INTRO.2": {
						title:     	"Einstellungen Spielstärke",
						richText:   "Spielstärke: <br/>" +
									"Die Bedenkzeit (Spielstärke) kann von 1 bis 7 Sekunden eingestellt werden. " + 
									"Gegen welche Spielstärke möchtest Du spielen? ",
						speechOut:  "Nun zur Spielstärke: " + 
									"Die Spielstärke von Alexa hängt von der Bedenkzeit ab. " + 
									"Die Bedenkzeit kann von 1 bis 7 Sekunden eingestellt werden. " + 
									"Gegen welche Spielstärke möchtest Du spielen? " + 
									"Sage eine Zahl zwischen 1 und 7.",
						display:   	"Nun zur Spielstärke: " + 
									"Die Spielstärke von Alexa hängt von der Bedenkzeit ab. " + 
									"Die Bedenkzeit kann zwischen 1 und 7 Sekunden eingestellt werden. " + 
									"Gegen welche Spielstärke möchtest Du spielen? " + 
									"Sage eine Zahl zwischen 1 und 7.",
					},
					"INTRO.2b": {
						title:     	"Einstellungen Spielstärke",
						richText:   "Spielstärke: <br/>" +
									"Die Bedenkzeit (Spielstärke) kann von 1 bis 7 Sekunden eingestellt werden. " + 
									"Gegen welche Spielstärke möchtest Du spielen? ",
						speechOut:  "Das war leider kein gültiger Wert für die Spielstärke. " + 
									"Sage eine Zahl zwischen 1 und 7.",
						display:   	"Das war leider kein gültiger Wert für die Spielstärke. " + 
									"Sage eine Zahl zwischen 1 und 7.",
					},
					"INTRO.3": {
						title:     	"Befehlsübersicht Carballo-Schach",
						richText:   "Das Spiel kann mit den folgenden Kommandos gesteuert werden: <br/><br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich ziehe von ... nach ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Nimm meinen letzten Zug zurück', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop'. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut:  "Noch ein Hinweis zu den Zügen: " + 
									"Da die Spracherkennung Probleme mit der Unterscheidung der Buchstaben Be und Deh hat, " + 
									"kann alternativ auch das Buchstabieralphabet verwendet werden. " + 
									"Also zum Beispiel 'Ich ziehe von Berta 1 nach Dora 2' statt Be-1 nach De-2 ." +
									"Das Spiel kann mit den folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', Ich ziehe von - nach, 'Du darfst anfangen', 'Nimm meinen letzten Zug zurück', 'Setze die Spielstärke auf' oder Stop. " + 
									"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Noch ein Hinweis zu den Zügen: " + 
									"Da die Spracherkennung Probleme mit der Unterscheidung der Buchstaben Be und De hat, " + 
									"kann alternativ auch das Buchstabieralphabet verwendet werden. " + 
									"Also zum Beispiel 'Ich ziehe von Berta 1 nach Dora 2' statt B1 nach D2 ." +
									"Das Spiel kann mit den folgenden Kommandos gesteuert werden: 'Hilfe', 'Starte ein neues Spiel', 'Ich ziehe von ... nach ...', 'Du darfst anfangen', 'Nimm meinen letzten Zug zurück', 'Setze die Spielstärke auf ...' oder 'Stop'. " + 
									"Möchtest Du eine ausführliche Anleitung?"
						
					},
					
					WELCOME: {		// Begrüßung, wenn kein Spiel fortgesetzt wird
						title:     	"Willkommen zum Spiel 'Carballo-Schach'",
						richText:   "Das Spiel kann mit den folgenden Kommandos gesteuert werden: <br/><br/>" +
									" * 'Hilfe', <br/>" +
									" * 'Starte ein neues Spiel', <br/>" +
									" * 'Ich ziehe von ... nach ...', <br/>" +
									" * 'Du darfst anfangen', <br/>" +
									" * 'Nimm meinen letzten Zug zurück', <br/>" +
									" * 'Setze die Spielstärke auf ...' oder <br/>" +
									" * 'Stop'. <br/><br/>" + 
									"Möchtest Du eine ausführliche Anleitung?",
						speechOut: "Willkommen zum Spiel Carballo-Schach: " +
									"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Willkommen zum Spiel 'Carballo-Schach': " +
									"Möchtest Du eine ausführliche Anleitung?"
					},
					
					HELP_DETAIL: { // Ausführliche Hilfe nach INTRO oder WELCOME
						title:     "Carballo-Schach Hilfe",
						richText:  "Zuerst zur Sprachsteuerung: <br/>" +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich ziehe E2 nach E4' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'D2 nach D4' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deinen Zug noch das Aktivierungswort setzen, also  zum Beispiel 'Alexa, D2 nach D4'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. <br/><br/>" +

								   "Zu den Zügen: <br/>" +
								   "Da die Spracherkennung Probleme mit der Unterscheidung der Buchstaben 'B', 'D' hat, kann alternativ auch das Buchstabieralphabet verwendet werden. " +
								   "Also zum Beispiel 'Ich ziehe von Berta 1 nach Dora 2'. <br/><br/>" +

								   "Jetzt zur Anzeige: <br/>" +
								   "Es gibt zwei Modi für die Anzeige: Entweder optimiert für das Echo Show oder die Standardanzeige. " +
								   "Wenn Du Carballo-Schach auf einem Echo Show spielst, dann solltest Du auf die Anzeige für Echo Show umschalten. " +
								   "Dies kannst Du mit dem Kommando 'Optimiere die Anzeige für Echo Show' mache. " +
								   "Um wieder zurückzuschalten sage 'Verwende die Standardanzeige'. <br/><br/>" +
								   
								   "Und nun zu den weiteren Kommandos: <br/>" +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. <br/>" +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. <br/>" +
								   "Mit dem Kommando 'Nimm meinen letzten Zug zurück' kannst Du Deinen letzten Zug zurücknehmen. <br/>" +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. <br/><br/>" +
								   
								   "Ein Hinweis noch zum Schluss: <br/>" +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. <br/><br/>" +
								   
								   "Soll ich den Text nochmal wiederholen?",
						speechOut: "Zuerst zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder Ich ziehe E2 nach E4 oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach D2 nach D4 sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deinen Zug noch das Aktivierungswort setzen, also  zum Beispiel Alexa, D2 nach D4. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit: 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Zu den Zügen: " +
								   "Da die Spracherkennung Probleme mit der Unterscheidung der Buchstaben Be und De hat, kann alternativ auch das Buchstabieralphabet verwendet werden. " +
								   "Also zum Beispiel 'Ich ziehe von Berta 1 nach Dora 2'. " +

								   "Jetzt zur Anzeige: <br/>" +
								   "Es gibt zwei Modi für die Anzeige: Entweder optimiert für das Echo Show oder die Standardanzeige. " +
								   "Wenn Du Carballo-Schach auf einem Echo Show spielst, dann solltest Du auf die Anzeige für Echo Show umschalten. " +
								   "Dies kannst Du mit dem Kommando 'Optimiere die Anzeige für Echo Show' machen. " +
								   "Um wieder zurückzuschalten sage 'Verwende die Standardanzeige'. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Nimm meinen letzten Zug zurück' kannst Du Deinen letzten Zug zurücknehmen. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "Zuerst zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich ziehe E2 nach E4' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'D2 nach D4' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deinen Zug noch das Aktivierungswort setzen, also  zum Beispiel 'Alexa, D2 nach D4'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. <br/><br/>" +
		
								   "Zu den Zügen: " +
								   "Da die Spracherkennung Probleme mit der Unterscheidung der Buchstaben 'B', 'D' hat, kann alternativ auch das Buchstabieralphabet verwendet werden. " +
								   "Also zum Beispiel 'Berta 1 nach Dora 2'. " +
		
								   "Jetzt zur Anzeige: " +
								   "Es gibt zwei Modi für die Anzeige: Entweder optimiert für das Echo Show oder die Standardanzeige. " +
								   "Wenn Du Carballo-Schach auf einem Echo Show spielst, dann solltest Du auf die Anzeige für Echo Show umschalten. " +
								   "Dies kannst Du mit dem Kommando 'Optimiere die Anzeige für Echo Show' mache. " +
								   "Um wieder zurückzuschalten sage 'Verwende die Standardanzeige'. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Nimm meinen letzten Zug zurück' kannst Du Deinen letzten Zug zurücknehmen. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?"
					},
					HELP_REGELN_NOGUI: {
						speechOut: "ZZZ Zuerst die Regeln: " +
								   "Beim Spiel Carballo-Schach spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Anzeige: " +
								   "Dein Gerät unterstützt keine Bildschirmanzeige. Du kannst Dir das Spielfeld aber auf der Webseite calcbox.de anzeigen lassen. " +
								   "Rufe dazu die Webseite auf und befolge die Anweisungen dort. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder: 'Ich werfe in Reihe punkt punkt punkt' oder: 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe punkt punkt punkt' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort. " +
								   "Das macht aber nichts, Du kannst das Spiel fortsetzen indem Du den Skill neu startest mit 'Alexa starte Schach'. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text vorlesen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "ZZZ Zuerst die Regeln: " +
								   "Beim Spiel Carballo-Schach spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Anzeige: " +
								   "Dein Gerät unterstützt keine Bildschirmanzeige. Du kannst Dir das Spielfeld aber auf der Webseite https://calcbox.de anzeigen lassen. " +
								   "Rufe dazu die Webseite auf und befolge die Anweisungen dort. " +
								   
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort. " +
								   "Das macht aber nichts, Du kannst das Spiel fortsetzen indem Du den Skill neu startest mit 'Alexa starte Schach'. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext vorlesen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?"
					},
				},
				
				INTERN: {
					NO_AMZ_USERID: {
						speechOut: "Der Request enthält keine User-ID.",
						display: "Der Request enthält keine User-ID."
					},
					INVALID_USERDATA: {
						speechOut: "Die Benutzerdaten sind nicht lesbar.",
						display: "Die Benutzerdaten sind nicht lesbar."
					},
					YOUR_MOVE: {
						speechOut: "welchen Zug machst Du?",
						display: "welchen Zug machst Du?"
					},
					AI_LEVEL_CHANGED: {
						speechOut: "Die Spielstärke wurde auf %1 gesetzt.",
						display: "Die Spielstärke wurde auf %1 gesetzt."
					},
					MAKE_YOUR_MOVE: {
						speechOut: "Welchen Zug machst Du?",
						display: "Welchen Zug machst Du?"
					},
					LAST_MOVE_ROLLEDBACK: {
						speechOut: "Dein letzter Zug wurde zurück genommen. Welchen Zug machst Du jetzt?",
						display: "Dein letzter Zug wurde zurück genommen. Welchen Zug machst Du jetzt?"
					},
					OPT_SHOW_ACTIVATED: {
						speechOut: "Die Anzeige ist jetzt für die Darstellung auf dem Echo Show optimiert.",
						display: "Anzeige für Echo Show."
					},
					OPT_SHOW_DEACTIVATED: {
						speechOut: "Anzeige auf Standard geschaltet.",
						display: "Anzeige auf Standard geschaltet."
					},
					ANIMAL_CONNECTED: {
						speechOut: "Du hast Dich erfolgreich mit der Webseite verbunden. welchen Zug machst Du?",
						display: "Du hast Dich erfolgreich mit der Webseite verbunden. welchen Zug machst Du?"
					},
					NEW_GAME_STARTED: {
						speechOut: "Es wurde ein neues Spiel gestartet. welchen Zug machst Du?",
						display: "Es wurde ein neues Spiel gestartet. welchen Zug machst Du?"
					},
					GAME_CONTINUED: {
						speechOut: "Dein letztes Spiel wird fortgesetzt, welchen Zug machst Du?",
						display: "Dein letztes Spiel wird fortgesetzt, welchen Zug machst Du?"
					},
					HELP: {
						speechOut: "Hier die Kurzhilfe: " +
						   			"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst Anfangen', 'Setze die Spielstärke auf' oder 'Stop' verwenden. " + 
						   			"Möchtest Du eine ausführliche Anleitung?",
						display:   	"Hier die Kurzhilfe: " +
									"Du kannst eines der Kommandos 'Hilfe', 'Starte ein neues Spiel', 'Ich werfe in Reihe', 'Du darfst Anfangen', 'Setze die Spielstärke auf' oder 'Stop' verwenden. " + 
									"Möchtest Du eine ausführliche Anleitung?",
					},
					INTRO: {
						speechOut: 	"Willkommen zum Carballo-Schach Skill. Möchtest Du eine Einleitung zur Verwendung dieses Skills bekommen?",
						display: 	"Möchtest Du eine Einleitung zur Verwendung dieses Skills bekommen?"
					},
					HELP_REGELN: {
						speechOut: "XXX Zuerst die Regeln: " +
								   "Beim Spiel Carballo-Schach spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder: 'Ich werfe in Reihe punkt punkt punkt' oder: 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe punkt punkt punkt' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also zum Beispiel: 'Alexa, Reihe punkt punkt punkt'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit: 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfe Text anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf punkt punkt punkt' kannst Du die Spielstärke von Alexa ändern. 1 ist dabei am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
								   
						display:   "XXX Zuerst die Regeln: " +
								   "Beim Spiel Carballo-Schach spielen zwei Spieler gegeneinander, indem sie abwechselnd Steine in eine der 7 Reihen werfen. " +
								   "Ziel des Spieles ist es eine Reihe (horizontal, vertikal oder diagonal) von vier Steinen zu bekommen. " +
								   "Sind alle Reihen belegt, ohne dass eine vierer Reihe gebildet wurde, dann endet das Spiel unentschieden. " +
								   
								   "Jetzt zur Sprachsteuerung: " +
								   "Wenn ein neues Spiel startet, kannst Du entscheiden, ob Du anfangen möchtest, oder ob Alexa beginnen soll. " +
								   "Sage dazu entweder 'Ich werfe in Reihe ...' oder 'Du darfst anfangen'. " +
								   "Nach Deinem Zug macht Alexa ihren Zug und wartet sofort auf eine Antwort von Dir. " +
								   "Wenn Du sofort antwortest, dann kannst Du einfach 'Reihe ...' sagen. " +
								   "Allerdings wartet die Spracherkennung nur kurz auf Deine Antwort, danach wird nur noch das Spielfeld angezeigt. " +
								   "Dann musst Du vor Deine Antwort noch das Aktivierungswort setzen, meist 'Alexa'. " +
								   "Also  zum Beispiel 'Alexa, Reihe ...'. " +
								   "Wenn auch das Spielfeld nicht mehr angezeigt wird, dann muss der Skill neu mit 'Alexa starte Schach' zuerst wieder gestartet werden. " +
								   "Das Spiel wird dann an der Stelle fortgesetzt, an der es zuletzt beendet wurde. " +
								   "Wird ein Spiel nach 4 Stunden nicht fortgesetzt, so wird es automatisch beendet. " +
								   
								   "Und nun zu den weiteren Kommandos: " +
								   "Mit dem Kommando 'Hilfe' kannst Du Dir jederzeit den Hilfetext anzeigen lassen. " +
								   "Mit dem Kommando 'Starte ein neues Spiel' kannst Du das aktuelle Spiel abbrechen und ein neues Spiel starten. " +
								   "Mit dem Kommando 'Setze die Spielstärke auf ...' kannst Du die Spielstärke von Alexa ändern. 1 ist am leichtesten und 7 am schwersten. " +
								   
								   "Ein Hinweis noch zum Schluss: " +
								   "Jede Form von Verbesserungsvorschlägen, Lob oder Kritik ist willkommen, am einfachsten per Mail an ferenc.hechler@gmail.com. " +
								   
								   "Soll ich den Text nochmal wiederholen?",
					},
					DID_NOT_UNDERSTAND: {
						speechOut: "Ich verstehe Deine Antwort nicht, Sage Hilfe um die Steuerung dieses Skills kennen zu lernen.",
						display: "Sage 'Hilfe' um eine Hilfe zu erhalten. "
					},
					CHANGE_SETTINGS: {
						speechOut: "Du kannst die Spielstärke mit dem Kommando 'Setze die Spielstärke auf' und der Angabe eines Wertes von 1 bis 7 ändern.",
						display: "Sage 'Setze die Spielstärke auf ... (1..7)'. "
					},
					AI_STARTS_NOT_ALLOWED: {
						speechOut: "Die Seiten können nur vor dem ersten Zug gewechselt werden. welchen Zug machst Du?",
						display: "Die Seiten können nur vor dem ersten Zug gewechselt werden. welchen Zug machst Du?"
					},
					NOT_YES_NO_ANSWER: {
						speechOut: "Das war keine Antwort auf meine Frage, ich werte das jetzt mal als 'Nein'. welchen Zug machst Du?",
						display: "Das war keine Antwort auf meine Frage, ich werte das jetzt mal als 'Nein'. welchen Zug machst Du?"
					},
					NO_ANSWER_TO_QUESTION: {
						speechOut: "Das war keine Antwort auf meine Frage.",
						display: "Das war keine Antwort auf meine Frage."
					},
					NO_QUESTION_ASKED: {
						speechOut: "Ich hatte keine Ja/Nein Frage gestellt. welchen Zug machst Du?",
						display: "Ich hatte keine Ja/Nein Frage gestellt. welchen Zug machst Du?"
					}
				},
				
				STATUS: {
					PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, Du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, Du hast gewonnen."
					},
					DRAW: { 
						speechOut: "Das Spiel endet unentschieden.",
						display :  "Das Spiel endet unentschieden."
					},
					AI_PLAYER_WINS: { 
						speechOut: "Ich habe gewonnen.",
						display :  "Ich habe gewonnen."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "Welchen Zug machst Du?",
						display :  "Welchen Zug machst Du?"
					}
				},
				
				STATUS_AIMOVE: {
					PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, Du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, Du hast gewonnen."
					},
					DRAW: { 
						speechOut: "Ich ziehe %1, das Spiel endet unentschieden.",
						display :  "Ich ziehe %1, das Spiel endet unentschieden."
					},
					AI_PLAYER_WINS: { 
						speechOut: "Ich ziehe %1 und habe gewonnen.",
						display :  "Ich ziehe %1 und habe gewonnen."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "Ich ziehe %1, welchen Zug machst Du?",
						display :  "Ich ziehe %1, welchen Zug machst Du?"
					}
				},
				
				HINT: {
					PLAYER_WINS: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					DRAW: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					AI_PLAYER_WINS: { 
						speechOut: "starte ein neues Spiel.",
						display :  "starte ein neues Spiel."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "ich werfe in Reihe ...",
						display :  "ich werfe in Reihe ..."
					}
				},
				
				PlayerMoveIntent: {
					S_PLAYER_WINS: { 
						speechOut: "Herzlichen Glückwunsch, du hast gewonnen.",
						display :  "Herzlichen Glückwunsch, du hast gewonnen."
					},
					S_DRAW: { 
						speechOut: "Das Spiel endet unentschieden.",
						display :  "Das Spiel endet unentschieden."
					},
					S_OK: { 
						speechOut: "Ich werfe in Reihe %1.",
						display :  "Ich werfe in Reihe %1."
					},
					S_AI_PLAYER_WINS: { 
						speechOut: "Ich werfe in Reihe %1 und gewinne.",
						display :  "Ich werfe in Reihe %1 und gewinne."
					},
					S_AI_DRAW: { 
						speechOut: "Ich werfe in Reihe %1 und es ist unentschieden.",
						display :  "Ich werfe in Reihe %1 und es ist unentschieden."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Reihe nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Reihe nicht verstanden. Sage eine Zahl von 1-7."
					},
					E_INVALID_MOVE: {
						speechOut: "In diese Reihe kann kein Stein mehr geworfen werden",
						display :  "In diese Reihe kann kein Stein mehr geworfen werden."
					},
					E_GAME_FINISHED: { 
						speechOut: "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: Starte ein neues Spiel.",
						display :  "Das Spiel ist zu ende. Um ein neues Spiel zu starten sage: 'Starte ein neues Spiel'"
					}

				},
				
				SetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke wurde auf %1 gesetzt. Du bist am Zug.",
						display :  "Die Spielstärke wurde auf %1 gesetzt. Du bist am Zug."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Die Spielstärke muss eine Zahl von 1 bis 7 sein. welchen Zug machst Du?",
						display :  "Die Spielstärke muss eine Zahl von 1 bis 7 sein. welchen Zug machst Du?"
					},
				}, 
				
				GetAILevelIntent: {
					S_OK: { 
						speechOut: "Die Spielstärke steht auf %1.",
						display :  "Die Spielstärke steht auf %1."
					}
				},
				
			    "AMAZON.StopIntent": {
			    	"*": {
			    		speechOut: "Auf wiederhören, bis zum nächsten Mal.", 
			    		display :  "Auf wiederhören, bis zum nächsten Mal."
			    	}
			    },
			    
				Generic: {
					E_UNKNOWN_ERROR: {
						speechOut: "Es ist ein unerwarteter Fehler aufgetreten.",
						display: "Es ist ein unerwarteter Fehler aufgetreten.",
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel.",
						display:   "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel." 
					},
					E_GAME_FINISHED: { 
						speechOut: "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel.",
						display:   "Das Spiel wurde auf dem Server beendet. Starte bitte ein neues Spiel." 
					},
					E_CONNECT: { 
						speechOut: "Es gibt Verbindungsprobleme zum Server.",
						display:   "Es gibt Verbindungsprobleme zum Server." 
					},
					E_MISSING: { 
						speechOut: "Sorry, es fehlt die Sprachausgabe für Intent-code %1 .",
						display:   "Sorry, es fehlt die Sprachausgabe für Intent-code %1 ." 
					},
					E_QUESTION: { 
						speechOut: "Sorry, es fehlt der Handler für den Frage-code %1 .",
						display:   "Sorry, es fehlt der Handler für den Frage-code '%1'." 
					}

				}
			}
			
		}
		else {  // local "en"
		
			cardTitle = "Connect-Four skill";
			messages = {
					
				SEND_getOrCreateUserByAppAndName: {
					E_DB_ERROR: {
						speechOut: "An error occurred while querying the user database.",
						display: "An error occurred while querying the user database."
					}
				},
				
				SEND_connect: {
					S_OK: { 
						speechOut: "It's your turn. Into which slot do you throw a disc?",
						display :  "It's your turn. Into which slot do you throw a disc?"
					}
				},
				
				SEND_connectImage: {
					E_IMAGE_NOT_FOUND: { 
						speechOut: "This is the wrong animal, try again or throw a disc into a slot.",
						display :  "This is the wrong animal, try again or throw a disc into a slot."
					},
					"E_INVALID_PARAMETER": { 
						speechOut: "You have to say the name of the animal, which you can see on the website calcbox.de. Try again or throw a disc into a slot.",
						display :  "You have to say the name of the animal, which you can see on the website https://calcbox.de . Try again or throw a disc into a slot."
					},
				},
				
				SEND_doMove: {
					"E_INVALID_PARAMETER": { 
						speechOut: "I did not understand the number of the slot to throw your disc into, please try again.",
						display :  "I did not understand the number of the slot to throw your disc into, please try again."
					},
					"E_INVALID_RANGE": { 
						speechOut: "Please repeat the number of the slot. It must be between 1 and 7.",
						display :  "Please repeat the number of the slot. It must be between 1 and 7."
					}
				},
				
				SEND_setAILevel: {
					"E_INVALID_PARAMETER": { 
						speechOut: "I did not understand the playing skill level. It's your turn.",
						display :  "I did not understand the playing skill level. It's your turn."
					},
					"E_INVALID_RANGE": { 
						speechOut: "The playing skill level has to be a number between 1 and 7. It's your turn.",
						display :  "The playing skill level has to be a number between 1 and 7. It's your turn."
					}
				},
				
				TEXT: {
					HELP: {
						title:     	"Connect-Four Short Help",
						richText:   "Here the Short-Help: <br/><br/>" +
									"You can use the following commands: <br/>" +
									" * 'Help', <br/>" +
									" * 'Start a new game', <br/>" +
									" * 'I throw into slot ...', <br/>" +
									" * 'You may start', <br/>" +
									" * 'Set playing skill level to ...' <br/>" +
									" * 'Stop' <br/><br/>" + 
									"Do you want a detailed help?",
						speechOut: "Here the short help: " +
						   			"You can use the following commands: 'Help', 'Start a new game', 'I throw into slot X', 'You may start', 'Set playing skill level to X' or Stop. " + 
						   			"Do you want a detailed help?",
						display:   	"Here the Short-Help: " +
									"You can use the following commands: 'Help', 'Start a new game', 'I throw into slot ...', 'You may start', 'Set playing skill level to ...' or 'Stop'. " + 
									"Do you want a detailed help?"
					},
					
					ActionHELP: {
						title:     	"Connect-Four Help",
						richText:   "<font size='5'>Choose a topic:<br/>" +
									"<br/>" +
									"<action token='ActionHELP_REGELN'>Rules</action><br/>" +
									"<action token='ActionHELP_SPRACHSTEUERUNG'>Voice Control</action><br/>" +
									"<action token='ActionHELP_KOMMANDOS'>Commands</action><br/>" +
									"<action token='ActionHELP_WEITERES'>Others</action><br/>" +
									"<br/>" +
									"back to <action token='ActionHOME'>GAME</action></font>",
						speechOut: ""
					},
					ActionHELP_REGELN: {
						title:     	"Connect-Four Rules",
						richText:   "<font size='3'>" +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw.<br/></font>" +
									"<font size='2'><br/>" +
									"Back to <action token='ActionHELP'>Topics</action> or to <action token='ActionHOME'>GAME</action></font>",
						speechOut: ""
					},
					ActionHELP_SPRACHSTEUERUNG: {
						title:     "Connect-Four Voice Control",
						richText:  "<font size='2'>" +
									"back to <action token='ActionHELP'>Topics</action> or to <action token='ActionHOME'>GAME</action></font><br/>" +
									"<br/>" +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot ...'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot ...'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, Slot ...'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically.",
						speechOut: ""
					},
					ActionHELP_KOMMANDOS: {
						title:     "Connect-Four Commands",
						richText:  "<font size='3'>" +
								   "'Help': Starts the help.<br/>" +
								   "'Start a new game': quits the current game and starts a new one.<br/>" +
								   "'Set playing skill level to ...': changes the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult.<br/>" +
								   "'You may start': Lets Alexa make the first move.<br/></font>" +
									"<font size='2'><br/>" +
									"Back to <action token='ActionHELP'>Topics</action> or ot <action token='ActionHOME'>GAME</action></font>",
						speechOut: ""
					},
					ActionHELP_WEITERES: {
						title:     "Connect-Four Others",
						richText:  "<font size='3'>" +
								   "In the upper left corenr the current move and the playing skill level (AI) is shown.<br/>" +
								   "<br/>" +
								   "One hint at the end: <br/>" +
								   "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com.<br/></font>" +
									"<font size='2'><br/>" +
									"Back to <action token='ActionHELP'>Topics</action> or to <action token='ActionHOME'>GAME</action></font>",
						speechOut: ""
					},
					
					INTRO: {
						title:     	"Welcom to the Game 'Connect-Four'",
						richText:   "The game can be played using the following commands: <br/><br/>" +
									" * 'Help', <br/>" +
									" * 'Start a new game', <br/>" +
									" * 'I throw into slot ...', <br/>" +
									" * 'You may start', <br/>" +
									" * 'Set playing skill level to ...' <br/>" +
									" * 'Stop' <br/><br/>" + 
									"Do you want a detailed help?",
						speechOut: "Welcome to the game Connect-Four: " +
									"The game can be played using the following commands: 'Help', 'Start a new game', 'I throw into slot', 'You may start', 'Set playing skill level to' or Stop. " + 
									"Do you want a detailed help?",
						display:   	"Welcome to the game 'Connect-Four': " +
									"The game can be played using the following commands: 'Help', 'Start a new game', 'I throw into slot ...', 'You may start', 'Set playing skill level to ...' or 'Stop'. " + 
									"Do you want a detailed help?"
					},
					
					WELCOME: {
						title:     	"Welcome to the game 'Connect-Four'",
						richText:   "The game can be played using the following commands: <br/><br/>" +
									" * 'Help', <br/>" +
									" * 'Start a new game', <br/>" +
									" * 'I throw into slot ...', <br/>" +
									" * 'You may start', <br/>" +
									" * 'Set playing skill level to ...' <br/>" +
									" * 'Stop' <br/><br/>" + 
									"Do you want a detailed help?",
						speechOut: "Welcome to the game Connect-Four: " +
									"Do you want a detailed help?",
						display:   	"Welcome to the game 'Connect-Four': " +
									"Do you want a detailed help?"
					},
					
					HELP_REGELN: {
						title:      "Connect-Four Help",
						richText:   "Lets start with the rules: <br/>" +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. <br/><br/>" +
								   
									"Now to the voice control: <br/>" +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot ...'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot ...'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, Slot ...'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. <br/><br/>" +
								    
					   
								    "And now to other commands: <br/>" +
								    "With the command 'Help' you get a help text at any time. <br/>" +
								    "With the command 'Start a new game' you can quit the current game and start a new one. <br/>" +
								    "With the command 'Set playing skill level to ...' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. <br/><br/>" +

								    "One hint at the end: <br/>" +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. <br/><br/>" +
								   
								    "Shall I repeat the Text?",
								    
						speechOut:  "Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot  X'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot  X'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, Slot  X'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
								    
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to  X' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
			
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?",
								   
						display:	"Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot ...'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot ...'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, Slot ...'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
								    
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to ...' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
		
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?"
							
					},
					HELP_REGELN_NOGUI: {
						speechOut:  "Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the display: " +
									"Your device does not support a display. But you can see the game board on the website calcbox.de. " +
									"Open this website and follow the instructions. " +
								    
								    "Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot X'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot  X'. " +
								    "But the voice recognition waits only a short time for your answer. " +
								    "No Worry, you can continue the game by starting the Alexa skill again with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to X' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
			
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?",

						display:    "Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the display: " +
									"Your device does not support a display. But you can see the game board on the website calcbox.de. " +
									"Open this website and follow the instructions. " +
								    
								    "Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot  ...'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot  ...'. " +
								    "But the voice recognition waits only a short time for your answer. " +
								    "No Worry, you can continue the game by starting the Alexa skill again with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to  ...' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
			
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?",
								    
					},
				},
				
				INTERN: {
					NO_AMZ_USERID: {
						speechOut:  "The request does not contain a User-ID.",
						display:    "The request does not contain a User-ID."
					},
					INVALID_USERDATA: {
						speechOut:  "The userdata are not readable.",
						display:    "The userdata are not readable."
					},
					YOUR_MOVE: {
						speechOut:  "Into which slot do you throw a disc?",
						display:    "Into which slot do you throw a disc?"
					},
					AI_LEVEL_CHANGED: {
						speechOut:  "The playing skill level has been set to %1. Into which slot do you throw a disc?",
						display:    "The playing skill level has been set to %1. Into which slot do you throw a disc?"
					},
					ANIMAL_CONNECTED: {
						speechOut:  "You are connected to the website display. Into which slot do you throw a disc?",
						display:    "You are connected to the website display. Into which slot do you throw a disc?"
					},
					NEW_GAME_STARTED: {
						speechOut:  "A new game was started. Into which slot do you throw a disc?",
						display:    "A new game was started. Into which slot do you throw a disc?"
					},
					GAME_CONTINUED: {
						speechOut:  "Your last game is continued, into which slot do you throw a disc?",
						display:    "Your last game is continued, into which slot do you throw a disc?"
					},
					HELP: {
						speechOut: "Here the short help: " +
						   			"You can use the following commands: 'Help', 'Start a new game', 'I throw into slot X', 'You may start', 'Set playing skill level to X' or Stop. " + 
						   			"Do you want a detailed help?",
						   			
						   			
						display:   	"Here the Short-Help: " +
									"You can use the following commands: 'Help', 'Start a new game', 'I throw into slot ...', 'You may start', 'Set playing skill level to ...' or 'Stop'. " + 
									"Do you want a detailed help?"
						   			
					},
					INTRO: {
						speechOut: 	"Elcom to the Connect-Four Skill. Do you want instructions how to use this skill?",
						display: 	"Do you want instructions how to use this skill?"
					},
					HELP_REGELN: {
						
						speechOut:  "Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot  X'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot  X'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, Slot  X'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
								    
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to  X' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
			
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?",
								   
						display:	"Lets start with the rules: " +
									"In the game Connect-Four two players play against each other, by throwing discs alternating into one of the 7 rows. " +
								    "Goal of the game is to line up four consecutive discs either vertically, horizontally or diagonally. " +
								    "If there is no slot left to throw into, the game is a draw. " +
								   
									"Now to the voice control: " +
								    "On game start you can decide, whether you want to start or not. " +
								    "To start the game just say 'I throw into slot ...'. Do you want Alexa the make the first move just say 'You may start'. " +
								    "After you made your move, Alexa is doing her move and awaits an answer from you. " +
								    "If you answer immediately, you can say 'Slot ...'. " +
								    "But the voice recognition waits only a short time for your answer, then only the game board is shown. " +
								    "To make your move you have to add the activation word, mostly 'Alexa'. " +
								    "E.g. 'Alexa, slot ...'. " +
								    "If the game board is not shown any more, then the skill has to be restarted with 'Alexa, start Connect-Four'." +
								    "The game is continued at the last position. " +
								    "If a game is not continued after 4 hours, then it will be quitted automatically. " +
								    
					   
								    "And now to other commands: " +
								    "With the command 'Help' you get a help text at any time. " +
								    "With the command 'Start a new game' you can quit the current game and start a new one. " +
								    "With the command 'Set playing skill level to ...' you can change the playing skill level (AI) of Alexa. 1 is the easiest and 7 the most difficult. " +
			
								    "One hint at the end: " +
								    "Any form of improvement, praise or criticism is welcome. Just send an email to ferenc.hechler@gmail.com. " +
								   
								    "Shall I repeat the Text?"
						
						
					},
					DID_NOT_UNDERSTAND: {
						speechOut: "Sorry, I do not understand your answer, say Help to learn the commands used in this skill.",
						display: "Say 'Help' to learn the commands used in this skill. "
					},
					CHANGE_SETTINGS: {
						speechOut: "You can change the playing skill level using the command 'Set playing skill level to' and a value from 1 to 7.",
						display: "Say 'Set playing level skill to ... (1..7)'. "
					},
					AI_STARTS_NOT_ALLOWED: {
						speechOut: "The players can only switch at the first move. Into which slot do you throw a disc?",
						display: "The players can only switch at the first move. Into which slot do you throw a disc?"
					},
					NOT_YES_NO_ANSWER: {
						speechOut: "That was not an answer to my question, I take this as a 'No'. Into which slot do you throw a disc?",
						display: "That was not an answer to my question, I take this as a 'No'. Into which slot do you throw a disc?"
					},
					NO_QUESTION_ASKED: {
						speechOut: "I did not ask a Yes/No Question. Into which slot do you throw a disc?",
						display: "I did not ask a Yes/No Question. Into which slot do you throw a disc?"
					}
				},
				
				STATUS: {
					PLAYER_WINS: { 
						speechOut: "Congratulations! You have won.",
						display :  "Congratulations! You have won."
					},
					DRAW: { 
						speechOut: "The game ends with a draw.",
						display :  "The game ends with a draw."
					},
					AI_PLAYER_WINS: { 
						speechOut: "I have won.",
						display :  "I have won."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "Into which slot do you throw a disc?",
						display :  "Into which slot do you throw a disc?"
					}
				},
				
				STATUS_AIMOVE: {
					PLAYER_WINS: { 
						speechOut: "Congratulations! You have won.",
						display :  "Congratulations! You have won."
					},
					DRAW: { 
						speechOut: "I throw into slot %1, the game ends with a draw.",
						display :  "I throw into slot %1, the game ends with a draw."
					},
					AI_PLAYER_WINS: { 
						speechOut: "I throw into slot %1 and have won.",
						display :  "I throw into slot %1 and have won."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "I throw into slot %1. Into which slot do you throw a disc?",
						display :  "I throw into slot %1. Into which slot do you throw a disc?"
					}
				},
				
				HINT: {
					PLAYER_WINS: { 
						speechOut: "start a new game.",
						display :  "start a new game."
					},
					DRAW: { 
						speechOut: "start a new game.",
						display :  "start a new game."
					},
					AI_PLAYER_WINS: { 
						speechOut: "start a new game.",
						display :  "start a new game."
					},
					MAKE_YOUR_MOVE: { 
						speechOut: "I throw into slot ...",
						display :  "I throw into slot ..."
					}
				},
				
				PlayerMoveIntent: {
					S_PLAYER_WINS: { 
						speechOut: "Congratulations! You have won.",
						display :  "Congratulations! You have won."
					},
					S_DRAW: { 
						speechOut: "The game ends with a draw.",
						display :  "The game ends with a draw."
					},
					S_OK: { 
						speechOut: "I throw into slot %1.",
						display :  "I throw into slot %1."
					},
					S_AI_PLAYER_WINS: { 
						speechOut: "I throw into slot %1 and have won.",
						display :  "I throw into slot %1 and have won."
					},
					S_AI_DRAW: { 
						speechOut: "I throw into slot %1 and the game ends with a draw.",
						display :  "I throw into slot %1 and the game ends with a draw."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "Ich habe die Reihe nicht verstanden. Sage eine Zahl von eins bis sieben.",
						display :  "Ich habe die Reihe nicht verstanden. Sage eine Zahl von 1-7."
					},
					E_INVALID_MOVE: {
						speechOut: "This slot has no space left for throwing a disc into it.",
						display :  "This slot has no space left for throwing a disc into it."
					},
					E_GAME_FINISHED: { 
						speechOut: "The game is over. To start a new game, say 'Start a new game'.",
						display :  "The game is over. To start a new game, say 'Start a new game'."
					}

				},
				
				SetAILevelIntent: {
					S_OK: { 
						speechOut: "The playing skill level has been set to %1. It's your turn.",
						display :  "The playing skill level has been set to %1. It's your turn."
					},
					E_INVALID_PARAMETER: { 
						speechOut: "The playing skill level has to be a number between 1 and 7. Into which slot do you throw a disc?",
						display :  "The playing skill level has to be a number between 1 and 7. Into which slot do you throw a disc?"
					},
				}, 
				
				GetAILevelIntent: {
					S_OK: { 
						speechOut: "The playing skill level is set to %1.",
						display :  "The playing skill level is set to %1."
					}
				},
				
			    "AMAZON.StopIntent": {
			    	"*": {
			    		speechOut: "goodbye, have a nice day!", 
			    		display :  "goodbye, have a nice day!"
			    	}
			    },
			    
				Generic: {
					E_UNKNOWN_ERROR: {
						speechOut: "An unexpected error has occurred.",
						display: "An unexpected error has occurred",
					},
					E_UNKNOWN_GAMEID: { 
						speechOut: "The game was closed on the server. Please start a new game.",
						display:   "The game was closed on the server. Please start a new game." 
					},
					E_GAME_FINISHED: { 
						speechOut: "The game is over. Please start a new game.",
						display:   "The game is over. Please start a new game." 
					},
					E_CONNECT: { 
						speechOut: "There are connections problems with the Server.",
						display:   "There are connections problems with the Server." 
					},
					E_MISSING: { 
						speechOut: "Sorry, missing speech output for Intent-code %1 .",
						display:   "Sorry, missing speech output for Intent-code '%1'." 
					},
					E_QUESTION: { 
						speechOut: "Sorry, missing handler for Question-code %1 .",
						display:   "Sorry, missing handler for Question-code '%1'." 
					}

				}
			    
			} // end messages

		}  // end local "en"
		
	}
}



function respond(intentName, resultCode, response, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"]["E_MISSING"];
		msg = setParams(msg, intentName + "-" + resultCode);
	}
	msg = setParams(msg, param1);
	response.askWithCard(msg.speechOut, cardTitle, msg.display);
}

function createMsg(intentName, resultCode, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"]["E_MISSING"];
		msg = setParams(msg, intentName + "-" + resultCode);
	}
	msg = setParams(msg, param1);
	return msg;
}

function respondMsg(response, msg) {
	response.askWithCard(msg.speechOut, undefined, cardTitle, msg.display);
}

function respondMsgWithDirectives(response, msg, directives) {
	response.askWithDirectives(msg.speechOut, undefined, msg.display, undefined, directives);
}
         
function outputMsgWithDirectives(response, msg, directives) {
	response.tellWithDirectives(msg.speechOut, msg.display, undefined, directives);
}


function goodbye(intentName, resultCode, response, param1) {
	var msg;
	if (messages[intentName]) {
		msg = messages[intentName][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"][resultCode];
	}
	if (!msg) {
		msg = messages["Generic"]["E_MISSING"];
		msg = setParams(msg, intentName + "-" + resultCode);
	}
	msg = setParams(msg, param1);
	response.tellWithCard(msg.speechOut, cardTitle, msg.display);
}

function setParams(msg, param1) {
	if (!param1) {
		return msg;
	}
	var result = {
			speechOut: msg.speechOut.replace("%1", param1),
			display:   msg.display.replace("%1", param1)
	}
	return result;
}


module.exports = {set_locale, respond, createMsg, respondMsg, respondMsgWithDirectives, outputMsgWithDirectives, goodbye};
