# pglistend
[![npm version](https://img.shields.io/npm/v/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![npm downloads](https://img.shields.io/npm/dt/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![Code Climate](https://img.shields.io/codeclimate/github/kabirbaidhya/pglistend.svg?style=flat-square)](https://codeclimate.com/github/kabirbaidhya/pglistend)

A lightweight PostgreSQL LISTEN Daemon built on using Nodejs and Systemd.

**NOTE: This is under development, and is subject to change.**

## Installation

Firstly, install the package globally

```bash
$ npm install -g pglistend
```

Now setup the daemon using this [setup script](setup). You may do any of the following to setup the daemon.

```bash
# Option 1: Setup from the locally available setup script
$ cat $(npm root -g)/pglistend/setup | sudo python

# Option 2: curl the setup script from github and run it on the fly
$ curl https://raw.githubusercontent.com/kabirbaidhya/pglistend/master/setup | sudo python
```
Then,
 * Edit your configuration file `/etc/pglistend/config.yml`
 * Edit your handler script `/etc/pglistend/handlers.js` to register handlers for the channels you are LISTENing to
 * Finally, start the daemon using `sudo systemctl start pglistend`

 **NOTE**: You need `sudo` to run the daemon setup.

## Usage
### Managing the daemon
You can use `systemd` commands to manage `pglistend`.
```bash
# Check service status
$ systemctl status pglistend

# Start the service
$ systemctl start pglistend

# Stop the service
$ systemctl stop pglistend

# Restart the service
$ systemctl restart pglistend

# Enable the service (This will start the service on bootup)
$ systemctl enable pglistend

# Disable the service (Disable the service to not start on bootup)
$ systemctl disable pglistend
```
All logs are written to `syslog`.
So, you may either use `tail` `syslog` like this:
```bash
$ tail /var/log/syslog | grep pglistend

# In case you want to follow the logs
$ tail -f /var/log/syslog | grep pglistend
```

Or you may use `journalctl` to check the logs
```bash
$ journalctl -u pglistend

# In case you want to follow the logs
$ journalctl -f -u pglistend
```

For more information about `systemd` check [this](https://wiki.debian.org/systemd#Managing_services_with_systemd)
### Command line Usage
After installing the package globally using `npm` you can run this as a CLI tool.
```bash
$ pglisten --config=path/to/config-file.yml
```
But, you have to provide the configuration file to run `pglisten`. You can create one using the [sample config file](config.yml.sample).
