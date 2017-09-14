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

const users = {
  "andy": {
    id: "andy",
    email: "andy@gmail.com",
    password: "andyiscool"
  },
  "mijung": {
    id: "mijung",
    email: "mijung@gmail.com",
    password: "mijungiscool"
  }
}

app.use(function(request, response, next) {
  response.locals = {

    user: {},
    password: request.cookies["password"],
    id: request.cookies["user_id"]
  };
  next();
});


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/register", (request, response) => {
  response.render('urls_registration');
})

app.get("/login", (request, response) => {
  response.render('urls_login');
})

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[response.locals.id]
  };
  response.render('urls_index', templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:id", (request, response) => {
  let templateVars = {shortURL: request.params.id, longURL: urlDatabase[request.params.id]};
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
  let email = request.body.email;
  let password = request.body.password;

  for(i in users) {
    if(email === users[i].email) {
      if(password === users[i].password) {
        let id = users[i].id;
        console.log(users);
        response.cookie("user_id", id);
        response.redirect(`/urls`);
        return;
      }
    }
  }
  response.status(403).send("Forbidden");
  return;
})

app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect(`/login`);
})

app.post("/register", (request, response) => {
  let id = generateRandomString();
  let email = request.body.email;
  let password = request.body.password;

  if(email === "" || password === "") {
    response.status(400).send("Bad Request");
    return;
  }
  for(i in users) {
    if(email === users[i].email) {
      response.status(400).send("Bad Request");
      return;
    }
  }
  users[id] = {id, email, password};
  response.cookie("user_id", id);
  response.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});





