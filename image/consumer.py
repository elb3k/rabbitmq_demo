import threading
import pika
import time
import json
import cv2
import base64
from imageio import imread

def func(body):
    body = json.loads(body)
    # Load image
    img = imread(base64.b64decode(body["image"]))
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Resize
    width, height = body["width"], body["height"]
    # print(width, height)
    img = cv2.resize(img, (width, height))

    # Encode to base64
    retval, buffer = cv2.imencode(".jpg", img)
    img = base64.b64encode(buffer).decode()

    return json.dumps({"img": img})

QUEUE_NAME = 'rpc_queue'
EXCHANGE = ''
THREADS = 4

class ThreadedConsumer(threading.Thread):

  def __init__(self):

    threading.Thread.__init__(self)

    # Establish a connection
    parameters = pika.ConnectionParameters('localhost')
    connection = pika.BlockingConnection(parameters)
    self.channel = connection.channel()

    self.channel.queue_declare(queue=QUEUE_NAME)
    self.channel.basic_qos(prefetch_count=THREADS*10)
    self.channel.basic_consume(QUEUE_NAME, on_message_callback=self.callback)
    threading.Thread(target=self.channel.basic_consume(QUEUE_NAME, on_message_callback=self.callback))

  def callback(self, channel, method, properties, body):
    # print("Received a message:", body)
    response = func(body)

    channel.basic_publish(exchange=EXCHANGE,
                            routing_key=properties.reply_to,
                            properties=pika.BasicProperties(correlation_id=properties.correlation_id),
                            body=str(response))

    channel.basic_ack(delivery_tag=method.delivery_tag)

  def run(self):
    print("Starting thread to consume from rabbit...")
    self.channel.start_consuming()



def main():
  for i in range(THREADS):
    print('launch thread', i)
    td = ThreadedConsumer()
    td.start()

main()

