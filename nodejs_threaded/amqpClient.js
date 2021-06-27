'use strict';
const amqp = require('amqplib');
const EventEmitter = require('events');

// this queue name will be attached to "replyTo" property on producer's message,

/**
 * Create amqp channel and return back as a promise
 * @params {Object} setting
 * @params {String} setting.url
 * @params {String} setting.send_queue
 * @params {String} setting.reply_queue
 * @returns {Promise} - return amqp channel
 */
const createClient = (setting) => amqp.connect(setting.url)
  .then(conn => conn.createChannel()) // create channel
  .then(channel => {
    

    channel.responseEmitter = new EventEmitter();
    channel.responseEmitter.setMaxListeners(0);
    channel.consume(setting.reply_queue,
      msg => channel.responseEmitter.emit(msg.properties.correlationId, msg.content),
      { noAck: true });
    
    
    const ret = {};
    ret.channel = channel
    ret.SEND_QUEUE = setting.send_queue;
    ret.REPLY_QUEUE = setting.reply_queue;
    
    /**
     * Send message to waiting queue and return promise object when
     * event has been emitted from the "consume" function
     * @params {String} message - message to send to consumer
     * @returns {Promise} - return msg that send back from consumer
    */
    ret.sendMessage = (message) => new Promise(resolve => {
      
      // unique random string
      const correlationId = generateUuid();
      
      ret.channel.responseEmitter.once(correlationId, resolve);
      ret.channel.sendToQueue(ret.SEND_QUEUE, message, { correlationId, replyTo: ret.REPLY_QUEUE});
    });

    return ret;
  });

// this function will be used to generate random string to use as a correlation ID
function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

module.exports.createClient = createClient;
