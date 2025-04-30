import * as k8s from "@pulumi/kubernetes";
import * as yaml from "@pulumi/kubernetes/yaml";

const appLabels = { app: "chaotic-app" };

const deployment = new k8s.apps.v1.Deployment("unstable-apis", {
  spec: {
    selector: { matchLabels: appLabels },
    replicas: 3,
    template: {
      metadata: { labels: appLabels },
      spec: {
        containers: [{
          name: "unstable-apis",
          image: "chandbud5/chaotic-app:latest",
          ports: [{ containerPort: 8000 }],
        }],
      },
    },
  },
});

const service = new k8s.core.v1.Service("unstable-apis-svc", {
  metadata: { name: "unstable-apis" },
  spec: {
    type: "NodePort",
    selector: appLabels,
    ports: [{
      port: 8000,
      targetPort: 8000,
      nodePort: 30080,
    }],
  },
});