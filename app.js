require('dotenv').config()
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');

const port = 3000

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
// Supports a list of scopes as a string delimited by ',' or ' ' or '%20'
const SCOPES = (process.env.SCOPE.split(/ |, ?|%20/) || ['crm.objects.contacts.write']).join(' ');

const REDIRECT_URI = `https://sleepy-bell-bottoms-jay.cyclic.app/oauth-callback`;

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

const express = require('express');
const app = express();

const https = require('https');
const cookieParser = require('cookie-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

app.use(cookieParser());

const MongoClient = require('mongodb').MongoClient;

const CONNECTION_URL = "mongodb+srv://xxaydiv:test@nanostack.l8nsecq.mongodb.net/?retryWrites=true&w=majority";

const DATABASE_NAME = "nanostack"; // you can change the database name
var database, collection;
app.use(express.urlencoded({extended: true}));

// Use a session to keep track of client ID
app.use(session({
  secret: Math.random().toString(36).substring(2),
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 12 * 30 * 24 * 60 * 60 * 1000
  }
}));

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

  app.get('/install', (req, res) => {
  console.log('Initiating OAuth 2.0 flow with HubSpot');
  console.log("Step 1: Redirecting user to HubSpot's OAuth 2.0 server");
  res.redirect(authUrl);
  console.log('Step 2: User is being prompted for consent by HubSpot');
});

  app.get('/oauth-callback', async (req, res) => {
  console.log('Step 3: Handling the request sent by the server');

  // Received a user authorization code, so now combine that with the other
  // required values and exchange both for an access token and a refresh token
  if (req.query.code) {
    console.log('  > Received an authorization token');

    const authCodeProof = {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code
    };

    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log('Step 4: Exchanging authorization code for an access token and refresh token');
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }
    console.log(req.sessionID);
    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(`/admin`);
  }
});

const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
      form: exchangeProof
    });
    // Usually, this token data should be persisted in a database and associated with
    // a user identity.
    const tokens = JSON.parse(responseBody);
    refreshTokenStore[userId] = tokens.refresh_token;
    accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

    console.log('  > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(`  > Error exchanging ${exchangeProof.grant_type} for access token`);
    return JSON.parse(e.response.body);
  }
};

const refreshAccessToken = async (userId) => {
  const refreshTokenProof = {
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    refresh_token: refreshTokenStore[userId]
  };
  return await exchangeForTokens(userId, refreshTokenProof);
};

const getAccessToken = async (userId) => {
  // If the access token has expired, retrieve
  // a new one using the refresh token
  if (!accessTokenCache.get(userId)) {
    console.log('Refreshing expired access token');
    await refreshAccessToken(userId);
  }
  return accessTokenCache.get(userId);
};

const isAuthorized = (userId) => {
  return refreshTokenStore[userId] ? true : false;
};

app.get('/admin', (req, res) => {               
 if (isAuthorized(req.sessionID)) {
  res.render('admin');
 } else {
  res.render('install');
 }
});

app.post('/admin', async (req, res) => {
   if (isAuthorized(req.sessionID)) 
   {
    var searchInput = req.body.searchinput; // Store submitted form input into variable 
var url = 'https://api.hubapi.com/contacts/v1/search/query?q=' + searchInput;

const contactSearch = async (accessToken) => {
 try {
  const headers = {
   Authorization: `Bearer ${accessToken}`,
   'Content-Type': 'application/json'
  };
  const data = await request.get(url, {headers: headers, json: true});
  return data;
 } catch (e) {
  return {msg: e.message}
 }};

const accessToken = await getAccessToken(req.sessionID);
const searchResults = await contactSearch(accessToken);
var contactResults = JSON.stringify(searchResults.contacts);
var parsedResults = JSON.parse(contactResults);

res.render('searchresults', {contactsdata: parsedResults});
   } 
   else {          
res.redirect('/admin'); 
 }
});
         




MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
  if(error) throw error;

  database = client.db(DATABASE_NAME);
  collection = database.collection("newcollection"); // you can change the collection name

  //Start the application after the database connection is ready
  //app.listen(3000, () => {
    //console.log('This app is running on port 3000')
  //});
});
app.set("view engine", "ejs");

app.get("/", function(req, res){
  res.render('home');
});
app.post("/", function(req, res){
  collection.insertOne(req.body, (err, result) => {  
    if (err) return console.log(err)

    console.log('saved to database')

  function formv3(){
    // Create the new request 
    var xhr = new XMLHttpRequest();
    var url = 'https://api.hsforms.com/submissions/v3/integration/submit/20070455/316f926f-1f29-4165-bcf7-88d2640fae1e'
    
    // Example request JSON:
    var data = {
      "fields": [
        {
          "name": "email",
          "value": req.body.email
        },
        {
          "name": "firstname",
          "value": req.body.firstname
        }
      ],
      "context": {
        "hutk": req.cookies.hubspotutk,
        "pageUri": "http://www.portfolio.com/contact",
        "pageName": "Portfolio contact me"
      }
    }

    var final_data = JSON.stringify(data)

    xhr.open('POST', url);
    // Sets the value of the 'Content-Type' HTTP request headers to 'application/json'
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) { 
            console.log(xhr.responseText); // Returns a 200 response if the submission is successful.
        } else if (xhr.readyState == 4 && xhr.status == 400){ 
            console.log(xhr.responseText); // Returns a 400 error the submission is rejected.          
        } else if (xhr.readyState == 4 && xhr.status == 403){ 
            console.log(xhr.responseText); // Returns a 403 error if the portal isn't allowed to post submissions.           
        } else if (xhr.readyState == 4 && xhr.status == 404){ 
            console.log(xhr.responseText); //Returns a 404 error if the formGuid isn't found     
        }
       }


    // Sends the request 
    
    xhr.send(final_data)
 }

 formv3();
    res.redirect('/') // or do something else here
  })
});

app.get("/about", function(req, res){
  res.render('about');
});


app.listen(3000, () => {
    console.log('This app is running on port 3000');
    });