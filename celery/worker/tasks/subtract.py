from celery.decorators import task

@task(name='subtract')
def subtract(x, y):
  return x - y
