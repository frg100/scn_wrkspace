"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var async = require('async');
var fs = require("fs");

var cookieSession = require('cookie-session');
var session = require('express-session');
var bodyParser = require('body-parser');
var Multer = require('multer');
const crypto = require('crypto');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedfile');

/******************************** Google Cloud configs ********************************/
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const {Datastore} = require('@google-cloud/datastore');

// Instantiate a datastore client [new Datastore({ projectId: 'wrkspace' })]
const datastore = new Datastore();


// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const {Storage} = require('@google-cloud/storage');

// Instantiate a storage client
const storage = new Storage();

// Multer is required to process file uploads and make them available via
// req.files.
const filesize_limit_mb = 20;
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: filesize_limit_mb * 1024 * 1024, // no larger than 20mb, you can change as needed.
  },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

/******************************** Google Cloud configs ********************************/

var express = require('express');
var app = express();

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

// Initialize the session data
const session_duration_mins = 30;
app.use(session({
    name: 'cookie-session',
    secret: 'secretKey', 
    resave: false, 
    maxAge: session_duration_mins * 60 * 1000,
    saveUninitialized: false
}));

app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

const get_random_id = () => crypto.randomBytes(3*4).toString('base64');
const hash_string = password => crypto.createHash('sha256').update(password).digest('hex').substr(0, 17);

const register_user = async (login_name, password, first_name, last_name, position) => {
  //const user_id = get_random_id()
  const user_id = hash_string(login_name)
  console.log('User id just created: ', user_id)
  const user_key = datastore.key(['User', user_id]);

  const user = {
    user_id: user_id,
    login_name: login_name,
    password: hash_string(password),
    first_name: first_name,
    last_name: last_name,
    position: position
  }

  const entity = {
    key: user_key,
    data: user,
  };


  // Attempt to insert the user into the databse
  let res;
  try {
    res = await datastore.insert(entity)
    console.log(`Registered user ${user_id}`);
    return user_id
  } catch (error) {
    console.error('ERROR REGISTERING USER:', error);
    return "ERROR"
  }
};

const get_user_by_property = async (property_name, property_value) => {
  const query = datastore
    .createQuery('User')
    .filter(property_name, '=', property_value)

  // This line gets the first user from the result of the query
  // (there should only be one)
  // To get the top two it would be "const [x, y] = ..."
  const [first_user] = await datastore.runQuery(query);
  return first_user
}

const create_concert = async (type, viewable_by, name, date, venue, cosponsors, owners, artists, guarantee) => {
  const concert_id = hash_string(name + type)
  console.log('Concert id just created: ', concert_id)
  const concert_key = datastore.key(['Concert', concert_id]);

  const concert = {
    'concert_id': concert_id,
    'type': type, 
    'viewable_by': viewable_by, 
    'name': name, 
    'date': date, 
    'venue': venue, 
    'cosponsors': cosponsors, 
    'owners': owners, 
    'artists': artists, 
    'guarantee': guarantee
  }

  const entity = {
    key: concert_key,
    data:concert,
  };


  // Attempt to insert the concert into the databse
  let res;
  try {
    res = await datastore.insert(entity)
    console.log(`Created concert ${concert_id}`);
    return concert_id
  } catch (error) {
    console.error('ERROR CREATING CONCERT:', error);
    return "ERROR"
  }
};

const update_concert = async (type, viewable_by, name, date, venue, cosponsors, owners, artists, guarantee, concert_id) => {
  console.log('Saving concert: ', concert_id)
  const concert_key = datastore.key(['Concert', concert_id]);

  const concert = {
    'concert_id': concert_id,
    'type': type, 
    'viewable_by': viewable_by, 
    'name': name, 
    'date': date, 
    'venue': venue, 
    'cosponsors': cosponsors, 
    'owners': owners, 
    'artists': artists, 
    'guarantee': guarantee
  }

  const entity = {
    key: concert_key,
    data:concert,
  };


  // Attempt to insert the concert into the databse
  let res;
  try {
    res = await datastore.upsert(entity)
    console.log(`Saved concert ${concert_id}`);
    return concert_id
  } catch (error) {
    console.error('ERROR SAVING CONCERT:', error);
    return "ERROR"
  }
};

const get_concerts_by_property = async (property_name, property_value) => {
  const query = datastore
    .createQuery('Concert')
    .filter(property_name, '=', property_value)

  // This line gets the first user from the result of the query
  // (there should only be one)
  // To get the top two it would be "const [x, y] = ..."
  const [concerts] = await datastore.runQuery(query);
  return concerts
}

/*
admin/login

Provides a way for the photo app's LoginRegister view to login in a user. 
The POST request JSON-encoded body should include a property login_name (no passwords for now)
    and reply with information needed by your app for logged in user. 
An HTTP status of 400 (Bad request) should be returned if the login failed (e.g. login_name is not a valid account).
A parameter in the request body is accessed using request.body.parameter_name. 
Note the login register handler should ensure that there exists a user with the given login_name
If so, it stores some information in the Express session 
    where it can be checked by other request handlers that need to know whether a user is logged in.
*/
app.post('/admin/login', async function(request, response) {
    console.log("LOGGING IN");
    const { login_name, password } = request.body;

    let user;
    try{
      user = await get_user_by_property('login_name', login_name)
    } catch (error) {
      console.error('ERROR IN DATABASE CALL WHEN LOGGING IN:', error);
      response.status(400).send(JSON.stringify(error));
      return;
    }
    if (JSON.stringify(user) === '[]'){
      console.error(`User ${login_name} not found...`);
      response.status(404).send('USER_NOT_FOUND');
      return;
    }

    // At this point everything should have worked
    user = user[0]


    // Verify password
    const hashed_password = hash_string(password)
    const stored_hashed_password = user.password
    if (hashed_password !== stored_hashed_password) {
      console.error('Wrong password...');
      response.status(403).send('WRONG_PASSWORD');
      return;
    }

    // Now that the user is verified, log them in
    const user_id = user[datastore.KEY].name
    request.session.user_id = user_id;
    request.session.logged_in = true;
    console.log('Logged in user: ', user_id)
    response.end(JSON.stringify({'user_id': user_id, 'user': JSON.stringify(user)}));
});


app.post('/admin/logout', function(request, response) {
    console.log("LOGGING OUT");
    if (request.session.logged_in === false){
        response.status(400).send('No one is logged in!');
        return;
    }
    request.session.destroy(function (err) {
        response.status(400).send(JSON.stringify(err));
        return;
    });
    response.end("Success!");
});


/*
user

Provides a way to access/edit User entities
*/
app.get('/user/all', async function(request, response){
  if (!request.session.logged_in){
    response.status(401).send('Not logged in!');
    return;
  }

  const query = datastore.createQuery('User')
  let users;
  try{
    users = await datastore.runQuery(query);
  } catch (error) {
    console.error('ERROR IN DATABASE CALL WHEN GETTING ALL USERS:', error);
    response.status(400).send(JSON.stringify(error));
    return;
  }

  console.log(`Retrieved ${users.length} users `)
  response.end(JSON.stringify(users));
});

app.get('/user/:id', async function(request, response){
  if (!request.session.logged_in){
    response.status(401).send('Not logged in!');
    return;
  }

  const user_key = request.params.id;

  let user;
  try{
    user = await get_user_by_property('__key__', datastore.key(['User', user_key]))
  } catch (error) {
    console.error('ERROR IN DATABASE CALL WHEN GETTING USER:', error);
    response.status(400).send(JSON.stringify(error));
    return;
  }
  user = user[0]
  console.log('Retrieved user ', user.login_name)
  response.end(JSON.stringify(user));
});

// Registers a user
app.post('/user', async function(request, response){
  const { login_name, password, first_name, last_name, position } = request.body;

  if (login_name.length === 0 || first_name.length === 0 || password.length === 0){
    response.status(400).send("Empty fields not allowed!");
    return;
  }

  const datastore_response = await register_user(login_name, password, first_name, last_name, position)
  if (datastore_response === "ERROR"){
    response.status(403).send("User already exists!");
    return;
  }

  response.end("Successfully added user " + datastore_response + " to database!")
});



/*
concert

Provides a way to access/edit Concert entities
*/

app.get('/concerts-for-user/:id', async function(request, response){
  if (!request.session.logged_in){
    response.status(401).send('Not logged in!');
    return;
  }

  const user_key = request.params.id;

  let concerts;
  try{
    concerts = await get_concerts_by_property('viewable_by', user_key)
  } catch (error) {
    console.error('ERROR IN DATABASE CALL WHEN GETTING CONCERTS FOR USER:', error);
    response.status(400).send(JSON.stringify(error));
    return;
  }
  console.log(`Retrieved ${concerts.length} concerts for user ${user_key}`)
  response.end(JSON.stringify(concerts));
});

// Creates a concert
app.post('/concert', async function(request, response){
  const { type, viewable_by, name, date, venue, cosponsors, owners, artists, guarantee, concert_id } = request.body;

  let datastore_response;
  if (concert_id) {
    datastore_response = await update_concert(type, viewable_by, name, date, venue, cosponsors, owners, artists, guarantee, concert_id)
  } else {
    datastore_response = await create_concert(type, viewable_by, name, date, venue, cosponsors, owners, artists, guarantee)
  }
  if (datastore_response === "ERROR"){
    response.status(403).send("Concert already exists!");
    return;
  }

  response.end("Successfully added concert " + datastore_response + " to database!")
});

// Gets a single concert
app.get('/concert/:id', async function(request, response){
  if (!request.session.logged_in){
    response.status(401).send('Not logged in!');
    return;
  }

  const concert_id = request.params.id;

  let concerts;
  try{
    concerts = await get_concerts_by_property('__key__', datastore.key(['Concert', concert_id]))
  } catch (error) {
    console.error('ERROR IN DATABASE CALL WHEN GETTING CONCERT:', error);
    response.status(400).send(JSON.stringify(error));
    return;
  }
  if (concerts.length === 0){
    console.error('ERROR IN DATABASE CALL WHEN GETTING CONCERT: NO CONCERT FOUND');
    response.status(404).send('No concerts found!');
    return;
  }

  console.log(`Retrieved concert ${concert_id}`)
  response.end(JSON.stringify(concerts[0]));
});

// Uploads a file to the Google Cloud Datastore Bucket
// Process the file upload and upload to Google Cloud Storage.
app.post('/upload', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
});

/*
Main Server Code
*/

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

