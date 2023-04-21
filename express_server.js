const express = require("express");
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString, getUserByEmail, urlsForUser} = require("./helpers");
//const cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

// configuration
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$MmM6RsL7Sj4C5omPWxnxXey1qh4rJxiOzgomTX8eb.MvqKWBMZ/u2",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$MmM6RsL7Sj4C5omPWxnxXey1qh4rJxiOzgomTX8eb.MvqKWBMZ/u2",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "usera3@example.com",
    password: "$2a$10$MmM6RsL7Sj4C5omPWxnxXey1qh4rJxiOzgomTX8eb.MvqKWBMZ/u2",
  },
};
// boddy parser library 
// middleware

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));//populate req.body
app.use(cookieSession({
  name: 'my-cookie',
  keys: ["alsjfghnfidekw2434sd"]

}));



// Routes of request

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/registration", (req, res) => {
  const templateVars = { 
    userId: req.session.userId,
    };  
    const user = users[req.session.userId];
  res.render("user_registration",{ ...templateVars,
    header:'partials/_header'}, user );
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  if (userId){
    return res.redirect("/urls");
  } 
  const templateVars = { 
    userId: req.session.userId,
    };  
    const user = users[req.session.userId];
  res.render("login",{ ...templateVars,
     user}) 
  
});
app.get("/urls", (req, res) => {
 const userId = req.session.userId;
 const userUrl = urlsForUser(userId, urlDatabase);
  const templateVars = { 
    userId,
    userUrl };
    const user = users[req.session.userId];
    if (!userId){
    return res.redirect("/login");      
    }
    
  res.render("urls_index", {...templateVars,
    header: 'partials/_header', user});
});
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const templateVars = { 
    userId: userId,
    };
    const user = users[userId];
   
    if (!userId){
      return res.redirect("/login");      
    }
  res.render("urls_new", { ...templateVars,
    header:'partials/_header', user} );
});
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;  
  const userId= req.session.userId;
  const urlsUser = urlsForUser(userId, urlDatabase)
  console.log(urlsUser.longUrl)
 const index = urlsUser.findIndex(i => i.id === id);
 if(index === -1){
  return res.redirect("/login");
 }
  const user = users[req.session.userId];
  const longUrl = urlDatabase[id].longURL;
  const templateVars = { 
    userId: userId,
    id,
    longUrl, 
  };
  if (!userId){
    return res.redirect("/login");
  }  
  
  res.render("urls_show", {
    ...templateVars,
    header: 'partials/_header', user
  });
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});


app.get("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  console.log(urlId);
  const userUrl = urlsForUser(userId) ;
  if (!userId){
    return res.status(403).send("The user does not logged");
  } else if (urlDatabase[urlId].userID !== userId){
    return res.status(403).send("The user does not own the URL.");
  }
  if (!userUrl[urlId]){
    return res.status(403).send("The short URL does not exist");
  }
})

// Post section


app.post("/login", (req, res) => {

   // pull the info off the body object
   const email = req.body.email;
   const password = req.body.password;
   const findUser = getUserByEmail(email, users);

   if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

   if(!findUser){
    return res.status(400).send("This email is not registred in our sistem");
  } 
 // does the provided password NOT match the one from the database
 if (!bcrypt.compareSync(password, findUser.password)) {
  // if (foundUser.password !== password) {
    return res.status(400).send('passwords do not match');
  }
  
  //happy path! The user is who they say they are!
   req.session.userId = findUser.id;
   res.redirect('/urls');


})

app.post("/registration", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const findEmail = getUserByEmail(email);
  if(findEmail !== null){
    return res.status(403).send("This email is registred in our sistem");
  } 
 
  if (!email || !password){
     res.status(400).send("Please enter a email AND a password")
     
  };
  const hash = bcrypt.hashSync(password, 10);

  users[userId]  = {id: userId, email: email, password: hash};
  //res.cookie("userId", userId)
  req.session.userId = userId;

  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: userId
  };
  res.redirect(`/urls`);
});


app.post("/urls/:id/delete", (req, res)=> {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
})

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;  
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  const userId = req.body;
  console.log(userId);
  req.session = null;
  res.redirect("/login")

})

// listen of our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

