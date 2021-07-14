const celery = require('celery-node');
const express = require("express");
const fs = require("fs");
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads'});

const client = celery.createClient(
  "redis://localhost",
  "redis://"
);

const app = express();

app.get("/:op/:a/:b", function(req, res) {
  const a = parseInt(req.params.a);
  const b = parseInt(req.params.b);
  const op = req.params.op;
  
  const task = client.createTask(op);
  const result = task.applyAsync([a, b]);
  
  result.get().then(data => {
    console.log(data);
    res.json({"data": data});
  }).catch(error => {
    res.json({"error": error.exc_message});
  });


});

app.post("/resize", upload.single('image'), function(req, res) {
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);

  if (!req.file) {
    res.json("error");
    return
  }

  const image = fs.readFileSync(req.file.path, {encoding: 'base64'});

  
  const task = client.createTask('resize');
  const result = task.applyAsync([image, width, height]);
  
  result.get().then(data => {
    //console.log(data);
    const img = Buffer.from(data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': img.length
    });
    res.end(img);

  }).catch(error => {
    res.json({"error": error.exc_message});
  });


});


const server = require('http').createServer(app);
server.listen(3000, function() {
    console.log('App started.');
});
