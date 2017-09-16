var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bcrypt = require("bcrypt");
var cookieSession = require("cookie-session")


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  secret: "lighthouse"
}));



app.use(function(request, response, next) {

  response.locals = {

    // user: {},
    // password: request.session.password,
    id: request.session.user_id,
    email: request.session.email
  };
  next();
});

//Creates random ID
function generateRandomString() {
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return randomID;
}

//provides urls for respective user
function urlsForUser(id) {
  let uniqueDatabase = {};
  for(i in urlDatabase) {
    if(urlDatabase[i]["user_id"] === id) {
      uniqueDatabase[i] = urlDatabase[i];
    }
  }
  return uniqueDatabase;
}

//database of urls
var urlDatabase = {
  "b2xVn2": {url: "http://www.lighthouselabs.ca", user_id: 'andy'},
  "9sm5xK": {url: "http://www.google.com", user_id: 'andy'},
};

//database of users
const users = {
  "andy": {
    id: "andy",
    email: "andy@gmail.com",
    hashedPassword: bcrypt.hashSync("andyiscool", 10)
  },
  "mijung": {
    id: "mijung",
    email: "mijung@gmail.com",
    hashedPassword: bcrypt.hashSync("mijungiscool", 10)
  }
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//homepage
app.get("/", (request, response) => {
  if(!response.locals.id) {
    response.redirect(`/login`);
  } else {
    response.redirect(`/urls`);
  }
});

//register page
app.get("/register", (request, response) => {
  response.render('urls_registration');
})

//login page
app.get("/login", (request, response) => {
  response.render('urls_login');
})

//page containing json
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

//page containing user's urls
app.get("/urls", (request, response) => {

  let templateVars = {
    urls: urlsForUser(response.locals.id),
  };
  response.render('urls_index', templateVars);
});

//page to create new url
app.get("/urls/new", (request, response) => {
  if(!response.locals.id) {
    response.redirect(`/login`);
  } else {
    response.render("urls_new");
  }
});

//page for short url
app.get("/urls/:id", (request, response) => {
  let templateVars = {shortURL: request.params.id, longURL: urlDatabase[request.params.id]["url"], urlID: urlDatabase[request.params.id]["user_id"]};
    response.render("urls_show", templateVars);
});

//page after updating url
app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;
  if(longURL[0] != "h") {
    longURL = "http://" + longURL;
  }

  urlDatabase[shortURL] = { url: longURL, user_id: response.locals.id};
  response.redirect(`/urls/${shortURL}`);
})

//redirection to longurl (public)
app.get("/u/:shortURL", (request, response) => {
  var shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL]["url"];
  response.redirect(longURL);
});

//deletes short url
app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  let matchID = urlDatabase[shortURL]["user_id"];
  if(response.locals.id === matchID) {
    delete urlDatabase[shortURL];
  }
  response.redirect(`/urls`);
})

//goes to url page after updating link
app.post("/urls/:id/update", (request, response) => {
  let updatedURL = request.body.longURL;
  urlDatabase[request.params.id] = {url: updatedURL, user_id: response.locals.id};
  response.redirect(`/urls`);
})

//authorizes and authenticates user then redirects to urls
app.post("/login", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  for(i in users) {
    if(email === users[i].email) {
      if(bcrypt.compareSync(password, users[i].hashedPassword)) {
        let id = users[i].id;
        request.session.user_id = id;
        request.session.email = email;
        response.redirect(`/urls`);
        return;
      }
    }
  }
  response.status(403).send("Forbidden");
  return;
})

//logs out and clears cookies
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect(`/login`);
})

//checks valid register and redirects to urls
app.post("/register", (request, response) => {
  let id = generateRandomString();
  let email = request.body.email;
  const hashedPassword = bcrypt.hashSync(request.body.password, 10);

  if(email === "" || hashedPassword === "") {
    response.status(400).send("Bad Request");
    return;
  }
  for(i in users) {
    if(email === users[i].email) {
      response.status(400).send("Bad Request");
      return;
    }
  }
  users[id] = {id, email, hashedPassword};
  request.session.user_id = id;
  request.session.email = email;
  response.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});





