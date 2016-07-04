# pglistend
[![npm version](https://img.shields.io/npm/v/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![npm downloads](https://img.shields.io/npm/dt/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![Code Climate](https://img.shields.io/codeclimate/github/kabirbaidhya/pglistend.svg?style=flat-square)](https://codeclimate.com/github/kabirbaidhya/pglistend)

A lightweight Postgre LISTEN Daemon built on top of [node](https://nodejs.org/en/), [node-postgres](https://github.com/brianc/node-postgres) and [systemd](https://wiki.debian.org/systemd).

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
**NOTE**: You need `sudo` to run the daemon setup.

When it's done,
 * Edit your [configuration](https://github.com/kabirbaidhya/pglistend/wiki/Configuration)
 * And finally start it using `sudo systemctl start pglistend`

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

## Limitations
* Right now, this only supports listening to a single database. Support for multiple databases needs to be implemented.
