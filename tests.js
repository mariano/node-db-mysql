/* Escape & Query building tests */

var mysql = require("./db-mysql");
var tests = require("./lib/node-db/tests.js").get(function() {
    return new mysql.Database();
});

for(var test in tests) {
    exports[test] = tests[test];
}
