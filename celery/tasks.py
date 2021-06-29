from celery import Celery

celery = Celery('tasks',
                broker='amqp://localhost',
                backend="amqp://localhost"
)

print(celery.backend)

@celery.task(name='tasks.add')
def add(x, y):
    print(x, y)
    return x + y
