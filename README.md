# db-mysql: MySQL database bindings for Node.js #

For detailed information about this and other Node.js
database bindings visit the [Node.js db-mysql homepage] [homepage].

## INSTALL ##

Before proceeding with installation, you need to have the libmysql
development libraries and include files. Access to the mysql_config 
binary is mandatory, and its path has to be specified prior to 
installation (if its not within the system's path). For example, if 
the path to your mysql_config is /usr/local/bin/mysql_config make 
sure to do the following (Ubuntu users need to install the 
libmysqlclient-dev package):

```bash
$ export MYSQL_CONFIG=/usr/local/bin/mysql_config
```

Once you are sure that either mysql_config is part of the path or that
you specified the MYSQL_CONFIG environment var, install with npm:

```bash
$ npm install db-mysql
```

## QUICK START ##

```javascript
var mysql = require('db-mysql');
new mysql.Database({
    hostname: 'localhost',
    user: 'root',
    password: 'password',
    database: 'node'
}).connect(function(error) {
    if (error) {
        return console.log("CONNECTION ERROR: " + error);
    }

    this.query().select('*').from('users').execute(function(error, rows) {
        if (error) {
            return console.log('ERROR: ' + error);
        }
        console.log(rows.length + ' ROWS');
    });
});
```

## LICENSE ##

This module is released under the [MIT License] [license].

[homepage]: http://nodejsdb.org/db-mysql
[license]: http://www.opensource.org/licenses/mit-license.php
