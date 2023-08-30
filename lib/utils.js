const ora = require("ora");
async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve;
    }, n);
  });
}
async function warpLoading(fn, message, ...args) {
  const spinner = ora(message);
  spinner.start();
  try {
    let repos = await fn(...args);
    spinner.succeed();
    return repos;
  } catch (error) {
    spinner.fail("request failed, refetch...");
    sleep(10000);
    return warpLoading(fn, message, ...args);
  }
}
module.exports = {
  sleep,
  warpLoading,
};
