'use strict';

const url = require('url');
const zlib = require('zlib');
const log = require('./../logger')('proxy');

let request = require('request');
request = request.defaults({
  encoding: null
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function setHeaders(res, headers) {
  Object.keys(headers).forEach((header) => {
    res.setHeader(header, headers[header]);
  });
}

function addRoutes(server) {
  const app = server._app;
  const store = server._store;
  const injector = server._injector;

  function sendCachedResponse(req, res) {
    const resp = store.get(req);
    const injected = injector.inject(resp.resp.headers, resp.resp.body);
    const headers = injected.headers;
    const body = injected.body;

    setHeaders(res, headers);
    res.end(body);
  }

  app.all('*', function(req, res) {
    if (store.hasKey(req)) {
      sendCachedResponse(req, res);
    } else {
      if (server._cacheOnly) {
        log.warn(`${req.url} not found in cache`);
        res.status(404);
        res.end('page not found in cache');
      } else {
        var method = req.method.toLowerCase();

        const urlBuilder = url.parse(req.originalUrl);
        urlBuilder.host = req.get('host');
        urlBuilder.protocol = req.protocol;

        var u = decodeURIComponent(url.format(urlBuilder));

        var r = request[method](u,
          (err, resp, buffer) => {
            if (!err) {
              if (resp.statusCode === 200) {
                store.set(req, buffer, resp);
                sendCachedResponse(req, res);
              } else {
                res.status(resp.statusCode);
                setHeaders(res, resp.headers);
                res.end(buffer);
              }
            }
          })
          .on('error', function(err) {
            server.emit('error', {url: req.url, message: err.message});
          });

        req
          .pipe(r);
      }
    }
  });
}

module.exports = addRoutes;
