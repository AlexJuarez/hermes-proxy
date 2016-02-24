'use strict';

const express = require('express');
const EventEmitter = require('events');
const RequestStore = require('./../store/request');
const https = require('./https');
const http = require('./http');
const Injector = require('./middleware/injector');
const addRoutes = require('./routes');
const addMiddleware = require('./middleware');
const log = require('./../logger')('proxy');

class Proxy extends EventEmitter {
  constructor(config) {
    super();

    this._app = express();
    this._config = config || {};
    this._store = new RequestStore();
    this._injector = new Injector();
    this._enabled = true;

    this.on('error', (err) => {
      log.error(`${err.message} - ${err.url}`);
    });

    addMiddleware(this);
    addRoutes(this);
  }

  startup() {
    // Pick a port at random that's open
    this._https_server = https(this._app, this._config);

    // Read that port and pass it into the http setup
    const http_config = {
      httpPort: this._config.httpPort,
      httpsPort: this._https_server.address().port
    };

    this._server = http(this._app, http_config);
    const port = this._server.address().port;

    log.debug(`proxy server ready at ` +
      `localhost:${port}.`);

    this.emit('ready', {port});
  }

  flush() {
    this._store = new RequestStore();
  }

  setRecordMode() {
    this._cacheOnly = false;
  }

  setReplayMode() {
    this._cacheOnly = true;
  }

  enableInjection() {
    this._injector.enable();
  }

  disableInjector() {
    this._injector.disable();
  }

  close() {
    if (this._https_server && this._server) {
      this._https_server.close();
      this._server.close();
    }
    log.debug(`closing proxy server.`);
    this.emit('exit');
  }
}

module.exports = Proxy;
