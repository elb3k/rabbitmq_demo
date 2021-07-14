from celery.decorators import task

@task(name='div')
def div(x, y):
  return x / y
