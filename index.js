const express = require('express')
const socket = require('socket.io')
const app = express()
const server = require('http').Server(app)
const io = socket(server)
const bodyparser = require('body-parser')
const path = require('path') 
const cookie = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const mysqlstore = require('express-mysql-session')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const { request } = require('http')
const { response } = require('express')

const port = process.env.PORT || 3000

//app uses and settings
var urlencodedParser = bodyparser.urlencoded({ extended: false })
app.set('views', path.join(__dirname + '/templates/views/'))
app.use(express.static(__dirname + '/templates/'))
app.set('view-engine', 'hbs')
app.use(cookie())
app.use(session({
    secret: 'secret-key',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 1000 * 30}
}))
app.use(passport.initialize())
app.use(passport.session())
var options = {
    host: 'localhost',
    port: '3306',
    user: 'Akhil',
    password: 'Ask2003#',
    database: 'sessions'
};

var sessionStore = new mysqlstore(options);

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

app.use((req,res,next) => {
  req.io = io
  next()
})

////////////////////////////////////////////////////////////////PAGE ROUTES//////////////////////////////////////////////


///////////////////////////////////////////////////////////////*HOME PAGE*/
app.get('/', function(request, response) {
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/home.hbs', {name:request.session.user, board: request.session.board, grade:request.session.grade})
  }
  else{
      response.render(__dirname + '/templates/views/index.hbs', {status: ""})
  }

})

//////////////////////////////////////////////////////////////*REGISTER PAGE*/
app.get('/register', function(request, response){
  response.render(__dirname + '/templates/views/register.hbs')
})
app.post('/register', urlencodedParser, (request,response) => {
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE Email = '"+request.body.email+ "'", async function(error, results){
      if (error) { throw error;}
      else if (results.length > 0) {
          console.log(results);
          return response.render(__dirname + '/templates/views/register.hbs', {message: "Account with this email already exists"})
      }
      else{
          if(request.body.password === request.body.re_password){
              pass = request.body.password
              salt = await bcrypt.genSalt();
              password = await bcrypt.hash(pass, salt)
              console.log(request.body)
              console.log(password)
              let userInput = {
                  name: request.body.name,
                  email: request.body.email,
                  school: request.body.school,
                  board: request.body.board,
                  grade: request.body.grade,
                  password: password
              }

              user.create(userInput, function(lastid){
                  if(lastid){
                      user.find(lastid, function(result){
                          request.session.user = result
                          request.session.opp = 0
                          response.redirect('/login')
                      })
                  }
                  else{
                      response.redirect('/register')
                  }
              })
              /*connection.query("INSERT INTO geeku VALUES (null,'"+request.body.name+ "', '"+request.body.email+"','"+request.body.school+"', '"+request.body.board+"','"+request.body.grade+"','"+password+"')");
              request.session.user = result
              request.session.opp = 0
              response.redirect('/login')*/
          }
          else{
              return response.render(__dirname + '/templates/views/register.hbs', {message: "passwords do not match"})
          }
      }
  })

})

///////////////////////////////////////////////////////////////*LOGIN PAGE*/
app.get('/login', function(request, response){
      response.render(__dirname + '/templates/views/login.hbs')

})
app.post('/login', urlencodedParser, async(request,response) => {
  console.log(request.body);

  connection.query("SELECT Password FROM geeku WHERE Email = '"+request.body.email+"'",  function(error, results){
      if(error) { throw error; }
      else if (results.length > 0){
          console.log(results)
          if(bcrypt.compare(request.body.pass, results[0].Password)){
              console.log('User exists and password matches!')
              connection.query("SELECT ID, Name, School, Board, Grade FROM geeku WHERE Email = '"+request.body.email+"'", function(error, results){
                  if(error){throw error}
                  else{
                      console.log(results)
                      request.session.userid = results[0].ID
                      request.session.user = results[0].Name
                      request.session.board = results[0].Board
                      request.session.grade = results[0].Grade
                      request.session.email = request.body.email
                      request.session.school = results[0].School
                      request.session.opp = 1
                      response.redirect('/')
                  }
              })
          }
          else {
              return response.render(__dirname + '/templates/views/login.hbs', {message: "Password Incorrect" })
          }
      }
      else {
          return response.render(__dirname + '/templates/views/login.hbs', {message: "Incorrect Email" })
      }

  })
})

///////////////////////////////////////////////////////////////////*FORUMS PAGE*/
app.get('/forums', (request, response)=>{
  let user = request.session.user

  if(user){
      response.sendFile(__dirname + '/forums/public/views/index.html')
  }
  else{
      response.redirect('/')
  }
})

app.get('/forums-main', (request, response)=>{
  response.sendFile(__dirname + '/forums/public/views/chat.html')
})

////////////////////////////////////////////////////////////////////*LOGOUT*/
app.get('/logout', (request, response)=>{
  if(request.session.user){
      request.session.destroy(function() {
          response.redirect('/')
      })
  }
})

////////////////////////////////////////////////////////////////*PROFILE PAGE*/
app.get('/profile', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/accounts.hbs', {name: request.session.user, email:request.session.email, school:request.session.school, board:request.session.board, grade:request.session.grade})
  }

})

///////////////////////////////////////////////////////////////*EDIT DETAILS PAGES*/
//edit email
app.get('/edit-email', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_email.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/edit-email', urlencodedParser, function(request, response){
  id = request.session.userid
  console.log("User ID: '"+id+"'")
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE Email = '"+request.body.old+"'", function(error, results){
      if(error){throw error}
      else if (results.length < 0) { response.render(__dirname + '/templates/views/edit_email.hbs', {message: "Email does not exist!"})}
      else if(results.length > 0)
      {
          connection.query("UPDATE geeku SET Email = '"+request.body.new+"' WHERE ID = '"+id+"'")
          connection.query("SELECT * FROM geeku WHERE Email = '"+request.body.new+"'", function(error, results){
          if(error){ throw error}
          else if (results.length < 0){
          response.render(__dirname + '/templates/views/edit_email.hbs', {message: "Email did not change. Renter the details please"})
          }
          else if(results.length > 0){
          request.session.email = request.body.new
          console.log("email has changed")
          response.redirect('/profile')
          }
          })
      }
  })

})

//edit username
app.get('/edit-username', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_name.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/edit-username', urlencodedParser, function(request, response){
  id = request.session.userid
  console.log("User ID: '"+id+"'")
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE Name = '"+request.body.old+"'", function(error, results){
      if(error){throw error}
      else if (results.length < 0) { response.render(__dirname + '/templates/views/edit_name.hbs', {message: "Username does not exist!"})}
      else if(results.length > 0)
      {
          connection.query("UPDATE geeku SET Name = '"+request.body.new+"' WHERE ID = '"+id+"'")
          connection.query("SELECT * FROM geeku WHERE Name = '"+request.body.new+"'", function(error, results){
          if(error){ throw error}
          else if (results.length < 0){
          response.render(__dirname + '/templates/views/edit_name.hbs', {message: "Username did not change. Renter the details please"})
          }
          else if(results.length > 0){
          request.session.user = request.body.new
          console.log("username has changed")
          response.redirect('/profile')
          }
          })
      }
  })
})

//edit school
app.get('/edit-school', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_school.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/edit-school', urlencodedParser, function(request, response){
  id = request.session.userid
  console.log("User ID: '"+id+"'")
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE School = '"+request.body.old+"'", function(error, results){
      if(error){throw error}
      else if (results.length < 0) { response.render(__dirname + '/templates/views/edit_school.hbs', {message: "Incorrect school name has been entered!"})}
      else if(results.length > 0)
      {
          connection.query("UPDATE geeku SET School = '"+request.body.new+"' WHERE ID = '"+id+"'")
          connection.query("SELECT * FROM geeku WHERE School = '"+request.body.new+"'", function(error, results){
          if(error){ throw error}
          else if (results.length < 0){
          response.render(__dirname + '/templates/views/edit_school.hbs', {message: "School did not change. Renter the details please"})
          }
          else if(results.length > 0){
          request.session.school = request.body.new
          console.log("school has changed")
          response.redirect('/profile')
          }
          })
      }
  })
})

//edit board
app.get('/edit-board', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_board.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/edit-board', urlencodedParser, function(request, response){
  id = request.session.userid
  console.log("User ID: '"+id+"'")
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE Board = '"+request.body.old+"'", function(error, results){
      if(error){throw error}
      else if (results.length < 0) { response.render(__dirname + '/templates/views/edit_board.hbs', {message: "Incorrect board name has been entered!"})}
      else if(results.length > 0)
      {
          connection.query("UPDATE geeku SET Board = '"+request.body.new+"' WHERE ID = '"+id+"'")
          connection.query("SELECT * FROM geeku WHERE Board = '"+request.body.new+"'", function(error, results){
          if(error){ throw error}
          else if (results.length < 0){
          response.render(__dirname + '/templates/views/edit_board.hbs', {message: "Board did not change. Renter the details please"})
          }
          else if(results.length > 0){
          request.session.board = request.body.new
          console.log("board has changed")
          response.redirect('/profile')
          }
          })
      }
  })
})

//edit grade
app.get('/edit-grade', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_grade.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/edit-grade', urlencodedParser, function(request, response){
  id = request.session.userid
  console.log("User ID: '"+id+"'")
  console.log(request.body)
  connection.query("SELECT * FROM geeku WHERE Grade = '"+request.body.old+"'", function(error, results){
      if(error){throw error}
      else if (results.length < 0) { response.render(__dirname + '/templates/views/edit_grade.hbs', {message: "Incorrect grade name has been entered!"})}
      else if(results.length > 0)
      {
          connection.query("UPDATE geeku SET Grade = '"+request.body.new+"' WHERE ID = '"+id+"'")
          connection.query("SELECT * FROM geeku WHERE Grade = '"+request.body.new+"'", function(error, results){
          if(error){ throw error}
          else if (results.length < 0){
          response.render(__dirname + '/templates/views/edit_grade.hbs', {message: "Grade did not change. Renter the details please"})
          }
          else if(results.length > 0){
          request.session.grade = request.body.new
          console.log("grade has changed")
          response.redirect('/profile')
          }
          })
      }
  })
})

//change password
app.get('/change-password', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/edit_password.hbs')
  }
  else{
      response.redirect('/')
  }
})
app.post('/change-password', urlencodedParser, function(request, response){
  let id = request.session.userid
  console.log(request.body)

  connection.query("SELECT Password FROM geeku WHERE ID = '"+id+"'", async function(error, results){
      if(error){throw error}
      else if(results.length > 0){
          console.log("User password: '"+results[0].Password+"'")
          console.log("Password User entered: '"+request.body.old+"'")
          console.log("New password: '"+request.body.new+"'")

          if(await bcrypt.compare(request.body.old, results[0].Password)){
              newSalt = await bcrypt.genSalt()
              newPass = await bcrypt.hash(request.body.new, newSalt)
              console.log(newPass)
              connection.query("UPDATE geeku SET Password = '"+newPass+"' WHERE ID = '"+id+"'")
              connection.query("SELECT Password FROM geeku WHERE ID = '"+id+"'", async (error, results)=>{
                  if(error){throw error}
                  else if(results.length > 0){
                      if(await bcrypt.compare(request.body.new, results[0].Password)){
                          console.log("password has changed!")
                          response.redirect('/profile')
                      }
                      else{
                          response.render(__dirname + '/templates/views/change-password.hbs', {message: "Password has not changed. Please renter the details"})
                      }
                  }

              })
          }
      }
  })
})

////////////////////////////////////////////////////////////////////////*RESOURCE PAGES*/
//syllabus PAGE
app.get('/resources/syllabus', function(request, response){
  let user = request.session.user
  let board = request.session.board
  let grade = request.session.grade

  if(user){
      response.render(__dirname + '/templates/views/syllabus.hbs', {board: board, grade:grade})
  }
  else{
      response.redirect('/login')
  }
})

//exams page
app.get('/resources/exams', function(request, response){
  let user = request.session.user

  if(user){
      response.render(__dirname + '/templates/views/exams.hbs', {board: request.session.board, grade:request.session.grade})
  }
  else{
      response.redirect('/login')
  }
})

////////////////////////////////////////////////////////////////////*ERROR PAGE*/
app.use((request, response, next) => {
  var err = new Error('Page Not Found')
  err.status = 404
  next(err)
})
app.use((err, request, response, next) => {
  response.status(err.status || 500)
  response.render(__dirname + '/templates/views/error.hbs')
})


app.listen(port, () => {
  console.log('Listening on '+port)
})