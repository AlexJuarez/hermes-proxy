'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const script =
  fs.readFileSync(path.resolve(__dirname, 'deterministic.js')).toString();

function uncompressResponse(headers, body) {
  const encoding = headers['content-encoding'];
  if (encoding === 'gzip') {
    body = zlib.gunzipSync(body);
  } else if (encoding === 'deflate') {
    body = zlib.inflateSync(body);
  }
  return body;
}

function recompressResponse(headers, body) {
  const encoding = headers['content-encoding'];
  if (encoding === 'gzip') {
    body = zlib.gzipSync(body);
  } else if (encoding === 'deflate') {
    body = zlib.deflateSync(body);
  }
  return body;
}

class Injector {

  constructor() {
    this._enabled = false;
    this._toInject = `<script>${script}</script>`;
  }

  enable() {
    this._enabled = true;
  }

  disable() {
    this._enabled = false;
  }

  inject(headers, body) {
    if (!this._enabled || headers['content-type'].indexOf('text/html') === -1) {
      return {headers, body};
    }
    const body_string =
      uncompressResponse(headers, body).toString('utf-8');
    const head_tag = '<head>';
    const head_index = body_string.indexOf(head_tag);

    if (head_index === -1) {
      return {headers, body};
    }

    const new_body_string =
      body_string.substring(0, head_index + head_tag.length) +
      this._toInject +
      body_string.substring(head_index + head_tag.length);

    body = recompressResponse(
      headers,
      new Buffer(new_body_string, 'utf-8')
    );

    headers = _.clone(headers);
    delete headers['content-length'];
    return {headers, body};
  }
}

module.exports = Injector;
