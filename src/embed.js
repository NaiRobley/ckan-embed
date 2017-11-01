var _ = require('underscore'),
    $ = require('jquery'),
    CKAN = require('ckan');

var config = {};

// Default HTML format of the widget
function defaultTemplate() {
  var template_widget = _.template(
    '<div class="ckan-dataset">' +
    '<a href="<%= ds.url %>">' +
    '<h5><%= ds.title %></h5>' +
    '</a>' +
    '<p><%= ds.description %></p>' +
    '<b><%= ds.groupname %></b><br>' +
    '<small><%= ds.formats %></small>' +
    //'<small><%= ds.modified %></small>' +
    '</div>'
  );
  return template_widget;
}

// Adapted from epeli/underscore.string
function truncate(str, length, truncateStr) {
  str = (str == null) ? '' : '' + str;
  truncateStr = truncateStr || '...';
  length = ~~length;
  return str.length > length ? str.slice(0, length) + truncateStr : str;
}

/* Support function to publish data to page */
function generateView(url, packages, options) {

  // Generate HTML of the widget
  var template_widget = options.template;

  // Helper functions to massage the results
  var lang = options.lang;
  var fragments = [];

  var getDatasetFormats = function(res) {
    return _.uniq(_.map(res,
      function(r) { return r.format; }))
      .join(' ');
    };

  // adjust url for language support
  if (lang !== null) url = url + lang + '/';

  // Pass the dataset results to the template
  for (var i in packages) {
    var dso = packages[i];
    var dsogroupname = (dso.groups.length === 0) ? '' : dso.groups[0].display_name;
    var ds = {
      url:           url + 'dataset/' + dso.name,
      title:         dso.title,
      groupname:     dsogroupname,
      description:   dso.notes,
      formats:       getDatasetFormats(dso.resources),
      modified:      dso.metadata_modified
    };
    fragments.push(template_widget({ ds: ds, dso: dso }));
  }

  if (fragments.length === 0) return null;
  return fragments.join('');

} // -generateView

// Parse query into a CKAN request
function parametrize(options) {
  var request = {};
  if (_.isString(options)) {
    request.q = options;
    options = {};
  } else {
    if (!_.isUndefined(options.q)) {
      request.q = options.q;
    } else if (!_.isUndefined(options.fq)) {
      request.fq = options.fq;
    } else {
      // No query provided
      return null;
    }
  }
  request.sort = _.isUndefined(options.sort) ?
    'metadata_modified desc' : options.sort;
  // Fetches 5 rows by default
  request.rows = _.isUndefined(options.rows) ?
    5 : options.rows;

  // parse configuration options
  options.jsonp = _.isUndefined(options.jsonp) ?
    true : options.jsonp;
  options.proxy = _.isUndefined(options.proxy) ?
    null : options.proxy;
  options.lang = _.isUndefined(options.lang) ?
    'en' : options.lang;
  options.template = _.isUndefined(options.template) ?
    defaultTemplate() : options.template;
  options.noresult = _.isUndefined(options.noresult) ?
    'No datasets found' : options.noresult;

  return { 'request': request, 'options': options };
}

// Embed a CKAN dataset result in a web page.
// el: DOM element in which to place component (DOM node or CSS selector)
// url: Source portal (URL string)
// options: Parameters for CKAN API (object) or search query (string)
// callback: invoked with the loaded CKAN client
function datasets(el, url, options, callback) {
  var cb = callback || function(){},
      client, packages;

  try {
    var p = parametrize(options);
    if (p === null)
      return cb('Please provide a query');
    request = p['request'];
    options = p['options'];

    // ensure container div has class
    var div = $(el).addClass('ckan-embed');

    // create a client
    client = new CKAN.Client(options.proxy || url);
    var action = 'package_search';

    // extend ckan.js action routine with jsonp support
    if (options.jsonp) {
      request = {
        url: client.endpoint + '/3/action/' + action,
        data: request, dataType: "jsonp",
        type: 'POST', cache: true
      };
      $.ajax(request)
      .fail(function(err) {
        if (err !== null) { cb(err); return; }
      })
      .done(function(res) {
        packages = res.result.results;
        var res = generateView(url, packages, options);
        // Insert into container on page
        div.html(res ? res : options.noresult);
        // Continue with callback
        cb(null, {client: client, request: request, packages: packages});
      });

    } else {
      // recommended default usage of ckan.js, e.g. through CORS or proxy
      client.action(action, request, function(err, res) {
        if (err !== null) { cb(err); return; }
        packages = res.result.results;
        var res = generateView(url, packages, options);
        // Insert into container on page
        div.html(res ? res : options.noresult);
        // Continue with callback
        cb(null, {client: client, request: request, packages: packages});
      });
    }

  } catch (err) { cb(err); }
} //-datasets

exports.datasets = datasets;
exports.template = defaultTemplate;
exports.truncate = truncate;
exports.parametrize = parametrize;
exports.generateView = generateView;
