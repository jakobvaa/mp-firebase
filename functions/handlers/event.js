const { admin, db } = require("../util/admin");

const config = require("../util/config");

exports.getAllEvents = (req, res) => {
  db.collection("events")
    .get()
    .then((docs) => {
      let events = [];
      docs.forEach((doc) => {
        events.push({
          eventId: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          date: doc.data().date,
          attendees: doc.data().attendees,
          createdAt: doc.data().createdAt,
        });
      });
      f;
      return res.status(200).json(events);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ general: "A problem occured" });
    });
};

// req: title, descrpt, location, date
exports.newEvent = (req, res) => {
  const newEvent = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    date: req.body.date,
    attendees: [req.user.uid],
    createdAt: new Date().toISOString(),
    hostId: req.user.uid,
    maxAttendees: req.body.maxAttendees,
  };
  // Validate event data

  db.collection("events")
    .add(newEvent)
    .then((doc) => {
      const resEvent = newEvent;
      resEvent.id = doc.id;
      return res.status(200).json(resEvent);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    });
};

exports.attendEvent = (req, res) => {
  const eventDoc = db.doc(`/events/${req.params.eventId}`);
  let eventData = {};
  eventDoc
    .get()
    .then((doc) => {
      eventData = doc.data();
      eventData.eventId = doc.id;
      if (doc.exists) {
        if (eventData.attendees.includes(req.user.uid)) {
          return res.status(500).json({ error: "Already attending" });
        } else {
          eventData.attendees = [...eventData.attendees, req.user.uid];
          return eventDoc.update({
            attendees: [...eventData.attendees, req.user.uid],
          });
        }
      } else {
        return res.status(500).json({ error: "Event not found" });
      }
    })
    .then(() => {
      return res.status(200).json({ eventData });
    })
    .catch((err) => {
      console.error(err);
    });
};
