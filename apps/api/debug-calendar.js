const googleCalendar = require('./src/googleCalendar');

console.log("Type of googleCalendar:", typeof googleCalendar);
console.log("Is it a function (router)?", typeof googleCalendar === 'function');
console.log("Exports keys:", Object.keys(googleCalendar));
console.log("Has createEvent?", typeof googleCalendar.createEvent === 'function');
console.log("Has updateEvent?", typeof googleCalendar.updateEvent === 'function');
console.log("Has deleteEvent?", typeof googleCalendar.deleteEvent === 'function');

try {
    const remindersService = require('./src/services/contactRemindersService');
    console.log("ContactRemindersService loaded successfully.");
} catch (err) {
    console.error("Error loading ContactRemindersService:", err);
}

try {
    const feedbackService = require('./src/services/propertyFeedbackService');
    console.log("PropertyFeedbackService loaded successfully.");
} catch (err) {
    console.error("Error loading PropertyFeedbackService:", err);
}
