import time
import requests

APP_URL = "http://unstable-apis.default.svc.cluster.local:8000"

results = []

def health_check():
    try:
        response = requests.get(f"{APP_URL}/health", timeout=5)
        if response.status_code == 200:
            print("Health check passed")
        else:
            print(f"Health check failed with status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Health check failed: {e}")


if __name__ == "__main__":
    while True:
        health_check()
        time.sleep(1)
