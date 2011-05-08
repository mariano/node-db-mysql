/* Escape & Query building tests */

require("./db-mysql");
var tests = require("./lib/node-db/tests.js").get(function() {
    return new Mysql();
});

for(var test in tests) {
    exports[test] = tests[test];
}
