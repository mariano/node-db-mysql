/* Escape & Query building tests */

try {
    nodeunit = require("nodeunit");
} catch(err) {
    require.paths.unshift("/usr/lib/node_modules");
    nodeunit = require("nodeunit/lib/nodeunit");
}
var testCase = nodeunit.testCase;

exports.get = function(createDbClient, quoteName) {
    var exports = {};

    if (!quoteName) {
        quoteName = '`';
    }

    exports["Client"] = testCase({
        "setUp": function(callback) {
            var self = this;
            createDbClient(function(client) {
                self.client = client;
                callback();
            });
        },
        "escape()": function(test) {
            var client = this.client;
            test.expect(7);

            test.equal("test", client.escape("test"));
            test.equal("\\\"string\\\" test", client.escape("\"string\" test"));
            test.equal("\\'string\\' test", client.escape("\'string\' test"));
            test.equal("test \\\"string\\\"", client.escape("test \"string\""));
            test.equal("test \\'string\\'", client.escape("test \'string\'"));
            test.equal("test \\\"string\\\" middle", client.escape("test \"string\" middle"));
            test.equal("test \\'string\\' middle", client.escape("test \'string\' middle"));
            
            test.done();
        },
        "name()": function(test) {
            var client = this.client;
            test.expect(4);

            test.equal(quoteName + "field" + quoteName, client.name("field"));
            test.equal(quoteName + "table" + quoteName, client.name("table"));
            test.equal(quoteName + "table" + quoteName + "." + quoteName + "field" + quoteName, client.name("table.field"));
            test.equal(quoteName + "table" + quoteName + ".*", client.name("table.*"));
            
            test.done();
        }
    });

    exports["Query"] = testCase({
        "setUp": function(callback) {
            var self = this;
            createDbClient(function(client) {
                self.client = client;
                callback();
            });
        },
        "select markers": function(test) {
            var client = this.client;
            test.expect(16);

            client.query("SELECT * FROM users", { start: function (query) {
                test.equal("SELECT * FROM users", query);
                return false;
            }}).execute();

            test.throws(
                function () {
                    client.query("SELECT * FROM users WHERE id = ?").execute();
                },
                "Wrong number of values to escape"
            );

            test.throws(
                function () {
                    client.query("SELECT * FROM users WHERE id = ?", {}).execute();
                },
                "Wrong number of values to escape"
            );

            test.throws(
                function () {
                    client.query("SELECT * FROM users WHERE id = ?", [], {}).execute();
                },
                "Wrong number of values to escape"
            );

            client.query(
                "SELECT * FROM users WHERE id = ?", 
                [ 2 ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE id = 2", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE id = ? AND created > ?", 
                [ 2, "2011-03-09 12:00:00" ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE id = ? AND created > ?", 
                [ 2, new Date(2011, 2, 9, 12, 0, 0) ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE id IN ?", 
                [ [1, 2] ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE id IN (1,2)", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE role IN ?", 
                [ ["admin", "moderator"] ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE role IN ('admin','moderator')", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE name IN ?", 
                [ ["John Doe", "Jane O'Hara"] ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE name IN ('John Doe','Jane O\\'Hara')", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE name = ?", 
                [ "Jane O'Hara" ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE name = 'Jane O\\'Hara'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT * FROM users WHERE name = ?", 
                [ null ],
                { start: function (query) {
                    test.equal("SELECT * FROM users WHERE name = NULL", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT *, 'Use ? mark' FROM users WHERE id = ? AND created > ?", 
                [ 2, "2011-03-09 12:00:00" ],
                { start: function (query) {
                    test.equal("SELECT *, 'Use ? mark' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT *, 'Use ? mark', ? FROM users WHERE id = ? AND created > ?", 
                [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
                { start: function (query) {
                    test.equal("SELECT *, 'Use ? mark', 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "SELECT *, 'Use ? mark', Unquoted\\?mark, ? FROM users WHERE id = ? AND created > ?", 
                [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
                { start: function (query) {
                    test.equal("SELECT *, 'Use ? mark', Unquoted?mark, 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            client.query(
                "\\?SELECT *, 'Use ? mark', Unquoted\\?mark, ? FROM users WHERE id = ? AND created > ?", 
                [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
                { start: function (query) {
                    test.equal("?SELECT *, 'Use ? mark', Unquoted?mark, 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                    return false;
                }}
            ).execute();

            test.done();
        },
        "insert markers": function(test) {
            var client = this.client;
            test.expect(6);

            var created = new Date();
            client.query(
                "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
                [ ["jane", "Jane O'Hara", 32, created, true] ],
                { start: function (query) {
                    var sCreated = created.getFullYear() + "-";
                    sCreated += (created.getMonth() < 9 ? "0" : "") + (created.getMonth() + 1) + "-";
                    sCreated += (created.getDate() < 10 ? "0" : "") + created.getDate() + " ";
                    sCreated += (created.getHours() < 10 ? "0" : "") + created.getHours() + ":";
                    sCreated += (created.getMinutes() < 10 ? "0" : "") + created.getMinutes() + ":";
                    sCreated += (created.getSeconds() < 10 ? "0" : "") + created.getSeconds();

                    test.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('jane','Jane O\\'Hara',32,'" + sCreated + "',1)", query);
                    return false;
                }}
            ).execute();

            client.query(
                "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
                [
                    [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
                ],
                { start: function (query) {
                    test.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
                    return false;
                }}
            ).execute();

            client.query(
                "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
                [ [
                    [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
                ] ],
                { start: function (query) {
                    test.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
                    return false;
                }}
            ).execute();

            client.query(
                "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
                [ [
                    [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
                    [ "jane", "Jane O'Hara", 29, new Date(1980,8,18,20,15,0), false ],
                    [ "mark", "Mark Doe", 28, new Date(1981,5,15,16,02,30), true ]
                ] ],
                { start: function (query) {
                    test.equal("INSERT INTO users(username,name,age,created,approved) VALUES " +
                        "('john','John Doe',32,'1978-07-13 18:30:00',1)," +
                        "('jane','Jane O\\'Hara',29,'1980-09-18 20:15:00',0)," +
                        "('mark','Mark Doe',28,'1981-06-15 16:02:30',1)"
                    , query);
                    return false;
                }}
            ).execute();

            client.query(
                "INSERT INTO numbers(n1, n2, n3, n4) VALUES ?", 
                [
                    [ 10, 3.1415627, 70686626206955, { value: 3.1415627, precision: 2 } ],
                ],
                { start: function (query) {
                    test.equal("INSERT INTO numbers(n1, n2, n3, n4) VALUES (10,3.1415627,70686626206955,3.14)", query);
                    return false;
                }}
            ).execute();

            client.query({
                start: function(query) {
                    test.equal("INSERT INTO test (`test`) VALUES ('test value');", query);
                    return false;
                }
            }).execute("INSERT INTO test (`test`) VALUES (?);", ['test value'], function() {});

            test.done();
        },
        "select()": function(test) {
            var client = this.client, query = "";
            test.expect(9);

            test.throws(
                function () {
                    client.query().select();
                },
                "Argument \"from\" is mandatory"
            );

            query = client.query().select("*").sql();
            test.equal("SELECT *", query);

            test.throws(
                function () {
                    client.query().select({});
                },
                "Non empty objects should be used for value aliasing in select"
            );

            test.throws(
                function () {
                    client.query().select([]);
                },
                "No fields specified in select"
            );

            test.throws(
                function () {
                    client.query().select([1]);
                },
                "Incorrect value type provided as field for select"
            );

            query = client.query().select(["id", "user", {"number": 1}, {"date": new Date(1978,6,13,18,30,0)}]).sql();
            test.equal("SELECT " + quoteName + "id" + quoteName + "," + quoteName + "user" + quoteName + ",1 AS " + quoteName + "number" + quoteName + ",'1978-07-13 18:30:00' AS " + quoteName + "date" + quoteName, query);

            query = client.query().select(["id", "user", {"number": 1, "date": new Date(1978,6,13,18,30,0)}]).sql();
            test.equal("SELECT " + quoteName + "id" + quoteName + "," + quoteName + "user" + quoteName + ",1 AS " + quoteName + "number" + quoteName + ",'1978-07-13 18:30:00' AS " + quoteName + "date" + quoteName + "", query);

            query = client.query().select({"total": "COUNT(*)"}).sql();
            test.equal("SELECT COUNT(*) AS " + quoteName + "total" + quoteName + "", query);

            query = client.query().select(["id", {"total": "COUNT(*)"}]).sql();
            test.equal("SELECT " + quoteName + "id" + quoteName + ",COUNT(*) AS " + quoteName + "total" + quoteName + "", query);

            test.done();
        },
        "select values": function(test) {
            var client = this.client, query = "";
            test.expect(2);

            query = client.query().select(["id", "user", {"string": {"escape": true, "value": "Hello 'world'"}}]).sql();
            test.equal("SELECT " + quoteName + "id" + quoteName + "," + quoteName + "user" + quoteName + ",'Hello \\'world\\'' AS " + quoteName + "string" + quoteName + "", query);

            query = client.query().select({"string": { "escape": true, "value": "Hello 'world'"}}).sql();
            test.equal("SELECT 'Hello \\'world\\'' AS " + quoteName + "string" + quoteName + "", query);

            test.done();
        },
        "from()": function(test) {
            var client = this.client, query = "";
            test.expect(8);

            test.throws(
                function () {
                    client.query().from();
                },
                "Argument \"fields\" is mandatory"
            );

            query = client.query().from("users").sql();
            test.equal(" FROM " + quoteName + "users" + quoteName + "", query);

            query = client.query().from("users, profiles", false).sql();
            test.equal(" FROM users, profiles", query);

            test.throws(
                function () {
                    client.query().from({});
                },
                "Non empty objects should be used for aliasing in from"
            );

            query = client.query().from({"users_alias": "users"}).sql();
            test.equal(" FROM " + quoteName + "users" + quoteName + " AS " + quoteName + "users_alias" + quoteName + "", query);

            query = client.query().from({"users_alias": "users"}, false).sql();
            test.equal(" FROM users AS users_alias", query);

            query = client.query().from(["users", "profiles"]).sql();
            test.equal(" FROM " + quoteName + "users" + quoteName + "," + quoteName + "profiles" + quoteName + "", query);

            query = client.query().from(["users", "profiles"], false).sql();
            test.equal(" FROM users,profiles", query);

            test.done();
        },
        "where()": function(test) {
            var client = this.client, query = "";
            test.expect(10);

            test.throws(
                function () {
                    client.query().where();
                },
                "Argument \"conditions\" is mandatory"
            );

            query = client.query().where("1=1").sql();
            test.equal(" WHERE 1=1", query);

            query = client.query().where("id = 1 AND age > 30").sql();
            test.equal(" WHERE id = 1 AND age > 30", query);

            query = client.query().where("name = '?'").sql();
            test.equal(" WHERE name = '?'", query);

            test.throws(
                function () {
                    client.query().where("id = ?").execute({ start: function (query) { return false; } });
                },
                "Wrong number of values to escape"
            );

            test.throws(
                function () {
                    client.query().where("id = ?", []).execute({ start: function (query) { return false; } });
                },
                "Wrong number of values to escape"
            );

            query = client.query().where("id=?", [ 1 ]).execute({ start: function (query) {
                test.equal(" WHERE id=1", query);
                return false;
            }});

            query = client.query().where("(id=? OR name=?) AND created > ?", [ 1, "Janine O'Hara", new Date(2011,2,12,20,15,0) ]).execute({ start: function (query) {
                test.equal(" WHERE (id=1 OR name='Janine O\\'Hara') AND created > '2011-03-12 20:15:00'", query);
                return false;
            }});

            query = client.query().where("1=1").and("2=2").sql();
            test.equal(" WHERE 1=1 AND 2=2", query);

            query = client.query().where("1=1").and("2=2").or("3=3").sql();
            test.equal(" WHERE 1=1 AND 2=2 OR 3=3", query);

            test.done();
        },
        "join()": function(test) {
            var client = this.client, query = "";
            test.expect(9);
     
            test.throws(
                function () {
                    client.query().join();
                },
                "Argument \"join\" is mandatory"
            );

            query = client.query().join({ "table": "profiles" }).sql();
            test.equal(" INNER JOIN " + quoteName + "profiles" + quoteName + "", query);

            query = client.query().join({ 
                "table": "profiles",
                "alias": "p" 
            }).sql();
            test.equal(" INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + "", query);

            query = client.query().join({ 
                "table": "profiles",
                "alias": "p",
                "conditions": "p.id = u.profile_id"
            }).sql();
            test.equal(" INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id = u.profile_id)", query);

            test.throws(
                function () {
                    client.query().join({ 
                        "table": "profiles",
                        "alias": "p",
                        "conditions": "p.id = u.profile_id"
                    }, [ 1, new Date(2011, 2, 12, 19, 49, 0) ]).execute({ start: function (query) { return false; } });
                },
                "Wrong number of values to escape"
            );

            query = client.query().join(
                { 
                "table": "profiles",
                "alias": "p",
                "conditions": "p.id = u.profile_id AND approved = ? AND created >= ?"
                },
                [ 1, new Date(2011, 2, 12, 19, 49, 0) ]
            ).execute({ start: function (query) {
                test.equal(" INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id = u.profile_id AND approved = 1 AND created >= '2011-03-12 19:49:00')", query);
                return false;
            }});

            query = client.query().join({ 
                "type": "left",
                "escape": false,
                "table": "(t2,t3,t4)"
            }).sql();
            test.equal(" LEFT JOIN (t2,t3,t4)", query);

            query = client.query().join({ 
                "type": "left",
                "escape": false,
                "table": "(t2 CROSS JOIN t3 CROSS JOIN t4)",
                "conditions": "t2.a=t1.a AND t3.b=t1.b AND t4.c=t1.c"
            }).sql();
            test.equal(" LEFT JOIN (t2 CROSS JOIN t3 CROSS JOIN t4) ON (t2.a=t1.a AND t3.b=t1.b AND t4.c=t1.c)", query);

            query = client.query().join(
                { 
                    "table": "profiles",
                    "alias": "p",
                    "conditions": "p.id = u.profile_id AND approved = ? AND created >= ?"
                },
                [ 1, new Date(2011, 2, 12, 19, 49, 0) ]
            ).join({ 
                "table": "contacts",
                "alias": "c",
                "conditions": "c.id = p.contact_id"
            }).execute({ start: function (query) {
                test.equal(" INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id = u.profile_id AND approved = 1 AND created >= '2011-03-12 19:49:00') INNER JOIN " + quoteName + "contacts" + quoteName + " AS " + quoteName + "c" + quoteName + " ON (c.id = p.contact_id)", query);
                return false;
            }});

            test.done();
        },
        "order()": function(test) {
            var client = this.client, query = "";
            test.expect(6);

            test.throws(
                function () {
                    client.query().order();
                },
                "Argument \"fields\" is mandatory"
            );

            query = client.query().order("id ASC, time DESC").sql();
            test.equal(" ORDER BY id ASC, time DESC", query);

            query = client.query().order({ "id": true, "time": false }).sql();
            test.equal(" ORDER BY " + quoteName + "id" + quoteName + " ASC," + quoteName + "time" + quoteName + " DESC", query);

            query = client.query().order({ "id": "asc", "time": "desc" }).sql();
            test.equal(" ORDER BY " + quoteName + "id" + quoteName + " asc," + quoteName + "time" + quoteName + " desc", query);

            query = client.query().order({ "id": true, "time": false }, false).sql();
            test.equal(" ORDER BY id ASC,time DESC", query);

            query = client.query().order({ "id": true, "time": false, "CONCAT(first, ' ', last)": { order: false, escape: false } }).sql();
            test.equal(" ORDER BY " + quoteName + "id" + quoteName + " ASC," + quoteName + "time" + quoteName + " DESC,CONCAT(first, ' ', last) DESC", query);

            test.done();
        },
        "limit()": function(test) {
            var client = this.client, query = "";
            test.expect(4);
     
            test.throws(
                function () {
                    client.query().limit();
                },
                "Argument \"rows\" is mandatory"
            );

            test.throws(
                function () {
                    client.query().limit("1");
                },
                "Argument \"rows\" must be a valid UINT32"
            );

            query = client.query().limit(1).sql();
            test.equal(" LIMIT 1", query);

            query = client.query().limit(5, 10).sql();
            test.equal(" LIMIT 5,10", query);

            test.done();
        },
        "add()": function(test) {
            var client = this.client, query = "";
            test.expect(4);
     
            test.throws(
                function () {
                    client.query().add();
                },
                "Argument \"join\" is mandatory"
            );

            query = client.query().add("one").sql();
            test.equal("one", query);

            query = client.query().add("one").add("two").sql();
            test.equal("onetwo", query);

            query = client.query().add("(").add(
                client.query().select("*").from("users")
            ).add(")").sql();
            test.equal("(SELECT * FROM " + quoteName + "users" + quoteName + ")", query);

            test.done();
        },
        "delete()": function(test) {
            var client = this.client, query = "";
            test.expect(3);

            query = client.query().
                delete().
                sql();
            test.equal("DELETE", query);

            query = client.query().
                delete("users").
                sql();
            test.equal("DELETE " + quoteName + "users" + quoteName + "", query);

            query = client.query().
                delete({"users_alias": "users"}).
                sql();
            test.equal("DELETE " + quoteName + "users" + quoteName + " AS " + quoteName + "users_alias" + quoteName + "", query);

            test.done();
        },
        "insert()": function(test) {
            var client = this.client, query = "";
            test.expect(8);

            query = client.query().
                insert("users").
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + " ", query);

            query = client.query().
                insert("users", ["name", "email"], false).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + "(" + quoteName + "name" + quoteName + "," + quoteName + "email" + quoteName + ") ", query);

            query = client.query().
                insert("users", ["name", "email"], ["john", "john.doe@email.com"]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + "(" + quoteName + "name" + quoteName + "," + quoteName + "email" + quoteName + ") VALUES ('john','john.doe@email.com')", query);

            query = client.query().
                insert("users", ["name", "email"], [["john", "john.doe@email.com"]]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + "(" + quoteName + "name" + quoteName + "," + quoteName + "email" + quoteName + ") VALUES ('john','john.doe@email.com')", query);

            query = client.query().
                insert("users", ["name", "email"], [["john", "john.doe@email.com"],["jane", "jane.doe@email.com"]]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + "(" + quoteName + "name" + quoteName + "," + quoteName + "email" + quoteName + ") VALUES ('john','john.doe@email.com'),('jane','jane.doe@email.com')", query);

            query = client.query().
                insert("users", ["john", "john.doe@email.com"]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + " VALUES ('john','john.doe@email.com')", query);

            query = client.query().
                insert("users", ["john", "john.doe@email.com", {value: 'NOW()', escape:false}]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + " VALUES ('john','john.doe@email.com',NOW())", query);

            query = client.query().
                insert("users", [["john", "john.doe@email.com"],["jane", "jane.doe@email.com"]]).
                sql();
            test.equal("INSERT INTO " + quoteName + "users" + quoteName + " VALUES ('john','john.doe@email.com'),('jane','jane.doe@email.com')", query);

            test.done();
        },
        "update()": function(test) {
            var client = this.client, query = "";
            test.expect(6);

            query = client.query().
                update("users").
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + "", query);

            query = client.query().
                update({"u": "users"}).
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + " AS " + quoteName + "u" + quoteName + "", query);

            query = client.query().
                update("users").
                set({ "name": "John Doe" }).
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + " SET " + quoteName + "name" + quoteName + "='John Doe'", query);

            query = client.query().
                update("users").
                set({ "name": "John Doe", "email": "john.doe@email.com" }).
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + " SET " + quoteName + "name" + quoteName + "='John Doe'," + quoteName + "email" + quoteName + "='john.doe@email.com'", query);

            query = client.query().
                update("users").
                set({ "name": "John Doe", "email": "john.doe@email.com", "age": 33 }).
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + " SET " + quoteName + "name" + quoteName + "='John Doe'," + quoteName + "email" + quoteName + "='john.doe@email.com'," + quoteName + "age" + quoteName + "=33", query);

            query = client.query().
                update("users").
                set({ "name": "John Doe", "email": "john.doe@email.com", "age": {"value": "real_age", "escape": false} }).
                sql();
            test.equal("UPDATE " + quoteName + "users" + quoteName + " SET " + quoteName + "name" + quoteName + "='John Doe'," + quoteName + "email" + quoteName + "='john.doe@email.com'," + quoteName + "age" + quoteName + "=real_age", query);

            test.done();
        },
        "chained select": function(test) {
            var client = this.client, query = "";
            test.expect(3);

            query = client.query().
                select("*").
                from("users").
                join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
                where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
                limit(10).
                execute({ start: function (query) {
                    test.equal("SELECT * FROM " + quoteName + "users" + quoteName + " INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);
                    return false;
                }});

            query = client.query().
                select("*").
                from("users").
                where("id IN ?", [ client.query().
                    select(["id"]).
                    from("profiles")
                ]).
                execute({ start: function (query) {
                    test.equal("SELECT * FROM " + quoteName + "users" + quoteName + " WHERE id IN (SELECT " + quoteName + "id" + quoteName + " FROM " + quoteName + "profiles" + quoteName + ")", query);
                    return false;
                }});

            test.throws(
                function () {
                    sql = client.query().
                        select("*").
                        from("users").
                        where("id IN ?", [ { "test": "value" }]).
                        execute({ start: function (query) { return false; }});
                },
                "Objects can't be converted to a SQL value"
            );

            test.done();
        },
        "chained delete": function(test) {
            var client = this.client, query = "";
            test.expect(2);

            query = client.query().
                delete().
                from("users").
                where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
                execute({ start: function (query) {
                    test.equal("DELETE FROM " + quoteName + "users" + quoteName + " WHERE created > '2011-03-12 20:16:00'", query);
                    return false;
                }});

            query = client.query().
                delete("users").
                from("users").
                join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
                where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
                execute({ start: function (query) {
                    test.equal("DELETE " + quoteName + "users" + quoteName + " FROM " + quoteName + "users" + quoteName + " INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00'", query);
                    return false;
                }});

            test.done();
        },
        "chained insert": function(test) {
            var client = this.client, query = "";
            test.expect(1);

            query = client.query().
                insert("profiles", ["name", "age", "created"], false).
                select(["name", {"value": 32}, "created"]).
                from("users").
                join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
                where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
                limit(10).
                execute({ start: function (query) {
                    test.equal("INSERT INTO " + quoteName + "profiles" + quoteName + "(" + quoteName + "name" + quoteName + "," + quoteName + "age" + quoteName + "," + quoteName + "created" + quoteName + ") SELECT " + quoteName + "name" + quoteName + ",32 AS " + quoteName + "value" + quoteName + "," + quoteName + "created" + quoteName + " FROM " + quoteName + "users" + quoteName + " INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);
                    return false;
                }});

            test.done();
        },
        "chained update": function(test) {
            var client = this.client, query = "";
            test.expect(1);

            query = client.query().
                update("users").
                join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
                set({ "name": "New Name" }).
                where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
                limit(10).
                execute({ start: function (query) {
                    test.equal("UPDATE " + quoteName + "users" + quoteName + " INNER JOIN " + quoteName + "profiles" + quoteName + " AS " + quoteName + "p" + quoteName + " ON (p.id=users.profile_id) SET " + quoteName + "name" + quoteName + "='New Name' WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);
                    return false;
                }});

            test.done();
        }
    });
    return exports;
};
