const express   = require('express')
const mysql     = require('mysql')
const path      = require('path')
const bodyparser= require('body-parser')
const expressValidator = require('express-validator')


//starting the app
const app = express()

//body parser setting
var urlencodedParser = bodyparser.urlencoded({ extended: false });

//validator setting
app.use(expressValidator());

//static folder
app.use(express.static(__dirname + '/templates/'))

//view engine
app.set('views', path.join(__dirname + '/templates/views/'))
app.set('view engine', 'hbs')


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


  ///////////////////////////////////////////////////////////////////////////

  //index page
  app.get('/', (request, response)=>{
      response.render('index')
  })

  //register page
  app.get('/register', (request, response)=>{
      response.render('register')
  })

  app.post('/register', urlencodedParser, (request, response)=>{
      console.log(request.body)

      request.checkBoyd

  })
  //login page
  app.get('/login', (request, response)=>{
      response.render('login')
  })

  //app is listening
  app.listen(3000, ()=>{
      console.log("LISTENING ON PORT 3000")
  })