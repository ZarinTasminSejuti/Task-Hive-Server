const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.ggegvme.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const taskCollection = client.db("hiveDb").collection("task");
    const userCollection = client.db("hiveDb").collection("users");

    //users related API
    app.get("/allUsers", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;

      //insert email if user not exist
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "user already existingUser",
          insertedId: null,
        });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //view task field

    app.get("/viewTask", async (req, res) => {
      const cursor = taskCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addTask", async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

//Remove task section
app.delete("/viewTask/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const idObject = new ObjectId(taskId);
  console.log(taskId);
  const result = await taskCollection.deleteOne({ _id: idObject });
  res.send(result);
});



    //update section
    app.get("/updateTask/:_id", async (req, res) => {
      const updateTaskId = req.params._id;
      const idObject = new ObjectId(updateTaskId);
      const result = await taskCollection.findOne(idObject);
      res.send(result);
    });

    app.put('/updateTask/:_id', async (req, res) => {
      const updateId = req.params._id;
      const updateTask = req.body;
      console.log(updateTask);
      const filter = {_id: new ObjectId(updateId)}
      const options = { upsert: true };
      const updateTaskElement = {
        $set: {
          Task_title: updateTask.Task_title,
          Task_Priority: updateTask.Task_Priority,
          Task_description: updateTask.Task_description,
          Task_Deadline: updateTask.Task_Deadline,
          submitTime: updateTask.submitTime
        }
      }

      const result = await taskCollection.updateOne(filter, updateTaskElement, options)
      res.send(result); 
    })


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Hive server is running");
});

app.listen(port, () => {
  console.log(`Task Hive server is running on port: ${port}`);
});
