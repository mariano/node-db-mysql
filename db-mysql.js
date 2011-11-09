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

var BaseEventEmitter = extend(function() {}, EventEmitter);
BaseEventEmitter.prototype.emit = function() {
    var type = arguments[0];
    if (type === 'error' && (!this._events || !this._events.error || (Array.isArray(this._events.error) && !this._events.error.length))) {
        // Silently allow unattached error events
        return;
    }
    return EventEmitter.prototype.emit.apply(this, arguments);
}

exports.Query = extend(binding.Query, BaseEventEmitter);
exports.Database = extend(binding.Mysql, BaseEventEmitter);
