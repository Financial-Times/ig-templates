## Usage example

```js
import { Environment, FileSystemLoader } from 'nunjucks';
import { searchPath, setupEnv } from 'ft-graphics-ui';

// make a nunjucks environment that can load templates from ft-graphics-ui
const environment = new Environment(new FileSystemLoader(searchPath));

// add filters and globals from ft-graphics-ui
setupEnv(environment);

const context = {
  headline: 'This is a headline',
  standfirst: 'This is a standfirst. Blah blah blah.',
  scripts: [
    'scripts/main.entry.js',
  ],
};

environment.renderString(`
{% extends '../../layouts/regular-article.njk' %}

{% block articleBody %}
this is the article body
{% endblock %}
`, context);
```

Your `scripts` will be added as `<script src="NAME"></script>` at the end of the body.

In your script, make sure to wait for other things to load.



## Writing JavaScript

Before your own JavaScript gets run
