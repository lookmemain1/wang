const ContentLoader = (() => {
  const cache = {};

  function getBundled() {
    if (typeof window !== 'undefined' && window.COGNITAS_CONTENT) {
      return window.COGNITAS_CONTENT;
    }
    return null;
  }

  function loadSync(url) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      if (xhr.status === 0 || xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (_) { /* file:// or network error */ }
    return null;
  }

  async function load(url) {
    if (cache[url]) return cache[url];

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        cache[url] = data;
        return data;
      }
    } catch (_) { /* fall through */ }

    const sync = loadSync(url);
    if (sync) {
      cache[url] = sync;
      return sync;
    }
    throw new Error(`Failed to load content: ${url}`);
  }

  const FILES = {
    transcript: 'content/prolanis-transcript.json',
    soap: 'content/prolanis-soap.json',
    prolanisCoding: 'content/prolanis-coding.json',
    tbCoding: 'content/tb-discharge-coding.json',
    geriatricCdss: 'content/geriatric-cdss.json',
    prolanisCdss: 'content/prolanis-cdss.json',
    chatPresets: 'content/chat-presets.json',
  };

  async function loadAll() {
    const bundled = getBundled();
    if (bundled) {
      const keys = Object.keys(FILES);
      const data = {};
      keys.forEach((k) => { data[k] = bundled[k]; });
      return data;
    }

    const keys = Object.keys(FILES);
    const results = await Promise.all(keys.map((k) => load(FILES[k])));
    const data = {};
    keys.forEach((k, i) => { data[k] = results[i]; });
    return data;
  }

  return { load, loadAll, FILES, getBundled };
})();
