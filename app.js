const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;

const CONNECTION_URL = "mongodb+srv://xxaydiv:test@nanostack.l8nsecq.mongodb.net/?retryWrites=true&w=majority";

const DATABASE_NAME = "nanostack"; // you can change the database name
var database, collection;
app.use(express.urlencoded({extended: true}));

MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
  if(error) throw error;

  database = client.db(DATABASE_NAME);
  collection = database.collection("newcollection"); // you can change the collection name

  //Start the application after the database connection is ready
  app.listen(3000, () => {
    console.log('This app is running on port 3000')
  });
});
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
//app.listen(3000, () => {
  //  console.log('This app is running on port 3000');
    //});