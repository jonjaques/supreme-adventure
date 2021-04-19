const { Counter } = require("prom-client");

module.exports = {
  workers_started: new Counter({
    help: "number of workers forked",
    name: "workers_started",
  }),

  process_counter: new Counter({
    help: "counter for each worker",
    name: "process_counter",
  }),
};
