const functions = require("firebase-functions");

const { signup, login } = require("./handlers/user");
const { getAllEvents, newEvent, attendEvent } = require("./handlers/event");

// Middleware for user authentication. Only authenticated users may post etc (valid token)
const fbAuth = require("./util/fbAuth");

const app = require("express")();

app.post("/signup", signup);
app.post("/login", login);

// User
// TODO: update, delete

// Events
//TODO: Create, attend, unattend, delete, update
app.get("/events", getAllEvents);
app.post("/event", fbAuth, newEvent);
app.get("/event/:eventId/attend", fbAuth, attendEvent);

exports.api = functions.https.onRequest(app);
