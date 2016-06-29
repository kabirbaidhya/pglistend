# pglistend
[![npm version](https://img.shields.io/npm/v/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![npm downloads](https://img.shields.io/npm/dt/pglistend.svg?style=flat-square)](https://www.npmjs.com/package/pglistend) [![Code Climate](https://img.shields.io/codeclimate/github/kabirbaidhya/pglistend.svg?style=flat-square)](https://codeclimate.com/github/kabirbaidhya/pglistend)

A lightweight PostgreSQL LISTEN Daemon built on using Nodejs and Systemd.

**NOTE: This is under development, and is subject to change.**

## Installation

```bash
$ npm install -g pglistend
```

## Command Line Usage
After installing the package globally using `npm` you can run this as a CLI tool.
```bash
$ pglisten --config=path/to/config-file.yml
```
But, you have to provide the configuration file to run `pglisten`. You can create one using the [sample config file](config.yml.sample).
