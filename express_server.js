const express = require("express");
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
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
app.use(express.urlencoded({ extended: true }));//populate req.body
app.use(cookieParser())


// Functions

function generateRandomString() {

  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toString();

}

function getUserByEmail(email){
  for( let user in users){
    if(email === users[user].email){
      console.log("here")    
      return users[user];
    }
  }
  return null;

}
function urlsForUser(id){
const userUrl = [];
for (const urlId in urlDatabase){
   const url = urlDatabase[urlId]
   console.log(url.userID , id)
 if(url && url.userID === id){
   userUrl.push({id:urlId, longUrl: url.longURL})
   console.log(userUrl)
 }
}
return userUrl;
}

// Routes of request
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
 const userId = req.cookies["userId"];
 const userUrl = urlsForUser(userId);
 console.log(userUrl)
 console.log(userId)
 
  const templateVars = { 
    userId,
    userUrl };
    //console.log(templateVars)
    const user = users[req.cookies["userId"]];
    //console.log(user)

    if (!userId){
      return res.status(400).send("The user don't have shorten URLs.");
      
    }
    
  res.render("urls_index", {...templateVars,
    header: 'partials/_header', user});
});
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"]
  const templateVars = { 
    userId: userId,
    };
    const user = users[userId];
    if (!userId){
      return res.redirect("/login");
      
    }
  res.render("urls_new", { ...templateVars,
    header:'partials/_header', user}  );
});
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase)
  const id = req.params.id;
  const longUrl = urlDatabase[id].longURL;
  console.log(longUrl)
  const userId= req.cookies["userId"]
  const templateVars = { 
    userId: userId,
    id,
    longUrl, 
  };
  if (!userId){
    return res.redirect("/login");
  }  
  const user = users[req.cookies["userId"]]
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
app.get("/registration", (req, res) => {
  const templateVars = { 
    userId: req.cookies["userId"],
    };  
    const user = users[req.cookies["userId"]];
  res.render("user_registration",{ ...templateVars,
    header:'partials/_header'}, user );
});

app.get("/login", (req, res) => {
  const userId = req.cookies["userId"];
  if (userId){
    return res.redirect("/urls");
  } 
  const templateVars = { 
    userId: req.cookies["userId"],
    };  
    const user = users[req.cookies["userId"]];
  res.render("login",{ ...templateVars,
     user})
  
  
});

app.get("/urls/:id/delete", (req, res) =>{
  const userId = req.cookies["userId"];
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

app.post("/login", (req, res) => {

   // pull the info off the body object
   const email = req.body.email;
   const password = req.body.password;
   const findUser = getUserByEmail(email);

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
  // set a cookie and redirect the user
  res.cookie('userId', findUser.id);
  
 
  res.redirect('/urls');


})

app.post("/registration", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const findEmail = getUserByEmail(email)
  if(findEmail !== null){
    return res.status(403).send("This email is registred in our sistem");
  } 
 
  if (!email || !password){
     res.status(400).send("Please enter a email AND a password")
     
  };
  const hash = bcrypt.hashSync(password, 10);

  users[userId]  = {id: userId, email: email, password: hash}
  console.log(users)
  
  res.cookie("userId", userId)
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["userId"];

  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: userId
  };
  
  console.log(urlDatabase)
  
  res.redirect(`/urls`);
});


app.post("/urls/:id/delete", (req, res)=> {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect("/urls");
})
// app.get("/urls:id/edit", (req, res) => {
//   const templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });
app.post("/urls/:id/edit", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const id = req.params.id;
  console.log(id)
  const longURL = req.body.longURL;  
  console.log(longURL)
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

// app.post("/login", (req, res) => {
//   const userId = req.body;
//   console.log(username);
//   res.cookie("username", username);
//   res.redirect("/urls")

// })
app.post("/logout", (req, res) => {
  const userId = req.body;
  console.log(userId);
  res.clearCookie("userId", userId);
  res.redirect("/login")

})

// listen of our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

