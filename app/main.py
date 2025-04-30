from fastapi import FastAPI, Request
from prometheus_client import Counter, Summary, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response, JSONResponse

import random
import time

app = FastAPI()

REQUEST_COUNT = Counter("request_count_total", "Total number of requests")
REQUEST_LATENCY = Summary("request_latency_seconds", "Request latency in seconds")
HTTP_STATUS_COUNTER = Counter(
    "chaotic_http_responses_total",
    "Count of HTTP responses by status code",
    ["status_code"]
)


@app.middleware("http")
async def status_code_metrics_middleware(request: Request, call_next):
    response = await call_next(request)
    HTTP_STATUS_COUNTER.labels(str(response.status_code)).inc()
    return response


@app.get("/")
def index():
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.time():
        return JSONResponse({"message": "The message from chaotic app!"}, status_code=200)


@app.get("/health")
def health_check():
    return JSONResponse({"status": "healthy"}, status_code=200)


@app.get("/unstable")
def unstable_endpoint():
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.time():
        x = random.randint(0, 12)
        if x < 4:
            return JSONResponse({"message": "Internal Server Error!"}, status_code=500)
        elif x < 7:
            return JSONResponse({"message": "Service Unavailable!"}, status_code=503)
        elif x < 9:
            return JSONResponse({"message": "Too Many Requests!"}, status_code=429)
        else:
            return JSONResponse({"message": "Request was successful"}, status_code=200)


@app.get("/delay/{duration}")
def delay_duration(duration: int):
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.time():
        time.sleep(duration)
        return JSONResponse({"message": f"Delayed for {duration} seconds"}, status_code=200)


@app.get("/metrics")
def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
        status_code=200,
    )
