/*!
 * Copyright by Mariano Iglesias
 *
 * See license text in LICENSE file
 */

/**
 * Require bindings native binary
 *
 * @ignore
 */
var EventEmitter = require('events').EventEmitter,
    binding;

try {
    binding = require("./build/default/mysql_bindings");
} catch(error) {
    binding = require("./build/Release/mysql_bindings");
}

function extend(target, source) {
    for (var k in source.prototype) {
        target.prototype[k] = source.prototype[k];
    }
    return target;
}

exports.Query = extend(binding.Query, EventEmitter);
exports.Database = extend(binding.Mysql, EventEmitter);
