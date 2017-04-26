# ft-graphics-ui

**Experimental – do not use (yet)**

Collection of [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates, filters, and other UI helpers commonly used in FT Graphics projects. Extracted from [Starter Kit](https://github.com/ft-interactive/starter-kit).

## Nunjucks templates

### Usage example

This shows how to use everything manually.

```js
import { Environment, FileSystemLoader } from 'nunjucks';
import { searchPath, setupEnv } from 'ft-graphics-ui';

// make a nunjucks environment that can load templates from ft-graphics-ui
const environment = new Environment(new FileSystemLoader(searchPath));

// add filters and globals from ft-graphics-ui
setupEnv(environment);

const context = {
  headline: 'This is a headline',
  standfirst: 'This is a standfirst. Blah blah blah.'
};

environment.renderString(`
{% extends '../../layouts/regular-article.njk' %}

{% block articleBody %}
this is the article body
{% endblock %}
`, context);
```

Takes following context properties:

```
# TODO
```

### Boot manager

The layout templates all include an inline script in the `<head>` which creates a global called `Boot` which provides the following API:

#### Boot.waitFor(conditions, callback)

Pass in a **string** of space-separated conditions. When all are met, the callback will fire. It's OK if the conditions have already been met before you call `waitFor` – in that case your callback will run immediately.

The idea is that all your scripts should be async, so it's up to them to check for certain page boot conditions before continuing. Your script might run before the polyfill service has executed, for example.

```js
Boot.waitFor('polyfill-service build-service', () => {
  // it's now safe to assume the browser has been polyfilled, and the build service's "Origami" global now exists
});
```

Built-in conditions:

- `polyfill-service` – when the Polyfill Service has been applied to the page.
- `build-service` - when the Origami Build Service has been applied.

You can also trigger your own conditions.

#### Boot.fireCondition(name)

Fire any single condition. For consistency, the name should contain only lowercase letters, numbers and hyphens.

#### Boot.addScript(name, [callback])

Loads a script and executes it, firing the callback.

Scripts are always async, so there's no guarantee what order they will run in – use `Boot.fireCondition` and `Boot.waitFor` to ensure things happen in order between multiple scripts.


## Usage in JavaScript

This module has named exports.

```js
import { filters, searchPath } from 'ft-graphics-templates';
```

### filters

An object containing the following filters:

##### `imageService`

Converts a URL to an Origami Image Service URL.

Arguments:
- `params` (optional) – an object containing additional query parameters to add to the URL. (NB. the `source` param is set to `ig` by default.)

##### `tktk`

TKTK.

### searchPath

The full path to wherever the ft-graphics-ui module is installed. This may be useful for creating a custom Nunjucks [FileSystemLoader](https://mozilla.github.io/nunjucks/api.html#filesystemloader) in order that your environment can import layouts easily.
