// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
var session = require('express-session');
const flash = require('express-flash');
app.use(flash());
//mongoose
var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/message_db', { useNewUrlParser: true });
mongoose.Promise = global.Promise;

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

//schema
var CommentSchema = new mongoose.Schema({
    name:{type:String, required: true, minlength:2},
    comment:{type:String, required: true, minlength:2},
})
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');
var MessageSchema = new mongoose.Schema({
    name:{type:String, required: true, minlength:2},
    message:{type:String, required: true, minlength:2},
    comments: [CommentSchema]
})
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');

//routes
app.get('/', function(request,response){
    Message.find({}, function (err, messages) {
        if (err) {
            console.log('something went wrong');
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully found all!');
        }
        response.render('dojoboard',{mesg:messages});
    });
    
})
app.post('/publish', function(request, response){
    console.log(request.body);
    var mesg = new Message({name: request.body.clientname, message: request.body.clientmsg});
    mesg.save(function(err){
        if (err) {
            console.log('something went wrong');
            for(var key in err.errors){
                request.flash('registration', 'Input needs to be longer');
            }
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully created message!');
            console.log(mesg);
        }
        response.redirect('/');
    });
    
})
app.post('/publishcom', function(request,response){
    console.log(request.body.comname);
    console.log(request.body.comment);
    var com = new Comment({name: request.body.comname, comment:request.body.comment});
    com.save(function(err){
        if (err) {
            console.log('something went wrong');
            for(var key in err.errors){
                request.flash('registration', 'Input needs to be longer');
            }
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully created comment!');
            console.log(com);
            Message.findOneAndUpdate({_id: request.body.hide}, {$push: {comments:com}},function(err){
                if (err){
                    console.log("couldn't add comment");
                }
                else{
                    console.log("added comment!");
                }
            });
        }
        response.redirect('/');
    });
    
})
app.listen(8000, function () {
    console.log("listening on port 8000");
})