const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { Todo, User } = require("./models");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", async (request, response) => {
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completed = await Todo.completed();
  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo application",
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      completed,
    });
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", { csrfToken: request.csrfToken() });
});
// eslint-disable-next-line no-unused-vars
app.get("/todos", async (request, response) => {
  console.log("Todo List");
  try {
    const todos = await Todo.getAllTodos();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/users", async function (request, response) {
  // eslint-disable-next-line no-unused-vars
  const user = await User.create({
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    password: request.body.password,
  }).catch((error) => {
    console.log(error);
  });
  response.redirect("/"); // Redirected to root path
});

app.post("/todos", async (request, response) => {
  console.log("Creating a new Todo", request.body);
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    // return response.json(todo);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("We have to update a todo with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  console.log(request.body.completed);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    return response.status(422).json(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    if (todo) {
      await Todo.deleteTodo(request.params.id);
      return response.json(true);
    }
    response.json(false);
  } catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
