'use strict';

const express = require('express');
const multer = require('multer');
const fs = require("fs");
const upload = multer({dest: __dirname + '/uploads/images'});
const app = express();

const amqpClient = require('./amqpClient');


const SEND_QUEUE = "rpc_queue";
const REPLY_QUEUE = "amq.rabbitmq.reply-to";

// Init
let messager;
amqpClient.createClient({ url: 'amqp://localhost', send_queue: SEND_QUEUE, reply_queue: REPLY_QUEUE })
  .then(m => {
    messager = m;
  });


app.use(express.static('public'));

app.post('/image', upload.single('image'), function(req, res) {
  
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);
  
  //console.log(height, width);

  if(! (req.file) ) {
    res.json("error");
  }
  //console.log(req.file);
  const image = fs.readFileSync(req.file.path, {encoding: 'base64'});

  
  const message = Buffer.from(JSON.stringify({ "width": width, "height": height, "image": image }));
  messager.sendMessage(message)
    .then(msg => {
      const result = JSON.parse(msg.toString());
      const img = Buffer.from(result.img, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Content-Length': img.length
      });

      res.end(img);
      
      //res.json(result);

    });
});

const server = require('http').createServer(app);
server.listen(3000, function() {
  console.log('App started.');
});
