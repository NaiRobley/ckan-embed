# ckan-embed

This module supports embedding information dynamically from CKAN data portals into other websites. Currently only datasets (package) search results are supported. 

## Usage notes

This script can be used with any recent [CKAN](http://ckan.org) portal. It exposes a ck module which has a datasets function. The first parameter is the DOM container into which the widget should be loaded, the second parameter a fully qualified URL to the target CKAN portal, and the third can be a free text search query (for example, "statistik").

Project dependencies include [jQuery](https://www.npmjs.com/package/jquery) (3.1+), [Underscore](https://www.npmjs.com/package/underscore) (1.8+), [ckan](https://www.npmjs.com/package/ckan) (0.2+).

Add the *ckan-embed* script into the `<head>` of the page:

```html
<script src="https://cdn.rawgit.com/opendata-swiss/ckan-embed/1.0.1/dist/ckan-embed.min.js"></script>
```

And above it, any other scripts you require:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ckan/0.2.3/ckan.min.js"></script>
```

Place the container somewhere on the page, and add the init code:

```html
<div id="example-1">
	Loading '<a href="https://africaopendata.org">Agri Info</a>' datasets ...
</div>
...
<script>
ck.datasets('#example-1', 'https://africaopendata.org/', { 
                    fq: 'organization:agri-info'
                });
</script>
```

The widget will then render in the `#example-1` container. Some styling possibilities, such as showing the logo of the portal, are explored in `test/style.css`.

### Advanced options

The script may also be initialized with a configuration object, for example in this case to show three datasets tagged 'hospitals', without using JSONP* and instead proxying the requests through to the API at the `/ckanproxy/` path:

```js
ck.datasets('#example-2', 'https://africaopendata.org/', {
	fq:       'tags:hospitals',
	rows:     3,
	jsonp:    false,
	proxy:    '/ckanproxy/'
}
```

- `fq`: allows use of [filter queries](http://docs.ckan.org/en/latest/api/index.html?highlight=filter%20queries)
- `rows`: limit the number of results shown
- `sort`: custom sorting order (see note below)
- `lang`: default language for result links
- `jsonp`: toggle the use of JSONP (see note below)
- `proxy`: relative or absolute path to API proxy

## Usage notes

If you are running this script on the same server or using a backend proxy (supported in all web servers) to the CKAN API, it is recommended that you *disable* **JSONP** with the `jsonp: false` option. We have made it to be enabled by default since many CKAN servers can still only be reached through this method.

The default sorting order is `name asc` (alphabetical name ascending). Besides `name`, `package_count` and `title` are allowed. On multilingual CKAN servers add language suffix e.g. `title_string_en`. For specifying ascending or descending order append `asc` or `desc`.

For more usage examples see `test/index.html`.

## Developer notes

For information on the JavaScript CKAN client see [ckan.js](https://github.com/okfn/ckan.js), for details of API usage see [docs.ckan.org](http://docs.ckan.org/en/latest/api/) for [package_search](http://docs.ckan.org/en/latest/api/index.html?highlight=organization_list#ckan.logic.action.get.package_search).

A web server like [NGINX can be used](https://www.nginx.com/resources/admin-guide/reverse-proxy/) to proxy requests and avoid the use of JSONP.

## Build Process

To build `ckan-embed.js` and view the test examples, you must have [npm](https://www.npmjs.com/) installed.

1. Run `npm install` in the ckan-embed folder to install dependencies.
2. Run `npm run build` (this will invoke [browserify](http://browserify.org/) to bundle the source files, and then [uglify-js](http://lisperator.net/uglifyjs/) to create the minified version).
3. Run `bower install` to fetch local versions of JavaScript libraries for the test instance.
4. Run `npm run deploy` to do tests and update the distributables.
5. Start a local webserver (e.g., `python -m SimpleHTTPServer 8000`) in the root folder and then point your web browser at the test directory (e.g., `http://localhost:8000/test/`).

## Acknowledgments

This project was initially based on [ckan-embed](http://github.com/opendata-swiss/ckan-embed.git).
