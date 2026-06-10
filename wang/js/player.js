const ScriptPlayer = (() => {
  let timers = [];
  let paused = false;
  let pauseResolve = null;

  function clear() {
    timers.forEach(clearTimeout);
    timers = [];
    paused = false;
    pauseResolve = null;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timers.push(id);
    });
  }

  async function waitWhilePaused() {
    while (paused) {
      await new Promise((r) => { pauseResolve = r; });
    }
  }

  function pause() {
    paused = true;
  }

  function resume() {
    if (!paused) return;
    paused = false;
    if (pauseResolve) {
      pauseResolve();
      pauseResolve = null;
    }
  }

  function isPaused() {
    return paused;
  }

  async function playSequence(items, onItem, defaultDelay = 700) {
    for (const item of items) {
      await waitWhilePaused();
      onItem(item);
      await wait(item.delayMs ?? defaultDelay);
    }
  }

  return { clear, pause, resume, isPaused, playSequence, wait, waitWhilePaused };
})();
