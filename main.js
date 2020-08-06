////////////PREREQUISITE SETTINGS AND CONFIGURATIONS/////////////////////

//importing node modules
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt')
const mysql = require('mysql')
const session = require('express-session')
const sessionstore = require('express-mysql-session')
const cookie = require('cooki-parser')
var User = require('./templates/cores/users')

//starting the app
const app = express()

//body-parser settings
ar urlencodedParser = bodyparser.urlencoded({ extended: false })

//static library
app.use(express.static(__dirname + '/templates/'))

//setting up the view engine
app.set('views', path.join(__dirname + '/templates/views/'))
app.set('view engine', 'hbs')

//settings up the sessions
app.use(cookie())
app.use(session({
    secret: 'secret-key',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 1000 * 30}
}))

//DB connection settings
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'Akhil',
    password : 'Ask2003#',
    database : 'accounts'
  });

  connection.connect((error)=>
  {
      if(error)
      {
          console.log('Accounts DB connection failed' + JSON.stringify(error, undefined, 2));
      }
      else {
          console.log('Accounts DB connection was successful');
      }
  });


////////////////////////PAGE ROUTES/////////////

////////////////////////// HOME PAGE ////////
app.get('/', function(request, response){
    let user = request.session.user
    
    if(user){
        response.render()
    }
})