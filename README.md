# db-mysql: MySQL database bindings for Node.js #

For detailed information about this and other Node.js
database bindings visit the [Node.js db-mysql homepage] [homepage].

## INSTALL ##

Before proceeding with installation, you need to have the libmysql
development libraries and include files. Access to the mysql_config 
binary is mandatory, and has to be part of the path prior to 
installation. If the path to your mysql_config is
/usr/local/bin/mysql_config make sure to do the following (Ubuntu
users need to install the libmysqlclient-dev package):

    $ export PATH=/usr/local/bin:$PATH

Once you are sure mysql_config is part of the path, install with npm:

    $ npm install db-mysql

## QUICK START ##

    var mysql = require('db-mysql');
    new mysql.Database({
        hostname: 'localhost',
        user: 'root',
        password: 'password',
        database: 'node'
    }).on('ready', function() {
        this.query().select('*').from('users').execute(function(rows) {
            console.log(rows.length + ' ROWS');
        });
    }).connect();

## LICENSE ##

This module is released under the [MIT License] [license].

[homepage]: http://nodejsdb.org/db-mysql
[license]: http://www.opensource.org/licenses/mit-license.php
