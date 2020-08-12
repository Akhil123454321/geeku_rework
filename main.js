////////////PREREQUISITE SETTINGS AND CONFIGURATIONS/////////////////////

//importing node modules
const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt')
const mysql = require('mysql')
const session = require('express-session')
const sessionstore = require('express-mysql-session')
const cookie = require('cookie-parser')
const validator = require('express-validator')
//var User = require('./templates/cores/users')

//starting the app
const app = express()

//body-parser settings
var urlencodedParser = bodyparser.urlencoded({ extended: false })

//express validator 
const validatorOptions = {
    
}
//app.use(validator(validatorOptions))

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
    //store: sessionStore,
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
        response.render('home', {})
    }
    else{
        response.render('index')
    }
})



//////////////////////////////////////////////////////////REGISTER PAGE
//step1 settings start //
app.get('/register-step1', (request, response)=>{
    response.render('register', {step1: "Step 1"})
})
app.post('/register-step1', urlencodedParser, function(request, response){
    console.log(request.body)
    if(request.body.student == "on"){
        var type = "student"
        console.log(type)
    }
    else if(request.body.teacher == "on"){
        var type = "teacher"
        console.log(type)
    }
    userInput = {
        fname:  request.body.fname,
        lname:  request.body.lname,
        email:   request.body.email, 
        type: type
    }
    
    response.redirect('/register-step2')
})
//step1 settings end//

//step2 settings start//o
app.get('/register-step2', (request, response)=>{
    response.render('register', {step2: "Step 2"})
})
app.post('/register-step2', urlencodedParser, function(request, response){
    console.log(request.body)
})


//app listening
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log("App is listening on port '"+PORT+"'")
})