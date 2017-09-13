var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
app.use(cookieParser());

function generateRandomString() {
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));

  return randomID;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  let templateVars = {urls: urlDatabase, username: request.cookies["username"]};
  response.render('urls_index', templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = {username: request.cookies["username"]};
  response.render("urls_new", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let templateVars = {shortURL: request.params.id, longURL: urlDatabase[request.params.id], username: request.cookies["username"]};
  response.render("urls_show", templateVars);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;
  urlDatabase[shortURL] = longURL;
  response.redirect(`/urls/${shortURL}`);
})

app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  delete urlDatabase[shortURL];
  response.redirect(`/urls`);
});

app.post("/urls/:id/update", (request, response) => {
  let updatedURL = request.body.longURL;
  urlDatabase[request.params.id] = updatedURL
  response.redirect(`/urls`);
})

app.post("/login", (request, response) => {
  response.cookie("username", request.body.username);
  response.redirect(`/urls`);
})

app.post("/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





