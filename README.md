# pglistend
[![npm version](https://img.shields.io/npm/v/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![npm downloads](https://img.shields.io/npm/dt/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![Code Climate](https://img.shields.io/codeclimate/github/kabirbaidhya/pglistend.svg?style=flat-square)](https://codeclimate.com/github/kabirbaidhya/pglistend)

A lightweight Postgre LISTEN Daemon built using [node](https://nodejs.org/en/), [node-postgres](https://github.com/brianc/node-postgres) and [systemd](https://wiki.debian.org/systemd).

## Installation

Firstly, install the npm package globally.

```bash
$ npm install -g pglistend
```
This will install the CLI tool `pglisten`.
Now setup the daemon using any of the following command.

```bash
# Option 1: Setup using `pglisten` CLI tool
$ sudo pglisten setup-daemon

# Option 2: Alternatively use curl to download and run setup on the fly
$ curl https://raw.githubusercontent.com/kabirbaidhya/pglistend/master/setup/setup.py | sudo python
```
**NOTE**: You need `sudo` to run the daemon setup.

When it's done,
 * Edit configuration `/etc/pglistend/config.yml`
 * Edit handler script `/etc/pglistend/handlers.js` to register handlers for the channels being LISTENed
 * Finally, start it `sudo systemctl start pglistend`

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

For more information about `systemd` check [this](https://wiki.debian.org/systemd#Managing_services_with_systemd)

### Command line Usage
After installing the package globally using `npm` you can run this as a CLI tool.
```bash
$ pglisten --config=path/to/config-file.yml
```
But, you have to provide the configuration file to run `pglisten`. You can create one using the [sample config file](config.yml.sample).
