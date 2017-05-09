All layouts include some variation of the [boot.main.js](boot.main.js) script inlined into the HEAD.

### Boot manager

The layout templates all include an inline script in the `<head>` which creates a global called `Boot` which provides the following API (based on something similar in n-ui):

#### Boot.waitFor(conditions, callback)

Pass in a **string** of space-separated conditions. When all are met, the callback will fire. It's OK if the conditions have already been met before you call `waitFor` – in that case your callback will run immediately.

The idea is that all your scripts should be loaded asynchronously, so it's up to them to check for certain page boot conditions before doing their work. Your script might run before the polyfill service has executed, for example.

```js
Boot.waitFor('ready', () => {
  // set up page
});
```

Built-in conditions:

- `polyfill-service` – when the Polyfill Service has been applied to the page.
- `dom` – when the Polyfill Service has been applied to the page.
- `ready` – both polyfill service and dom ready

You can also trigger and wait for your own conditions.

#### Boot.fireCondition(name)

Fire any single condition. For consistency, the name should contain only lowercase letters, numbers and hyphens.

#### Boot.addScript(name, [callback])

Loads a script and executes it, firing the callback.

Scripts are always async, so there's no guarantee what order they will run in – use `Boot.fireCondition` and `Boot.waitFor` to ensure things happen in order between multiple scripts.
