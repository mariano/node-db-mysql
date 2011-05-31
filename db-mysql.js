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
var binding = require("./build/default/mysql_bindings");
exports.Database = binding.Mysql;
exports.Query = binding.Query;
