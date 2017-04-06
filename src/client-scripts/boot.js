/*
  This script manages boot for all pages:

    - 'Cuts the mustard' check
    - Adds scripts for polyfill service and build service
    - Adds any extra user-configured scripts (e.g. main.entry.js)
    - Exports a global `Boot` object that provides `waitFor` functionality.

  It is intended to be inlined into the <head> and run synchronously before anything else.

  It is hand-written ES3 and won't be transformed, except for minification.
 */

(function () {
  // CTM
  var cutsTheMustard = ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);
  window.cutsTheMustard = cutsTheMustard;

  if (!cutsTheMustard) return;

  var htmlElement = document.documentElement;

  htmlElement.className = htmlElement.className.replace(/\bcore\b/, 'enhanced');

  // make a global namespace for boot management utils
  var Boot = window.Boot = {};

  // make a waitFor system
  {
    var conditionsMet = [];
    var listenersAwaitingConditions = {};

    Boot.fireCondition = function (conditionName) {
      if (conditionsMet.indexOf(conditionName) > -1) throw new Error('Condition already met');

      var callbacks = listenersAwaitingConditions[conditionName];

      if (callbacks) {
        delete listenersAwaitingConditions[conditionName];

        callbacks.forEach(function (callback) {
          setTimeout(callback, 0);
        });
      }
    };

    // simple function for waiting for one condition, for internal use
    var waitForSingleCondition = function (conditionName, callback) {
      if (conditionsMet.indexOf(conditionName) > -1) {
        setTimeout(callback, 0);
        return;
      }

      const callbacks = listenersAwaitingConditions[conditionName] || [];
      callbacks.push(callback);
      listenersAwaitingConditions[conditionName] = callbacks;
    };

    // more useful public API can wait for multiple conditions
    Boot.waitFor = function (conditions, callback) {
      const all = conditions.split(' ');

      var count = 0;

      all.forEach(function (conditionName) {
        waitForSingleCondition(conditionName, function () {
          count += 1;

          if (count === all.length) setTimeout(callback, 0);
        });
      });
    };

    // dom
    document.addEventListener('DOMContentLoaded', function () {
      Boot.fireCondition('dom');
    });

    // fonts TODO - some way to check all the fonts loaded
  }

  // add a global function for adding a script to the page
  Boot.addScript = function (url, attributes, callback) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;

    if (attributes) {
      Object.keys(attributes).forEach(function (key) {
        script.setAttribute(key, attributes[key]);
      });
    }

    if (callback) {
      // NB the addEventListener and the script load event are supported by all 'enhanced' browsers,
      // so we don't need to do too many acrobatics here
      script.addEventListener('load', function () {
        setTimeout(callback, 0);
      });
    }

    var head = document.head || document.getElementsByTagName('head')[0];

    head.appendChild(script);
    return script;
  };

  // add polyfill service
  Boot.addScript(
    'https://cdn.polyfill.io/v2/polyfill.min.js?features=default',
    undefined,
    function () {
      Boot.fireCondition('polyfill-service');
    }
  );

  // add build service
  Boot.addScript(
    '{{ origamiBuildServiceURL(allOrigamiModules, "js", env) }}',

    undefined,

    function () {
      Boot.fireCondition('build-service');
    }
  );

  // add main javascript
  {% for script in scripts %}
  Boot.addScript('{{ script }}');
  {% endfor %}
})();
