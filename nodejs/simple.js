var express = require("express");
var amqp = require('amqplib/callback_api');

var app = express();

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

function fibonacci(n){

  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue('', {
        exclusive: true
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }
        var correlationId = generateUuid();
        var num = parseInt(n);

        console.log(' [x] Requesting fib(%d)', num);

        channel.consume(q.queue, function(msg) {
          if (msg.properties.correlationId == correlationId) {
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(function() {
              connection.close();
            }, 500);
          }
        }, {
          noAck: true
        });

        channel.sendToQueue('rpc_queue',
          Buffer.from(num.toString()),{
            correlationId: correlationId,
            replyTo: q.queue });
      });
    });
  });

}




app.get("/queue", (req, res, next) => {
  console.log(req.query);
  var n = req.query.n;
  console.log(n);
  fibonacci(n);

  res.json(n);
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});