const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// boddy parser library 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// Routes of request
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", {...templateVars,
    header: 'partials/_header'});
});
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    };
  res.render("urls_new", { ...templateVars,
    header:'partials/_header'}  );
});
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase)
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    username: req.cookies["username"],
    id,
    longURL
  };
  res.render("urls_show", {
    ...templateVars,
    header: 'partials/_header'
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
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
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
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls")

})
app.post("/logout", (req, res) => {
  const username = req.body;
  console.log(username);
  res.clearCookie("username", username);
  res.redirect("/urls")

})

// listen of our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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