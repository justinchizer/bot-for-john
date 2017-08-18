// For more information about this template visit http://aka.ms/azurebots-node-qnamaker

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
                knowledgeBaseId: process.env.QnAKnowledgebaseId, 
    subscriptionKey: process.env.QnASubscriptionKey});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try changing the query terms!',
                qnaThreshold: 0.3}
);
var data = {}
var options

bot.dialog('/', dialog)

//LUIS

dialog.matches('greeting', [
    function (session, args, next) {
        session.send('Welcome to Green Machine, I am Patricia the chat bot assistant!')
        session.beginDialog('/mainMenu', args)
    }
])

dialog.matches('quote', [
    function(session, args, next){
        session.beginDialog('/Quote', args)
    }
])

bot.dialog('/mainMenu', [
    function(session) {
        builder.Prompts.choice(session, ' What can I help you with today'['Get a Quote', 'Schedule Appointment'])
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:

            session.beginDialog('/Quote')
            break

            case 1:
            session.beginDialog('/Schedule')
            break
        }
    }
])



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
