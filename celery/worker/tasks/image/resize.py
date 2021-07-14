import cv2
import base64
from imageio import imread

from celery.decorators import task

def b64img_decode(img):
  img = imread(base64.b64decode(img))
  return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

def b64img_encode(img):
  retval, buffer = cv2.imencode('.jpg', img)
  img = base64.b64encode(buffer).decode()
  return img


@task(name="resize")
def resize(img, width, height):
  print(width, height)
  
  # Loaded image
  img = b64img_decode(img)
  
  # Resize image
  img = cv2.resize(img, (width, height))

  # Encode back to base64
  img = b64img_encode(img)
  return img
