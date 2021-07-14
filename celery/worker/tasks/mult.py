from celery.decorators import task

@task(name='mult')
def mult(x, y):
  return x * y
