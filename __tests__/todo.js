/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

// eslint-disable-next-line no-unused-vars
let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("List the todo items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("create a new todo", async () => {
    const agent = request.agent(server);
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as complete", async () => {
    const agent = request.agent(server);
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    expect(parsedGroupedResponse.dueToday).toBeDefined();

    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // test("Delete a todo", async () => {
  //   const response = await agent.post("/todos").send({
  //     title: "Delete Todo",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoID = parsedResponse.id;

  //   expect(parsedResponse.id).toBe(3);

  //   const deleteResponse = await agent.delete(`/todos/${todoID}/`).send();
  //   const parsedDeleteResponse = JSON.parse(deleteResponse.text);
  //   expect(parsedDeleteResponse).toBe(true);
  // });
});
