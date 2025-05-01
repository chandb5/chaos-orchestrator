import random
import time
import threading
import requests
import os

APP_URL = "http://unstable-apis.default.svc.cluster.local:8000"
UNSTABLE_ITERATIONS = int(os.getenv("UNSTABLE_ITERATIONS", 100))
DELAY_ITERATIONS = int(os.getenv("DELAY_ITERATIONS", 10))
UNSTABLE_SLEEP = 60 / UNSTABLE_ITERATIONS
DELAY_SLEEP = 60 / DELAY_ITERATIONS


results = []

def trigger_chaos_unstable():
    start = time.time()
    stop = start + 60
    while time.time() < stop:
        try:
            response = requests.get(f"{APP_URL}/unstable", timeout=3)
            time.sleep(UNSTABLE_SLEEP)
        except Exception as e:
            print(f"Error: {e}")
            break

def trigger_chaos_delay():
    start = time.time()
    stop = start + 60
    while time.time() < stop:
        try:
            delay_sec = random.randint(1, 4)
            response = requests.get(f"{APP_URL}/delay/{delay_sec}", timeout=3)
            time.sleep(DELAY_SLEEP)
        except Exception as e:
            print(f"Error: {e}")
            break

def run_chaos():
    t1 = threading.Thread(target=trigger_chaos_unstable)
    t2 = threading.Thread(target=trigger_chaos_delay)
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    print("Chaos test completed.")

if __name__ == "__main__":
    run_chaos()
