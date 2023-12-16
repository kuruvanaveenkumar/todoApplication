const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

let dataBase = null;

const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const scenario1 = (status) => status !== undefined;
const scenario2 = (priority) => priority !== undefined;
const scenario3 = (priority, status) =>
  priority !== undefined && status !== undefined;

const scenario4 = (search_q) => search_q !== undefined;

let details = null;

app.get("/todos/", async (request, response) => {
  const query = `SELECT * FROM todo;`;
  const { status, priority, search_q } = request.query;

  switch (true) {
    case scenario1(status):
      const query1 = `SELECT * FROM todo WHERE status = '${status}';`;
      details = await dataBase.all(query1);
      break;
    case scenario2(priority):
      const query2 = `SELECT * FROM todo WHERE priority = '${priority}';`;
      details = await dataBase.all(query2);
      break;
    case scenario3(priority, status):
      const query3 = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}';`;
      details = await dataBase.all(query3);
    case scenario4(search_q):
      const query4 = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      details = await dataBase.all(query4);
  }
  response.send(details);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const getDetail = await dataBase.get(getQuery);
  response.send(getDetail);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createQuery = `INSERT INTO todo(
                            id, todo, priority, status)
                            VALUES('${id}', '${todo}', '${priority}', '${status}');`;
  await dataBase.run(createQuery);
  response.send("Todo Successfully Added");
});

const bodySc1 = (status) => status !== undefined;
const bodySc2 = (priority) => priority !== undefined;
const bodySc3 = (todo) => todo !== undefined;

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  switch (true) {
    case bodySc1(status):
      const updateQuery = `UPDATE TODO SET status = '${status}' WHERE id = '${todoId}';`;
      await dataBase.run(updateQuery);
      details = "Status Updated";
      break;
    case bodySc2(priority):
      const UpPriority = `UPDATE TODO SET priority='${priority}' WHERE id = '${todoId}';`;
      await dataBase.run(UpPriority);
      details = "Priority Updated";
      break;
    case bodySc3(todo):
      const UpTodo = `UPDATE TODO SET todo = '${todo}' WHERE id = '${todoId}';`;
      await dataBase.run(UpTodo);
      details = "Todo Updated";
      break;
  }

  response.send(details);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}';`;
  dataBase.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
