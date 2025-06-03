const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    // get events data
    app.get("/events", async (req, res) => {
      // search functionality
      const { searchParams } = req.query;
      let query = {}; // must use let because it will be change
      if (searchParams) {
        query = { eventName: { $regex: searchParams, $options: "i" } };
      }
      const result = await eventsCollection.find(query).toArray();
      res.send(result);
    });

    // post events
    app.post("/events", async (req, res) => {
      const newEvents = req.body;
      const result = await eventsCollection.insertOne(newEvents);
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
