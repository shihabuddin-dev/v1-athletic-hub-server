const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// mongoDB
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("athleticHubDB");
    const eventsCollection = database.collection("events");
    const bookingsCollection = database.collection("bookings");

    // **events**
    // featured events
    app.get("/events/featured", async (req, res) => {
      // Only show events with eventDate today or in the future, sorted by eventDate ascending (soonest first)
      const today = new Date().toISOString().split("T")[0];
      const featuredEvents = await eventsCollection
        .find({ eventDate: { $gte: today } })
        .sort({ eventDate: 1 })
        .limit(6)
        .toArray();
      res.send(featuredEvents);
    });

    // get events data using search params or email and all
    app.get("/events", async (req, res) => {
      // search functionality search by event name or location
      const { searchParams, email } = req.query;
      let query = {};
      if (searchParams) {
        query.$or = [
          { eventName: { $regex: searchParams, $options: "i" } },
          { location: { $regex: searchParams, $options: "i" } },
        ];
      }
      if (email) {
        query.creatorEmail = email;
      }
      const result = await eventsCollection.find(query).toArray();
      res.send(result);
    });

    // get single events data
    app.get("/events/:id", async (req, res) => {
      const { id } = req.params;
      const find = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(find);
      res.send(result);
    });

    // post events
    app.post("/events", async (req, res) => {
      const newEvents = req.body;
      const result = await eventsCollection.insertOne(newEvents);
      res.send(result);
    });

    // update event data using put method using id
    app.put("/events/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedEvent = req.body;
      const updateDoc = { $set: updatedEvent };
      const result = await eventsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete events using id
    app.delete("/events/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(filter);
      res.send(result);
    });

    // **Bookings**
    // get bookings data
    app.get("/bookings", async (req, res) => {
      // search functionality search by event name or location
      const { email } = req.query;
      let query = {};
      if (email) {
        query.user_email = email;
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    // get single bookings data by id
    app.get("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const find = { _id: new ObjectId(id) };
      const result = await bookingsCollection.findOne(find);
      res.send(result);
    });

    // post bookings data new booking
    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      // save to db in bookings data
      const result = await bookingsCollection.insertOne(bookingData);
      res.send(result);
    });

    // delete bookings using id
    app.delete("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("That's great! Server is running");
});

app.listen(port, (req, res) => {
  console.log(`Server is running on port http://localhost:${port}`);
});
