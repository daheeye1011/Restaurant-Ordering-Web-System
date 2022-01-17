const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const pug = require("pug");
const userModel = require("./UserModel");
const orderModel = require("./OrderModel");
const app = express();
const MongodbStore = require("connect-mongodb-session")(session);

//Golbal Variables
let users = {};

let MongoStore = new MongodbStore({
  uri: "mongodb://localhost/a4",
  collection: "sessions",
});
MongoStore.on("error", (error) => {
  console.log(error);
});

app.set("view engine", "pug");

app.use(
  session({
    secret: "some secret here",
    resave: true,
    saveUninitialized: false,
    store: MongoStore,
  })
);

app.use("/static", express.static("./static/"));
app.use(express.static("partials"));
app.use(express.static("views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handles the home page.
app.get("/", home);
// Handles the logout page.
app.get("/logout", logout, home);
// Handles the user login.
app.post("/login", login);
// Handles the user registration.
app.post("/registration", register);

// Handles the login page.
app.get("/login", (req, res) => {
    if (req.session.loggedin) {
        res.status(200).send("Already logged in.");
        return;
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(
        pug.renderFile("./public/views/login.pug", { session: req.session })
    );
});
// Handles the registration page.
app.get("/registration", (req, res) => {
    if (req.session.loggedin) {
        res.status(200).send("logged in; If you want to register, please log out.");
        return;
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(
        pug.renderFile("./public/views/registration.pug", { session: req.session})
    );
});

// Handles the order page.
app.get("/orderform", (req, res) => {
    if (!req.session.loggedin) {
        res.status(200).send("please logged in, if you want to order.");
        return;
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(
        pug.renderFile("./public/views/orderform.pug", { session: req.session})
    );
});

// saves the user's order to a mongodb collection.
app.post("/orders", (req, res) => {
    let username = req.session.username, userId = req.session.userId, 
    restaurantID = req.body.restaurantID, restaurantName = req.body.restaurantName, 
    subtotal = req.body.subtotal, total = req.body.total, fee = req.body.fee, 
    tax = req.body.tax, order = req.body.order;
 
    orderModel.create({username, userId, restaurantID, restaurantName, 
        subtotal, total, fee, tax, order}, function (err, result) {
        if (err) throw err;
        res.status(200).send(req.session.userId);
    });

});

// Handles the order summary page.
app.get("/orders/:orderId", (req, res) => {
    let id = req.params.orderId;
    orderModel.findById(id, function(err, result){
        if (err) throw err;
        let orderedItems = result.order;
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(
            pug.renderFile("./public/views/orderSummary.pug", {  
              orderedItems, order: result, session: req.session})
        );
    });
});

// Handles the users page.
app.get("/users", (req, res) => { 
    let name = req.query.name;
    let array = [];
    userModel.find({privacy: false}, function(err, result){
        if (err) throw err;
        if(name != undefined) {
            result.forEach((user) => {
                if (user.username.includes(req.query.name)){
                    array.push(user);
                }
            });
        } else {
            result.forEach((user) => {array.push(user);});
        }
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(
            pug.renderFile("./public/views/directory.pug", { session: req.session, users: array })
        ); 
    });

});

// Handles the profile page.
app.get("/user/:id", (req, res) => {
    let id = req.params.id;
    let userId = 1;
    Object.keys(users).forEach((name) =>{if(users[name].id == id){ userId = users[name].id;}});
    if(userId != id) {
        res.status(400).send('Wrong Id');
        return;
    } 
    userModel.findById(userId, function(err, result){
        if (err) throw err;
        if (result.privacy && id != req.session.userId) {
            res.status(403).send('Unauthorized');
            return;
        }

        orderModel.find({userId: userId}, function(error, orderResult){
          if (error) throw error;
          let order = [];
          Object.values(orderResult).forEach((result) => { order.push(result.id); });
          res.setHeader("Content-Type", "text/html");
          res.status(200).send(
              pug.renderFile("./public/views/profile.pug", {  
                  username: result.username, userId: req.session.userId, session: req.session, order})
          );
        });
    });
    
});

// updates the user's privacy status.
app.put(`/user/:id`, (req, res) => {
    let id = req.params.id;
    let privacy = req.body.privacy;
    userModel.findById(id, function(err, result){
        if (err) throw err;
        result.privacy = privacy;
        users[result.username].privacy = privacy;
        result.save(function(err, result){
          if (err) throw err;
        });
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(
        pug.renderFile("./public/views/registration.pug", { session: req.session})
    );
});

// helper function for home page
function home(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.send(pug.renderFile("./public/views/home.pug", { session: req.session, userId: req.session.userId }));
}

// helper function for login page
function login(req, res, next) {
  if (req.session.loggedin) {
    res.status(200).send("Already logged in.");
    return;
  }

  let username = req.body.username;
  let password = req.body.password;

  if (!users.hasOwnProperty(req.body.username)) {
    res.status(401).send("Unauthorized");
    return;
  }

  if (users[username].password === password) {
    req.session.loggedin = true;
    req.session.username = username;
    req.session.userId = users[username].id;
    res.status(200).send("Logged in");
  } else {
    res.status(401).send("Not authorized. Invalid password.");
  }
}

// helper function for logout page
function logout(req, res, next) {
  if (req.session.loggedin) {
    req.session.loggedin = false;
    req.session.username = undefined;
    req.session.password = undefined;
    req.session.userId = undefined;
    next();
  }
}

// helper function for registration page
function register(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    
    if (users.hasOwnProperty(`${req.body.username}`)) {
        res.status(401).send();
    } else {
        userModel.create({username, password, privacy: false}, function (err, result) {
            if (err) throw err;
            users[`${username}`] = result;
            req.session.loggedin = true;
            req.session[`username`] = username;
            req.session[`password`] = password;
            req.session.userId = result.id;
    
            res.status(200).send(req.session.userId);
        });

    }
}

mongoose.connect(
  "mongodb://localhost/a4" 
);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connectinq to database"));
db.once("open", function () {
  userModel.init(() => {});
  userModel.find(function (err, result) {
    if (err) throw err;
    result.forEach((user) => {
      users[`${user["username"]}`] = user;
    });

  });
});


app.listen(3000 || process.env.PORT);
console.log("Server listening on port 3000");
