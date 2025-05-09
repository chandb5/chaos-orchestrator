import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as fs from "fs";

const gkeStack = new pulumi.StackReference("chandb5/gke-infra/dev");
const kubeconfig = gkeStack.getOutput("kubeconfig");
const provider = new k8s.Provider("gke-provider", {
  kubeconfig: kubeconfig,
});

pulumi.log.info("Starting to set up Prometheus and Grafana...");

const configMap = new k8s.core.v1.ConfigMap("prometheus-config", {
  metadata: { name: "prometheus-config" },
  data: {
    "prometheus.yml": fs.readFileSync("prometheus.yml", "utf8"),
  },
}, {provider});

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
}, {provider});

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
}, {provider});

const grafanaDeployment = new k8s.apps.v1.Deployment("grafana", {
  metadata: { name: "grafana" },
  spec: {
    replicas: 1,
    selector: { matchLabels: { app: "grafana" } },
    template: {
      metadata: { labels: { app: "grafana" } },
      spec: {
        containers: [{
          name: "grafana",
          image: "grafana/grafana:10.4.0",
          ports: [{ containerPort: 3000 }],
          env: [
            { name: "GF_SECURITY_ADMIN_USER", value: "admin" },
            { name: "GF_SECURITY_ADMIN_PASSWORD", value: "admin" },
          ],
        }],
      },
    },
  },
}, {provider});

const grafanaService = new k8s.core.v1.Service("grafana-svc", {
  metadata: { name: "grafana" },
  spec: {
    type: "NodePort",
    selector: { app: "grafana" },
    ports: [{
      port: 3000,
      targetPort: 3000,
      nodePort: 30030,
    }],
  },
}, {provider});

pulumi.log.info("Prometheus and Grafana setup completed.");

export const prometheusUrl = prometheusService.metadata.name.apply(name => `http://${name}:30090`);
export const grafanaUrl = grafanaService.metadata.name.apply(name => `http://${name}:30030`);