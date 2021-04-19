const cluster = require("cluster");
const express = require("express");
const metricsServer = express();
const {
  AggregatorRegistry,
  register,
  Registry,
  collectDefaultMetrics,
} = require("prom-client");

const CPUS = require("os").cpus().length;

const aggregatorRegistry = new AggregatorRegistry();
const metrics = require("./metrics/app-counts");

if (cluster.isMaster) {
  for (let i = 0; i < CPUS; i++) {
    metrics.workers_started.inc();
    cluster.fork();
  }

  metricsServer.get("/metrics", async (req, res) => {
    try {
      const mergedRegistries = Registry.merge([register, aggregatorRegistry]);
      const metrics = await mergedRegistries.metrics();
      res.set("Content-Type", mergedRegistries.contentType);
      res.send(metrics);
    } catch (ex) {
      res.statusCode = 500;
      res.send(ex.message);
    }
  });

  metricsServer.get("/cluster_metrics", async (req, res) => {
    try {
      const metrics = await aggregatorRegistry.clusterMetrics();
      res.set("Content-Type", aggregatorRegistry.contentType);
      res.send(metrics);
    } catch (ex) {
      res.statusCode = 500;
      res.send(ex.message);
    }
  });

  metricsServer.get("/master_metrics", async (req, res) => {
    try {
      const metrics = await register.metrics();
      res.set("Content-Type", register.contentType);
      res.send(metrics);
    } catch (ex) {
      res.statusCode = 500;
      res.send(ex.message);
    }
  });

  metricsServer.listen(3001);
  console.log(
    "Cluster metrics server listening to 3001, metrics exposed on /cluster_metrics"
  );
} else {
  collectDefaultMetrics();
  require("./worker.js");
}
