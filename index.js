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

    // **events**
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
