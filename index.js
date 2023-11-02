const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 9000;

//Middlewares
app.use(cors())
app.use(express.json())
dotenv.config();


//Default Route
app.get("/", (req, res)=>{
    res.send(`Todo Management Server Running on Port ${port}`)
})





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ak1okw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // collections 
    const todosCollection = client.db('todoDB').collection('todos');

    //Application Routes
    //Get Todos
    app.get("/todos", async(req, res)=>{
      try {
        const result = await todosCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Post a Todo
    app.post("/todos", async(req, res)=>{
      try {
        const newTodo = req.body;
        const result = await todosCollection.insertOne(newTodo);
        res.status(200).send({status:'success', message:'Added new todo was successful'});
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Update a Todo
    app.put("/todos/:todoId", async(req, res)=>{
      try {
        const newTodo = req.body;
        const {todoId} = req.params;
        
        const filter = {_id:new ObjectId(todoId)}
        const options = {upsert:true}
        const updateTodo = {
          $set:newTodo
        }

        const result = await todosCollection.updateOne(filter, updateTodo, options);
        res.status(200).send({status:'success', message:'Update was successful'});
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Update a field of Todo
    app.patch("/todos/:todoId", async(req, res)=>{
      try {
        const newTodo = req.body;
        const {todoId} = req.params;
        
        const filter = {_id:new ObjectId(todoId)}
        const options = {upsert:true}
        const updateTodo = {
          $set:newTodo
        }

        const result = await todosCollection.updateOne(filter, updateTodo, options);
        res.status(200).send({status:'success', message:'Update was successful'});
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Delete a todo
    app.delete("/todos/:todoId", async(req, res)=>{
      try {
        const {todoId} = req.params;
        
        const query = {_id:new ObjectId(todoId)}

        const result = await todosCollection.deleteOne(query);
        res.status(200).send({status:'success', message:'Delete was successful'});
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`Todo Management Server Listening on Port ${port}`)
})