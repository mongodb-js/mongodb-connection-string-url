// Easiest way to get global `this` (either `global` in Node or `window` in
// browser) in any environment
//
// eslint-disable-next-line no-new-func
const _global = new Function('return this')();

// URL has to be defined dynamically to allow browser environments get rid of
// the polyfill that can potentially break them, even when not used
let URL: typeof import('url').URL;
let URLSearchParams: typeof import('url').URLSearchParams;

// URL should be available in global scope both in Node >= 10 and in browser
// (this also means that electron renderer should have it available one way or
// another)
if ('URL' in _global) {
  URL = _global.URL;
  URLSearchParams = _global.URLSearchParams;
} else {
  // The mongosh java-shell js runtime (and older Node versions, but we don't
  // support those) doesn't have URL available so we fallback to the
  // `whatwg-url` polyfill.
  //
  // WARN: this polyfill is not supported in browser environment and even just
  // importing it can break the browser runtime from time to time, if you are
  // using this package in browser environment, make sure that this import does
  // not actually import the library
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  URL = require('whatwg-url').URL;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  URLSearchParams = require('whatwg-url').URLSearchParams;
}

export { URL, URLSearchParams };
