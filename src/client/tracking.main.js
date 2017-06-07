if (window.cutsTheMustard) {
  Boot.addScript('https://www.ft.com/__origami/service/build/v2/bundles/js?export=oTracking&modules=o-tracking@^1.2.3', null, () => {
    const pageData = {
      content: { asset_type: 'interactive' },
    };

    const properties = [].reduce.call(document.querySelectorAll('head meta[property^="ft.track:"]') || [], (o, el) => {
      // eslint-disable-next-line no-param-reassign
      o[el.getAttribute('property').replace('ft.track:', '')] = el.getAttribute('content');
      return o;
    }, {});

    const id = document.documentElement.getAttribute('data-content-id');

    if (id) {
      pageData.content.uuid = id;
    }

    if (properties.microsite_name) {
      pageData.microsite_name = properties.microsite_name;
    }

    oTracking['o-tracking'].init({
      server: 'https://spoor-api.ft.com/px.gif',
      system: {
        is_live: typeof properties.is_live === 'string' ? properties.is_live.toLowerCase() : false,
      },
      context: { product: properties.product || 'IG' },
    });

    oTracking['o-tracking'].page(pageData);

    oTracking['o-tracking'].link.init();
  });
}
