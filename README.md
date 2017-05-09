# ig-templates [![CircleCI](https://circleci.com/gh/Financial-Times/ig-templates.svg?style=svg)](https://circleci.com/gh/Financial-Times/ig-templates) [![npm](https://img.shields.io/npm/v/ig-templates.svg)](https://npmjs.com/package/ig-templates)

**Work in progress**

Collection of [Handlebars](http://handlebarsjs.com/) partials, layouts and helpers for use in IG pages.

## Usage example

```
import Handlebars from 'handlebars';
import { autoRegister } from 'ig-templates';

// register all our partials and helpers
autoRegister(Handlebars);
```

After registering as above, you can use your `Handlebars` instance to compile templates that make use of ig-templates' [layouts](src/templates/layouts) and [partials](src/templates/partials).

### Debugging

The Handlebars helpers use the [debug](https://github.com/visionmedia/debug) module for logging with the prefix `ig-templates`. So if you want to see logging, set `DEBUG=ig-templates` in your environment.

## Docs

- [Layouts](src/templates/layouts)
- [Partials](src/templates/partials)
- [Client-side JavaScript](src/client)
