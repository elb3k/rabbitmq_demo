#!/bin/bash
celery worker -A tasks --loglevel=INFO
