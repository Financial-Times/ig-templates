# Layouts

> Technically these are just partials intended to be used as layouts. Handlebars doesn't have a native layouts concept. But it does now support [inline partials](http://handlebarsjs.com/partials.html#inline-partials), which can be used to make extendable 'layouts'.

General config applying to all

## The `wideArticle` layout

This gives you the FT header and footer. Your `articleContent` takes the full width of the page. It's up to you to include whatever other page furniture you need.

## The `regularArticle` layout

> *not finished*

Compared to `wideArticle`, this layout comes with more furniture out of the box (article header, copyright, comments) and puts your `articleContent` into the article body space (so it never gets wider than about 700px width).

## The `blankPage` layout

> *not finished*

This is a visually blank page, but still comes with a lot of goodness in the <head> for stuff like polyfilling, analytics, etc.
