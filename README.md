# Hermes-proxy

To run hermes proxy use `npm start -- [opts]` or use `node ./bin/hermes-proxy [opts]`

Try `npm start -- --help` to get started

### Quick Setup

MAC setup

1. install node with `brew install node`.
2. upgrade node with `npm install -g n; n stable`
3. upgrade npm with `npm install -g npm`;
4. Run `npm install` in this directory
5. test the proxy with `./proxy --help`

## Commands

### start

| Option | Description | Default |
|:--|:--|:--|
| `-p`, `--http-port` | http port for the proxy server | - |
| `-s`, `--https-port` | https port for the proxy server | - |
| `--log-level` | the current log level for the server | `DEBUG` |

### managed

| Option | Description | Default |
|:--|:--|:--|
| `-P`, `--protocol` | the protocol for the proxy manager | `http` |
| `-p`, `--port` | port for the proxy manager | - |
| `-d`, `--domain` | domain for the proxy manager | `localhost` |
| `--no-retry` | do not retry if the connection to the proxy manager fails | false |
| `--log-level` | the current log level for the server | `DEBUG` |

## Proxy Socket Commands

The proxy server once connected accepts the following commands

| Command | Description |
|:--|:--|
| **startup** | start the proxy server with a *config object* see below |
| **enable** | the proxy will cache traffic and make requests when not cached |
| **disable** | the proxy will only return cached traffic |
| **exit** | kill the proxy service |

## Proxy Config object

```javascript
{
  "httpPort": "",
  "httpsPort": ""
}
```
