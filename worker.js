console.log("engage", process.pid);
const metrics = require("./metrics/app-counts");

count();

function count() {
  metrics.process_counter.inc();

  setTimeout(count, randomDelay());
}

function randomDelay(ms = 1000) {
  return Math.random() * ms;
}
