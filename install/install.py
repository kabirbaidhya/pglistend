#!/usr/bin/env python

import os
import subprocess
from pprint import pprint
from subprocess import call, check_call, CalledProcessError, Popen

PACKAGE = 'pglistend'
EXEC_NAME = 'pglisten'
BASE_DIRECTORY = '/etc/pglistend'
CONFIG_FILE = BASE_DIRECTORY + '/config.yml'
HANDLERS_FILE = BASE_DIRECTORY + '/handlers.js'

# Systemd unit file template
systemd_template = '''
[Unit]
Description={package} - Postgres LISTEN Daemon

[Service]
WorkingDirectory={directory}
ExecStart={exec_path} --config={config_path}
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier={package}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
'''

# Configuration file template
config_template = '''
# Change the following configuration parameters according to your need.

# postgresql connection
connection:
    user: 'YOUR_USERNAME'
    database: 'DATABASE'
    password: 'PASSWORD'
    port: 5432
    max: 10

# channels to LISTEN to
channels: [CHANNEL_1, CHANNEL_2]

# list of handler scripts (javascript)
handlers:
    - {handlers_file}
#   You can add other handlers here
#    - path/to/another/handler-script.js
'''

# Handlers file template
handlers_template = '''
// Here you can define handlers for each of the channels
// that are being LISTENed.
module.exports = {
    // 'boom': function(payload) {
    //     console.log('Received notification on channel "boom"', payload);
    // }
};
'''

# Output to &> /dev/null
DEVNULL = open(os.devnull, 'w')

COLOR_FADE = "\033[37m"
COLOR_END = "\033[0m"

def ensure_package_installed(package_name):
    print 'Ensure {0} is installed'.format(package_name)
    print '\n> npm list --global {0}'.format(package_name)

    try:
        # Ensure pglistend package is installed on the system globally
        result = check_call(['npm', 'list', '--global', package_name])
    except CalledProcessError:
        raise SystemExit('{0} not found. Please install it globally using: npm install --global {0}'.format(package_name))

def get_exec_path(exec_name):
    print '\n> which {0}'.format(exec_name)

    # Get full path of pglisten, to know where it is
    p = Popen(['which', exec_name])
    exec_path = p.communicate()[0]

    print '\n'

    # Halt if pglisten is not found
    if p.returncode != 0:
        raise SystemExit('Could not find pglisten. Make sure you have installed the package correctly.')

    return exec_path

def mkdir(directory):
    print 'Create directory {0}'.format(directory)
    print '\n> mkdir -p {0}'.format(directory)

    try:
        p = check_call(['mkdir', '-p', directory])
    except CalledProcessError:
        raise SystemExit('Error creating directory {0}'.format(directory))

    return

def create_file(filename, contents):
    print 'Write to file {0}'.format(filename)

    with open(filename, 'w') as file:
        file.write(contents)

def create_systemd_unit_file(filename):
    contents = systemd_template.format(
        package = PACKAGE,
        directory = BASE_DIRECTORY,
        exec_path = exec_path,
        config_path = CONFIG_FILE
    )

    create_file(filename, contents)

def create_config_file(filename):
    config = config_template.CONFIG_TEMPLATE.format(
        handlers_file = HANDLERS_FILE
    )

    create_file(filename, config)

# Installation Process
print '\nInstallation - pglistend - Postgres LISTEN Daemon'
print '---------------------------------------------------'
print ''
# Ensure the package is installed globally on the system
ensure_package_installed(PACKAGE)

# Ensure the pglisten cli command exists and get its path
exec_path = get_exec_path(EXEC_NAME)

# Create the application directory
mkdir(BASE_DIRECTORY)

# Create a default handlers file
create_file(HANDLERS_FILE, handlers_template)

# Create application config file
create_config_file(CONFIG_FILE)

# Create the systemd daemon unit file
create_systemd_unit_file('/etc/systemd/system/pglistend.service')

print 'All done!!'
