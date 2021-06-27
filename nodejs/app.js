'use strict';

const express = require('express');
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


app.get('/fibonacci/:number', function(req, res) {
  const number = parseInt(req.params.number);
  const message = Buffer.from(JSON.stringify({ "n": number }));
  messager.sendMessage(message)
    .then(msg => {
      const result = JSON.parse(msg.toString());
      res.json({"number": number, "result": result});
    });
});

const server = require('http').createServer(app);
server.listen(3000, function() {
  console.log('App started.');
});
