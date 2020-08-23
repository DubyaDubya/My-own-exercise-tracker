const express =require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require("./models/user");
const Exercise = require("./models/exercise");
process.env.MONGODB_URI="mongodb+srv://wmw31:johncarroll1@cluster0.80caa.mongodb.net/cluster0?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
//middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
//route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

//add a new user
app.post('/api/exercise/new-user', (req, res) =>{
    var newUser = User({username: req.body.username});
    newUser.save((err,data) =>{
        if (err) return res.json({"error": "error saving to the database"});
        res.json({"username": newUser.username, "_id": newUser._id});
    });
});

//check list of users
app.get('/api/exercise/users', (req, res) => {
    User.find({}, (err, userList) => {
        var userReturnList = [];
        if (err) return res.send(err);
        for (let i = 0;i < userList.length; i++){
            userReturnList.push({"_id": userList[i]._id,
             "username": userList[i].username});
        }
        res.send(userReturnList);
    });
});

//add an exercise
app.post('/api/exercise/add', (req,res) => {
    var newExercise = Exercise({
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration});
    if(/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)){
        newExercise.date = new Date(req.body.date);
    };
    newExercise.save((err,data) => {
        if (err) return res.send("error saving exercise to database.");
    });
    User.findById(newExercise.userId, (err, user) => {
        if (err) return res.send("error finding user info");
        res.json({"_id" : user._id, "username": user.username,
        "date" : newExercise.date.toDateString(), 
        "duration": newExercise.duration,
        "description": newExercise.description});
    });
});

//get the log of exercises
app.get("/api/exercise/log", (req, res) => {
    var uId = req.query.userId;
    User.findById(uId, (err, user) =>{
        if (err) return res.send("Error finding User info");

        //total exercise list
        Exercise.find({userId: uId}, (err, exList) =>{
            if (err) return res.send("Error Finding exercises");
            if (req.query.from) {
                var from = new Date(req.query.from);
                exList = exList.filter(ex => +ex.date >= +from);
            }
            if (req.query.to) {
                var to = new Date(req.query.to);
                exList = exList.filter(ex => +ex.date <= +to);
            }
            if (req.query.limit){
                exList = exList.slice(0,req.query.limit);
            }
            var nuevoListo=[];
            for (let i = 0; i< exList.length; i++){
                nuevoListo.push({"description": exList[i].description,
                "duration": exList[i].duration,
                "date": exList[i].date.toDateString()});
            }
            res.json({"_id":uId, "username" : user.username,
            "count": nuevoListo.length, "log": nuevoListo});
        });
    });
});

//Listener
const listener =app.listen(8000, () =>{
    console.log('Your app is listening on port ' + listener.address().port);
});

