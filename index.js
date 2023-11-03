const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")

const multer = require("multer")
const fs = require('fs')
const path = require('path')

const app = express();
const port = process.env.PORT || 9000;

//Middlewares
app.use(cors())
app.use(express.json({limit:"50mb"}));
dotenv.config();


const storage = multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, "uploads/")
  },
  filename:(req, file, cb)=>{
    cb(null, file.originalname)
  },
})

const upload = multer({storage})


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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // collections 
    const todosCollection = client.db('todoDB').collection('todos');
    const usersCollection = client.db('todoDB').collection('users');

    //Application Routes
    //Upload file to DB
    app.post("/signup", async(req, res)=>{
      try {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.status(200).send({message:"Successfully uploaded"});
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Get valid user from DB
    app.get("/users/:email", async(req, res)=>{
      try {
        const {email} = req.params;
        const result = await usersCollection.findOne({email:email});
        res.status(200).send(result);
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })


    //Get Todos By User Email
    app.get("/todos/:email", async(req, res)=>{
      try {
        const {email} = req.params;
        const result = await todosCollection.find({email:email}).toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Get Todos By User Email and Title
    app.get("/searchByTitle", async(req, res)=>{
      try {
        const {email} = req.query;
        const {title} = req.query;
        const result = await todosCollection.find({email:email, title:{$regex: new RegExp(title, "i")}}).toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Filter Todos By User Email and Title
    app.get("/filterByComplete", async(req, res)=>{
      try {
        const {email} = req.query;
        const {filterTxt} = req.query;
        console.log(filterTxt)

        if(filterTxt==="Completed"){
          const allTodos = await todosCollection.find({email, completed:true}).toArray();
          res.status(200).send(allTodos);
        }else if(filterTxt==="Incompleted"){
          const allTodos = await todosCollection.find({email, completed:false}).toArray();
          res.status(200).send(allTodos);
        }else{
          const allTodos = await todosCollection.find({email}).toArray();
          res.status(200).send(allTodos);
        }
      } catch (error) {
        res.status(500).json({error:true, message:'There was server side error!'})
      }
    })

    //Sort Todos By Ascending or Descending
    app.get("/sortByTitle", async(req, res)=>{
      try {
        const {email} = req.query;
        const {sortStatus} = req.query;
        const result = await todosCollection.find({email:email}).sort({title: sortStatus === "ascending" ? 1 : -1}).toArray();
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