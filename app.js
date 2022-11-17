const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;

const CONNECTION_URL = "mongodb+srv://xxaydiv:MeyzdNcx8ojJawGu@cluster0.vudnfpj.mongodb.net/?retryWrites=true&w=majorityy";
const DATABASE_NAME = "Cluster0"; // you can change the database name
var database, collection;

MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
  if(error) throw error;

  database = client.db(DATABASE_NAME);
  collection = database.collection("newcollection"); // you can change the collection name

app.set("view engine", "ejs");

app.get("/", function(req, res){
  res.render('home');
});
app.post("/", function(req, res){
  collection.insertOne(req.body, (err, result) => {  
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/') // or do something else here
  })
});

app.get("/about", function(req, res){
  res.render('about');
});

app.use(express.urlencoded({extended: true}));

app.listen(3000, function()
  {console.log("Server started on port 3000");}
)
