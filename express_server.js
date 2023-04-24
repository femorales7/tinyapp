const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");
var cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

// configuration
app.set("view engine", "ejs");
// information about short URl and long URls
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
// user registred
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

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false })); //populate req.body
app.use(
  cookieSession({
    name: "my-cookie",
    keys: ["alsjfghnfidekw2434sd"],
  })
);

// Routes of request

// Home page redirect to login

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/registration", (req, res) => {
  const templateVars = {
    userId: req.session.userId,
  };
  const user = users[req.session.userId];
  res.render(
    "user_registration",
    { ...templateVars, header: "partials/_header" },
    user
  );
});

//Login if the user is registered redirect to Urls

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    userId: req.session.userId,
  };
  const user = users[req.session.userId];
  res.render("login", { ...templateVars, user });
});

// URls if user is not registred redirect to login page.
// if the user is registred brin their own urls

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const userUrl = urlsForUser(userId, urlDatabase);
  const templateVars = {
    userId,
    userUrl,
  };
  const user = users[req.session.userId];
  if (!userId) {
    return res.redirect("/login");
  }
  console.log(users);

  res.render("urls_index", {
    ...templateVars,
    header: "partials/_header",
    user,
  });
});

// registration of new urls, the user have to be logged.

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const templateVars = {
    userId: userId,
  };
  const user = users[userId];

  if (!userId) {
    return res.redirect("/login");
  }
  res.render("urls_new", { ...templateVars, header: "partials/_header", user });
});

// only the logged in user has access and only shows urls owned by the logged in user.

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;
  if (!userId) {
    return res.status(403).send("The user does not logged");
  }
  const urlsUser = urlsForUser(userId, urlDatabase);
  console.log(urlsUser.longUrl);
  const index = urlsUser.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(403).send("The user is not owner of this Url");
  }
  const user = users[req.session.userId];
  const longUrl = urlDatabase[id].longURL;
  const templateVars = {
    userId: userId,
    id,
    longUrl,
  };

  res.render("urls_show", {
    ...templateVars,
    header: "partials/_header",
    user,
  });
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Only redirect to existing urls if the short url does not exist show error message.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  console.log(urlDatabase[id]);
  if (urlDatabase[id] === undefined) {
    res.status(404).send("Short URL not found");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// Post section

// login validation with pasword decryption
app.post("/login", (req, res) => {
  // pull the info off the body object
  const email = req.body.email;
  const password = req.body.password;
  const findUser = getUserByEmail(email, users);
  // validation of imput of both values
  if (!email || !password) {
    return res.status(400).send("Please provide an email AND a password");
  }

  if (!findUser) {
    return res.status(400).send("This email is not registred in our sistem");
  }
  // does the provided password NOT match the one from the database
  if (!bcrypt.compareSync(password, findUser.password)) {
    return res.status(400).send("passwords do not match");
  }

  //happy path! The user is who they say they are!
  req.session.userId = findUser.id;
  res.redirect("/urls");
});
// Registration with validation if the user's email already exists and password encryption
app.post("/registration", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const findEmail = getUserByEmail(email);
  if (findEmail !== null) {
    return res.status(403).send("This email is registred in our sistem");
  }

  if (!email || !password) {
    res.status(400).send("Please enter a email AND a password");
  }
  const hash = bcrypt.hashSync(password, 10); // encryption process

  users[userId] = { id: userId, email: email, password: hash };
  req.session.userId = userId;

  res.redirect(`/urls`);
});

// show urls for user logged and only show url of user logged

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(); // call function to genered id random
  urlDatabase[shortURL] = {
    longURL,
    userID: userId,
  };
  res.redirect(`/urls`);
});

// delete urls only for logged user  and they can only delete their own urls

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  const userUrl = urlsForUser(userId);

  if (!userId) {
    // valitadion if the user is logged
    return res.status(403).send("The user does not logged");
  } else if (urlDatabase[urlId].userID !== userId) {
    //validation if the user is owner of the Url
    return res.status(403).send("The user does not own the URL.");
  }
  // if (!userUrl[urlId]){  // validation if the url exist in the databases
  //   return res.status(403).send("The short URL does not exist");
  // }
  delete urlDatabase[urlId];
  res.redirect("/urls");
});

// edit funtion is allowed only for logged user and for their own urls

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
  res.redirect("/login");
});

// listen of our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
