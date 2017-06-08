/*
This script manages boot for all pages:

  - 'Cuts the mustard' check
  - Adds scripts for polyfill service and build service
  - Adds any extra user-configured scripts (e.g. main.entry.js)
  - Exports a global `Boot` object that provides `waitFor` functionality.

It is intended to be inlined into the <head> and run synchronously before anything else.
*/

const cutsTheMustard = (
  'querySelector' in document &&
  'localStorage' in window &&
  'addEventListener' in window
);

window.cutsTheMustard = cutsTheMustard;

if (cutsTheMustard) {
  const htmlElement = document.documentElement;

  htmlElement.className = htmlElement.className.replace(/\bcore\b/, 'enhanced');

  // make a global namespace for boot management utils
  const Boot = window.Boot || {};
  window.Boot = Boot;

  // make a waitFor system
  {
    const conditionsMet = [];
    const listenersAwaitingConditions = {};

    Boot.fireCondition = (conditionName) => {
      if (conditionsMet.indexOf(conditionName) > -1) throw new Error('Condition already met');
      conditionsMet.push(conditionName);

      const callbacks = listenersAwaitingConditions[conditionName];

      if (callbacks) {
        delete listenersAwaitingConditions[conditionName];

        callbacks.forEach((callback) => {
          setTimeout(callback, 0);
        });
      }
    };

    // simple function for waiting for one condition, for internal use
    const waitForSingleCondition = (conditionName, callback) => {
      if (conditionsMet.indexOf(conditionName) > -1) {
        setTimeout(callback, 0);
        return;
      }

      const callbacks = listenersAwaitingConditions[conditionName] || [];
      callbacks.push(callback);
      listenersAwaitingConditions[conditionName] = callbacks;
    };

    // more useful public API can wait for multiple conditions
    Boot.waitFor = (conditions, callback) => {
      const all = conditions.split(' ');

      let count = 0;

      all.forEach((conditionName) => {
        waitForSingleCondition(conditionName, () => {
          count += 1;

          if (count === all.length) setTimeout(callback, 0);
        });
      });
    };

    // dom
    document.addEventListener('DOMContentLoaded', () => {
      Boot.fireCondition('dom');
    });

    // fonts TODO - some way to check all the fonts loaded
  }

  // add a global function for adding a script to the page
  Boot.addScript = (url, attributes, callback) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        script.setAttribute(key, attributes[key]);
      });
    }

    if (callback) {
      // NB the addEventListener and the script load event are supported by all 'enhanced' browsers,
      // so we don't need to do too many acrobatics here
      script.addEventListener('load', () => {
        setTimeout(callback, 0);
      });
    }

    const head = document.head || document.getElementsByTagName('head')[0];

    head.appendChild(script);
    return script;
  };

  // document.addEventListener('DOMContentLoaded', () => {
  //   document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
  // });

  // add polyfill service
  Boot.addScript(
    'https://cdn.polyfill.io/v2/polyfill.min.js?features=default,fetch,Symbol',
    undefined,
    () => {
      Boot.fireCondition('polyfill-service');

      // use browserify to run the origamiSetup script now
      require('./origamiSetup.rollup'); // eslint-disable-line global-require

      Boot.waitFor('dom', () => {
        document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));

        Boot.fireCondition('ready');
      });
    },
  );

  // add main scripts
  if (Boot.scripts && Boot.scripts.length) {
    Boot.scripts.forEach((url) => {
      Boot.addScript(url);
    });
  }
}
