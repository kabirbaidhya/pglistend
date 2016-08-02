#!/usr/bin/env python
# Setup script for setting up the daemon
# Need to run this with sudo access

import os
import subprocess
from subprocess import CalledProcessError, Popen

PACKAGE = 'pglistend'
EXEC_NAME = 'pglisten'
BASE_DIRECTORY = '/etc/pglistend'
CONFIG_FILE = BASE_DIRECTORY + '/config.yml'
DEFAULT_LISTENER_FILE = BASE_DIRECTORY + '/listener.js'

# Systemd unit file template
SYSTEMD_TEMPLATE = '''
[Unit]
Description={package} - Postgres LISTEN Daemon
After=postgresql.service

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
CONFIG_TEMPLATE = '''
default:
    connection:
        host: localhost
        port: 5432
        max: 2
        idleTimeoutMillis: 10000

# Include configuration files database connections you want to use
connections:
#   - path/to/connection-config.yml
'''

# Connection config file template
CONNECTION_CONFIG_TEMPLATE = '''
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

# list of listener scripts
scripts:
    - {default_listener}
#   You can add another scripts here
#    - path/to/another/listener.js
'''

# Listener script template
DEFAULT_LISTENER_TEMPLATE = '''
// Here you can define handlers for each of the channels
// that are being LISTENed.
module.exports = function(h) {
    return {
        'channel_1': function(payload) {
            // Do something
        },

        'channel_2': function(payload) {
            // Do something
        }
    };
};

'''

# Constants
DEVNULL = open(os.devnull, 'w')
COLOR_RED = '\033[0;31m'
COLOR_END = '\033[0m'
COLOR_GREY = '\033[0;37m'
COLOR_GREEN = '\033[0;32m'
COLOR_YELLOW = '\033[1;33m'
COLOR_DARKGREY = '\033[1;30m'
COLOR_LIGHTGREEN = '\033[1;32m'


def info_t(s):
    return '- ' + COLOR_GREEN + s + COLOR_END


def ok_t(s):
    return COLOR_GREEN + s + COLOR_END


def cmd_t(s):
    return COLOR_GREY + s + COLOR_END


def out_t(s):
    return COLOR_DARKGREY + s + COLOR_END


def err_t(s):
    return COLOR_RED + s + COLOR_END


# Just a simple command to execute shell commands and display the output
def exec_cmd(cmd):
    print cmd_t('> {}'.format(cmd))

    p = Popen(cmd.split(' '), stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

    output = ''

    for line in iter(p.stdout.readline, b''):
        print out_t('| ' + line.rstrip())
        output += line

    returncode = p.wait()

    if returncode != 0:
        raise CalledProcessError(returncode, cmd)

    print ''

    return output.rstrip()


def ensure_package_installed(package_name):
    print info_t('Ensure {0} is installed'.format(package_name))

    try:
        # Ensure pglistend package is installed on the system globally
        exec_cmd('npm list -g {}'.format(package_name))
    except CalledProcessError:
        print err_t('Warning: npm list returned non-zero exit code.')


def get_exec_path(exec_name):
    # Get full path of pglisten, to know where it is
    try:
        return exec_cmd('which {0}'.format(exec_name))
    except CalledProcessError:
        raise SystemExit(err_t(
            'Could not find pglisten. '
            'Make sure you have installed the package correctly using: '
            'npm install --global {}'.format(PACKAGE)
        ))


def mkdir(directory):
    print info_t('Create directory {0}'.format(directory))

    try:
        exec_cmd('mkdir -p {0}'.format(directory))
    except CalledProcessError:
        raise SystemExit(
            err_t('Error creating directory {0}'.format(directory))
        )


def create_file(filename, contents):
    print info_t('Write to file {0}'.format(filename))

    try:
        with open(filename, 'w') as f:
            f.write(contents)
    except Exception, e:
        raise SystemExit(err_t('Error: ' + str(e)))


def create_systemd_unit_file(filename, exec_path):
    contents = SYSTEMD_TEMPLATE.format(
        package=PACKAGE,
        directory=BASE_DIRECTORY,
        exec_path=exec_path,
        config_path=CONFIG_FILE
    )

    create_file(filename, contents)


def create_config_file(filename):
    config = CONFIG_TEMPLATE.format(
        default_listener=DEFAULT_LISTENER_FILE
    )

    create_file(filename, config)


def enable_daemon():
    print info_t('Enable the service')

    try:
        # Ensure pglistend package is installed on the system globally
        exec_cmd('systemctl enable {0}'.format(PACKAGE))
    except CalledProcessError:
        raise SystemExit(err_t('Error enabling the service'))


def check_status():
    print info_t('Check status')

    try:
        exec_cmd('systemctl is-enabled {0}'.format(PACKAGE))
        exec_cmd('systemctl status {0}'.format(PACKAGE))
    except CalledProcessError:
        pass


###############################################################################
# Setup Process
print '\nSetup - pglistend - Postgres LISTEN Daemon'
print '---------------------------------------------------'

# Ensure the package is installed globally on the system
ensure_package_installed(PACKAGE)

# Ensure the pglisten cli command exists and get its path
EXEC_PATH = get_exec_path(EXEC_NAME)

# Create the application directory
mkdir(BASE_DIRECTORY)

# Create a default listener file
create_file(DEFAULT_LISTENER_FILE, DEFAULT_LISTENER_TEMPLATE)

# Create application config file
create_config_file(CONFIG_FILE)

# Create the systemd daemon unit file
create_systemd_unit_file('/etc/systemd/system/pglistend.service', EXEC_PATH)

# Finally enable the daemon and check status
enable_daemon()
check_status()

print ok_t('\nAll done!!')
print(
    'Please manually edit the configuration file {0}. \n'
    'And finally start the service using {1}.'
    .format(out_t(CONFIG_FILE), out_t('systemctl start ' + PACKAGE))
)
