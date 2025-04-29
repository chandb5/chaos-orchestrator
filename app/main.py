from fastapi import FastAPI
from prometheus_client import Counter, Summary, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

import random
import time

app = FastAPI()

REQUEST_COUNT = Counter("request_count", "Total number of requests")
REQUEST_LATENCY = Summary("request_latency_seconds", "Request latency in seconds")

@app.get("/")
def index():
    return {"message": "Chaos Ochestrator is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/unstable")
def unstable_endpoint():
    x = random.randint(0, 12)
    if x < 4:
        raise Exception("Internal Server Error")
    elif x < 7:
        raise Exception("Service Unavailable")
    elif x < 9:
        raise Exception("Too Many Requests")
    else:
        return {"message": "Success"}


@app.get("/delay/{duration}")
def delay_duration(duration: int):
    time.sleep(duration)
    return {"message": f"Delayed for {duration} seconds"}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
