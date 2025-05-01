from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response, JSONResponse

import random
import time

app = FastAPI()

REQUEST_COUNT = Counter("request_count_total", "Total number of requests")
REQUEST_LATENCY = Histogram(
    "request_latency_seconds",
    "Request latency in seconds",
    ["endpoint"]
)
HTTP_STATUS_COUNTER = Counter(
    "chaotic_http_responses_total",
    "Count of HTTP responses by status code",
    ["status_code"]
)
CHAOS_REQUESTS = Counter("chaos_test_requests_total", "Total requests to /unstable")
CHAOS_FAILURES = Counter(
    "chaos_test_failures_total", "Failures from /unstable", ["status_code"]
)
CHAOS_LATENCY = Histogram("chaos_test_latency_seconds", "Latency of /delay endpoint")


@app.middleware("http")
async def status_code_metrics_middleware(request: Request, call_next):
    response = await call_next(request)
    HTTP_STATUS_COUNTER.labels(str(response.status_code)).inc()
    return response


@app.get("/")
def index():
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.labels("/").time():
        return JSONResponse({"message": "The message from chaotic app!"}, status_code=200)


@app.get("/health")
def health_check():
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.labels("/health").time():
        return JSONResponse({"status": "healthy"}, status_code=200)


@app.get("/unstable")
def unstable_endpoint():
    REQUEST_COUNT.inc()
    CHAOS_REQUESTS.inc()
    with REQUEST_LATENCY.labels("/unstable").time():
        x = random.randint(0, 12)
        if x < 4:
            CHAOS_FAILURES.labels("500").inc()
            return JSONResponse({"message": "Internal Server Error!"}, status_code=500)
        elif x < 7:
            CHAOS_FAILURES.labels("503").inc()
            return JSONResponse({"message": "Service Unavailable!"}, status_code=503)
        elif x < 9:
            CHAOS_FAILURES.labels("429").inc()
            return JSONResponse({"message": "Too Many Requests!"}, status_code=429)
        else:
            return JSONResponse({"message": "Request was successful"}, status_code=200)


@app.get("/delay/{duration}")
def delay_duration(duration: int):
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.labels("/delay").time():
        with CHAOS_LATENCY.time():
            time.sleep(duration)
        return JSONResponse({"message": f"Delayed for {duration} seconds"}, status_code=200)


@app.get("/metrics")
def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
        status_code=200,
    )
