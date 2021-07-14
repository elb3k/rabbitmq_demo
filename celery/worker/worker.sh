#!/bin/bash
celery -A main worker --loglevel=INFO -Ofair --concurrency=4
