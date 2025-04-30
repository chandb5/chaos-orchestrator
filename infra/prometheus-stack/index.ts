import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as fs from "fs";

const configMap = new k8s.core.v1.ConfigMap("prometheus-config", {
  metadata: { name: "prometheus-config" },
  data: {
    "prometheus.yml": fs.readFileSync("prometheus.yml", "utf8"),
  },
});

const prometheusDeployment = new k8s.apps.v1.Deployment("prometheus", {
  metadata: { name: "prometheus" },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: "prometheus" } },
    template: {
      metadata: { labels: { app: "prometheus" } },
      spec: {
        containers: [{
          name: "prometheus",
          image: "prom/prometheus:v2.52.0",
          args: ["--config.file=/etc/prometheus/prometheus.yml"],
          ports: [{ containerPort: 9090 }],
          volumeMounts: [{
            name: "config-volume",
            mountPath: "/etc/prometheus",
          }],
        }],
        volumes: [{
          name: "config-volume",
          configMap: { name: "prometheus-config" },
        }],
      },
    },
  },
});

const prometheusService = new k8s.core.v1.Service("prometheus-svc", {
  metadata: { name: "prometheus" },
  spec: {
    type: "NodePort",
    selector: { app: "prometheus" },
    ports: [{
      port: 9090,
      targetPort: 9090,
      nodePort: 30090,
    }],
  },
});

export const prometheusUrl = prometheusService.status.loadBalancer?.ingress?.[0]?.hostname || "Use: minikube service prometheus --url";
