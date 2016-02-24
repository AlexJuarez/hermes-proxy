#!/usr/bin/env node

'use strict';

let program = require('commander');
const Client = require('./client');
const pkg = require('./package.json');
const Proxy = require('./server');
const log4js = require('log4js');

const loglevels = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG'];

function Run() {
  program
    .version(pkg.version);

  program
    .command('start')
    .option('-p, --http-port <n>',
      'http port for the proxy',
      parseInt)
    .option('--log-level <level>',
      `change the current log level - ${loglevels.join(', ')}`,
      /^(OFF|ERROR|WARN|INFO|DEBUG)$/i,
      'INFO')
    .action((options) => {
      const config = {
        httpPort: options.httpPort
      };

      log4js.setGlobalLogLevel(options.logLevel);

      const proxy = new Proxy(config);
      proxy.startup();
    });

  program
    .command('managed')
    .description('runs a proxy client with a managing server')
    .option('-p, --port <n>',
      'port for the proxy manager',
      parseInt)
    .option('--log-level <level>',
      `change the current log level - ${loglevels.join(', ')}`,
      /^(OFF|ERROR|WARN|INFO|DEBUG)$/i,
      'INFO')
    .action((options) => {
      const config = {
        port: options.port || 0
      };
      log4js.setGlobalLogLevel(options.logLevel);

      new Client(config);
    });

  program
    .parse(process.argv);

}

module.exports.Run = Run;
