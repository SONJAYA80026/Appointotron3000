/*-----------------------------------------------------------------------------
Welcome to Appointotron3000!

Bot Framework/Development = Abhi Vishwas
LUIS Training/Dev = Darren D'Silva

-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});


// Listen for messages from users 
server.post('/api/messages', connector.listen());


/*----------------------------------------------------------------------------------------
* Bot Storage: For SQL if further developed - integration with database rather than bot memeory
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

var luisAppId = process.env.LuisAppId ||'78f0a5fa-ad4a-4be9-9b16-5277bf1ec1e2' ;
var luisAPIKey = process.env.LuisAPIKey ||'31531a24efb14ba6a6ad4a4b048023b1' ;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
    const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
bot.dialog('/', intents);    


    //Completed/Tested Intents Here 

    .matches('Greeting', (session) => {
        session.send('Hi! Im AppointoTron3000, How can I help yoWou?', session.message.text);
    })



    .matches('Goodbye', (session) => {
        session.send('Thanks for Talking with me Daddy!', session.message.text);
    })



    .matches('None', (session) => {
        session.send('Bro stop sending me this weird stuff, my names Jackson, i get paid minimum wage, its not even a real chatbot, stop texting me', session.message.text);
    })

        .matches('getInfo', (session) => {
            session.send('What Info?', session.message.text);
        })

bot.dialog('Help', function (session) => {
    session.endDialog('Hi! Try asking me things like \'What time do you open?\', \'What offers is great clips running?\' or \'What is the price of a haircut\'', session.message.text);
}).triggerAction({
    matches: 'Help'
});

    .matches('getInformation', (session, args) => {
        session.send('What info wold you like? Price, Timing, or Contact Info?', session.message.text);
        var PriceEntity = builder.EntityRecognizer.findEntity(args.entities, 'Price');
            var ChildEntity = builder.EntityRecognizer.findEntity(args.entities, 'Child');
            var MenEntity = builder.EntityRecognizer.findEntity(args.entities, 'Men');
            var WomenEntity = builder.EntityRecognizer.findEntity(args.entities, 'Women');
        if (PriceEntity) {
            session.send('For a man, woman, or child?', session.message.text); 
            if (childEntity) {
                session.send('The price for a Childs haircut is 10$', session.message.text);
            })
                if (womensEntity) {
                    session.send('The price for a Womans haircut is 12$', session.message.text);
                })
                    if (mensEntity) {
                        session.send('The price for a Childs haircut is 10$', session.message.text);
                        })
            else{
                session.send('What else would you like to know?', session.message.text);
            })
        ).triggerAction({
            matches: 'getInformation.Price'
        })


            .matches('getInformation', (session, args) => {
                var TimingEntity = builder.EntityRecognizer.findEntity(args.entities, 'Timing');
        var PhoneNumberEntity = builder.EntityRecognizer.findEntity(args.entities, 'PhoneNumber');
        var TimeOpenEntity = builder.EntityRecognizer.findEntity(args.entities, 'TimeOpen');
        if (timingEntity) {
            session.send('We are Open from 6:30 AM to 8:30 PM', session.message.text);
        })
        if (timeOpenEntity) {
            session.send('We open at 6:30', session.message.text);

        })
        if (PhoneNumberEntity) {
            session.send('Our Phone number is 936-787-6986', session.message.text);
        })

//Appointment Details - waterfalled for input - Code is correct - need to work on getting functionality with memory - find hhow to test 
.matches('manageAppointment', (session, args, next)=> {
            session.send('Welcome to the Appointment Manager! \'%s\'', session.message.text);
            builder.Prompts.time(session, "When would you like to schedule your appointment?(e.g.: June 6th at 5pm)");
        },
            function (session, results) {
                session.dialogData.appointmentDate = builder.EntityRecognizer.resolveTime([results.response]);
                builder.Prompts.text(session, "How many haircuts and for who?");
            },
            function (session, results) {
                session.dialogData.partySize = results.response;
                builder.Prompts.text(session, "Please leave your name and phone number");
            },
            function (session, results) {
                session.dialogData.appointmentInfo = results.response;

                // Process request and display reservation details
                session.send(`Appointment confirmed, Details: <br/>Date/Time: ${session.dialogData.appointmentDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.appointmentInfo}`);
                session.endDialog();
            }
]).set('storage', inMemoryStorage); // Register in-memory storage 
    ).triggerAction({
    matches: 'manageAppointment'
})


    /*    
// This is the intent get Info - need to work on how to structure hierarchal entities - price and its children
    .matches('getInformation', [
        function(session, args, next) {
            session.send('One Moment while I find this information: \'%s\'', session.message.text);

            var PriceEntity = builder.EntityRecognizer.findEntity(args.entities, 'Price');
		        var ChildEntity = builder.EntityRecognizer.findEntity(args.entities, 'Child');
		        var MenEntity = builder.EntityRecognizer.findEntity(args.entities, 'Men');
		        var WomenEntity = builder.EntityRecognizer.findEntity(args.entities, 'Women');
            var TimingEntity = builder.EntityRecognizer.findEntity(args.entities, 'Timing');
            var PhoneNumberEntity = builder.EntityRecognizer.findEntity(args.entities, 'PhoneNumber');

            if (priceEntity) {
                builder.Prompts.text(session, session.dialog.prompt);
            } else if () {
                var infor = {
                    foodName: foodNameEntity.entity,
                    size: sizeEntity.entity,
                    quantity: quantityEntity.entity
                };
                next({ response: order });
        if (price) {
            session.send('For Men, Women, or a Child?', session.message.text);
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'getInformation.Price'
})


// Sample dialog from LUIS website - 
/*

bot.dialog('TurnOnDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn on a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning on the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns on a device
        } else {
            // Assuming turning on lights is the default
            session.send('Ok, turning on the lights');
            // Put your code here for calling the IoT web service that turns on a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOn'
})


bot.dialog('TurnOnDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn on a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning on the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns on a device
        } else {
            // Assuming turning on lights is the default
            session.send('Ok, turning on the lights');
            // Put your code here for calling the IoT web service that turns on a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOn'
})
*/




   



