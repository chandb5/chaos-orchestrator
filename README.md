# Chaos Orchestrator

Chaos Orchestrator is a chaos engineering platform designed to test the resilience of applications by introducing controlled failures and delays. It helps identify weaknesses in systems before they become real-world issues.

## Overview

This platform simulates unpredictable scenarios in a Kubernetes environment, including random API failures, artificial delays, and high traffic loads. It provides tools for monitoring and analyzing system behavior under stress.

### Key Components

- **Unstable API Service (`app/`)**: A FastAPI application with endpoints for health checks, random failures, and artificial delays.
- **Chaos Generator (`chaos-generator/`)**: A service that generates traffic to test the API's resilience.
- **Health Checker (`health-checker/`)**: Monitors the system's health and logs failures.
- **Infrastructure (`infra/`)**: Pulumi scripts for deploying the system and observability tools.
- **Observability Stack**: Prometheus and Grafana for metrics collection and visualization.

## Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/chaos-orchestrator.git
   cd chaos-orchestrator
   ```

2. Deploy the infrastructure:
   ```bash
   cd infra
   npm install
   pulumi up
   ```

3. Start the services using the provided Dockerfiles.

4. Access the Grafana dashboard at `http://localhost:30030`.

## Results

The following screenshots illustrate system behavior during chaos testing:

![Dashboard 1](./images/Screenshot%202025-05-01%20at%203.10.25 AM.png)
*Request rates, latency metrics, and HTTP status code distribution.*

![Dashboard 2](./images/Screenshot%202025-05-01%20at%203.10.17 AM.png)
*Health check success rates and artificial delay patterns.*

## Observations

- Steady request processing rate of ~9-10 requests/second.
- P95 latency stable at ~5ms (excluding artificial delays).
- Expected HTTP error responses (429, 500, 503).
- Periodic health check degradations simulate real-world issues.

## Future Work

- Add network partition simulations.
- Introduce CPU and memory stress tests.
- Expand chaos patterns (e.g., DNS failures, database outages).
- Integrate with incident management tools.

## License

MIT License.

## Contributors

Chand.