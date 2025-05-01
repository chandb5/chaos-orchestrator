import * as k8s from "@pulumi/kubernetes";
import * as yaml from "@pulumi/kubernetes/yaml";
import * as pulumi from "@pulumi/pulumi";

const appLabels = { app: "chaotic-app" };

pulumi.log.info("Creating Deployment for unstable-apis...");
const deployment = new k8s.apps.v1.Deployment("unstable-apis", {
  spec: {
    selector: { matchLabels: appLabels },
    replicas: 3,
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [
          {
            name: "unstable-apis",
            image: "chandbud5/chaotic-app:latest",
            ports: [{ containerPort: 8000 }],
          },
        ],
      },
    },
  },
});
pulumi.log.info("Deployment for unstable-apis created successfully.");

pulumi.log.info("Creating Service for unstable-apis...");
const service = new k8s.core.v1.Service("unstable-apis-svc", {
  metadata: { name: "unstable-apis" },
  spec: {
    type: "NodePort",
    selector: appLabels,
    ports: [
      {
        port: 8000,
        targetPort: 8000,
        nodePort: 30080,
      },
    ],
  },
});
pulumi.log.info("Service for unstable-apis created successfully.");

pulumi.log.info("Creating Chaos CronJob...");
const chaosCronJob = new k8s.batch.v1.CronJob("chaos-cronjob", {
  metadata: { name: "chaos-cronjob" },
  spec: {
    schedule: "*/1 * * * *",
    jobTemplate: {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: "chaos-job",
                image: "chandbud5/chaos-runner:latest",
                imagePullPolicy: "Always",
                env: [
                  {
                    name: "UNSTABLE_ITERATIONS",
                    value: "2000",
                  },
                  {
                    name: "DELAY_ITERATIONS",
                    value: "150"
                  }
                ],
              },
            ],
            restartPolicy: "Never",
          },
        },
      },
    },
  },
});
pulumi.log.info("Chaos CronJob created successfully.");

pulumi.log.info("Creating Health Check Deployment...");
const healthCheck = new k8s.apps.v1.Deployment("health-check", {
  metadata: { name: "health-check" },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: "health-check" } },
    template: {
      metadata: { labels: { app: "health-check" } },
      spec: {
        containers: [
          {
            name: "health-check",
            image: "chandbud5/chaos-health:latest",
          },
        ],
      },
    },
  },
});
pulumi.log.info("Health Check Deployment created successfully.");