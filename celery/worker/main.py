from celery import Celery
from tasks import *


## Celery settings

CELERYD_TASK_SOFT_TIME_LIMIT = 30


## [END] Celery settings

app = Celery('tasks',
                broker='redis://localhost',
                backend="redis"
)


if __name__ == '__main__':
  app.start()
