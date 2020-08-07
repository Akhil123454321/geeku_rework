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
        response.render('home', {})
    }
    else{
        response.render('index')
    }
})



/////////////////////////////////REGISTER PAGE/////////////////////////////////////
app.get('/register', function(request, response){
    response.render('register')
})
app.post('/register', urlencodedParser, (request, response)=>{
    console.log(request.body)
    
    connection.query("SELECT * FROM geeku where Name = '"+request.body.name+"'", async function(error, results){
        if(error){throw error}
        
        else if(results.length > 0){
            console.log(results)
            return response.render('register', {message: "Account on this name already exists"})
        }
        else if(results.length < 0){
            connection.query("SELECT * FROM geeku WHERE Email = '"+request.body.email+"' ", function(error, results){
                if(error){throw error}
                
                else if(results.length > 0){
                    return response.render('register', {message: 'Account with this email already exists'})
                }
                else if(results.length < 0){
                    if(request.body.password === request.body.re_password){
                        salt = await bcrypt.genSalt()
                        password = await bcrypt.hash(request.body.password, salt)
                        
                        console.log(request.body)
                        console.log(password)
                        
                        let userInput = {}
                    }
                }
            })
        }
    })
})