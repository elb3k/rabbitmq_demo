const celery = require('celery-node');

const client = celery.createClient(
  "amqp://localhost",
  "amqp://"
);

const express = require("express");
const app = express();
const add = client.createTask("tasks.add");

app.get("/add/:a/:b", function(req, res) {
  const a = parseInt(req.params.a);
  const b = parseInt(req.params.b);
  
  const result = add.applyAsync([a, b]);
  
  result.get().then(data => {
    console.log(data);
    res.json({"data": data});
  });


});

const server = require('http').createServer(app);
server.listen(3000, function() {
    console.log('App started.');
});
