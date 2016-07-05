# pglistend
[![npm version](https://img.shields.io/npm/v/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![npm downloads](https://img.shields.io/npm/dt/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![Code Climate](https://img.shields.io/codeclimate/github/kabirbaidhya/pglistend.svg?style=flat-square)](https://codeclimate.com/github/kabirbaidhya/pglistend)

A lightweight Postgres LISTEN Daemon built on top of [node](https://nodejs.org/en/), [node-postgres](https://github.com/brianc/node-postgres) and [systemd](https://wiki.debian.org/systemd).

It's a very simple yet generic daemon application that could be used in any project that makes use of Postgres' `LISTEN`/`NOTIFY` feature.

It runs as a background process that does `LISTEN` on the configured channels on a database and allows to perform custom actions on receiving [`NOTIFY`](https://www.postgresql.org/docs/9.1/static/sql-notify.html) signals on those channels.

Check this [simple tutorial](https://github.com/kabirbaidhya/pglistend/wiki/Tutorial:-Basics) to get started with it.

## Installation

Firstly, install the npm package globally. This will make `pglisten` CLI tool available on your system.
```bash
$ npm install -g pglistend
```

Now setup the daemon using this command.

```bash
$ sudo pglisten setup-daemon
```
Or, alternatively you can `curl` the script and run it on the fly.
```bash
$ curl https://raw.githubusercontent.com/kabirbaidhya/pglistend/master/setup/setup.py | sudo python
```

When it's done, edit your [configuration](https://github.com/kabirbaidhya/pglistend/wiki/Configuration). And finally start the service using
```bash
$ sudo systemctl start pglistend
```

## Usage
### Managing the daemon
You can use `systemd` commands to manage `pglistend`.
```bash
# Start the service
$ systemctl start pglistend

# Stop the service
$ systemctl stop pglistend

# Check service status
$ systemctl status pglistend

# Enable the service (This will start the service on bootup)
$ systemctl enable pglistend

# Disable the service (Disable the service to not start on bootup)
$ systemctl disable pglistend
```

For more information about `systemd` check [this](https://wiki.debian.org/systemd#Managing_services_with_systemd)

### Logs
All logs are written to `syslog`.
So, you can make use of `journalctl` here
```bash
$ journalctl -u pglistend
$ journalctl -f -u pglistend
```

Or, you can simply `tail` the logs like this:
```bash
$ tail /var/log/syslog | grep pglistend
$ tail -f /var/log/syslog | grep pglistend
```
Check [this](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs) to read more about journalctl.


## Tutorials
1. [Getting Started](https://github.com/kabirbaidhya/pglistend/wiki/Tutorial:-Basics)
2. [Performing custom actions](https://github.com/kabirbaidhya/pglistend/wiki/Tutorial:-Custom-actions)

## TODOs
* Multiple database support as right now it supports single database only.
* Delegate CPU-intensive tasks (mostly queries) to separate thread or message queue most likely. [Here's why](http://stackoverflow.com/questions/3491811/node-js-and-cpu-intensive-requests/3536183#answer-3491931)
* Debounce callback invocation with some configurable time-interval.
