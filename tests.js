/* Escape & Query building tests */

require("./db-mysql");
var testCase = require("nodeunit").testCase;

exports["Mysql"] = testCase({
    "setUp": function(callback) {
        this.mysql = new Mysql();
        callback();
    },
    "escape()": function(test) {
        var mysql = this.mysql;
        test.expect(7);

        test.equal("test", mysql.escape("test"));
        test.equal("\\\"string\\\" test", mysql.escape("\"string\" test"));
        test.equal("\\'string\\' test", mysql.escape("\'string\' test"));
        test.equal("test \\\"string\\\"", mysql.escape("test \"string\""));
        test.equal("test \\'string\\'", mysql.escape("test \'string\'"));
        test.equal("test \\\"string\\\" middle", mysql.escape("test \"string\" middle"));
        test.equal("test \\'string\\' middle", mysql.escape("test \'string\' middle"));
        
        test.done();
    },
    "table() and field()": function(test) {
        var mysql = this.mysql;
        test.expect(2);

        test.equal("`field`", mysql.field("field"));
        test.equal("`table`", mysql.field("table"));
        
        test.done();
    }
});

exports["Query"] = testCase({
    "setUp": function(callback) {
        this.mysql = new Mysql();
        callback();
    },
    "select markers": function(test) {
        var mysql = this.mysql;
        test.expect(15);

        mysql.query("SELECT * FROM users", { start: function (query) {
            test.equal("SELECT * FROM users", query);
            return false;
        }}).execute();

        test.throws(
            function () {
                mysql.query("SELECT * FROM users WHERE id = ?").execute();
            },
            "Wrong number of values to escape"
        );

        test.throws(
            function () {
                mysql.query("SELECT * FROM users WHERE id = ?", {}).execute();
            },
            "Wrong number of values to escape"
        );

        test.throws(
            function () {
                mysql.query("SELECT * FROM users WHERE id = ?", [], {}).execute();
            },
            "Wrong number of values to escape"
        );

        mysql.query(
            "SELECT * FROM users WHERE id = ?", 
            [ 2 ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE id = 2", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE id = ? AND created > ?", 
            [ 2, "2011-03-09 12:00:00" ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE id = ? AND created > ?", 
            [ 2, new Date(2011, 2, 9, 12, 0, 0) ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE id IN ?", 
            [ [1, 2] ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE id IN (1,2)", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE role IN ?", 
            [ ["admin", "moderator"] ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE role IN ('admin','moderator')", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE name IN ?", 
            [ ["John Doe", "Jane O'Hara"] ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE name IN ('John Doe','Jane O\\'Hara')", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT * FROM users WHERE name = ?", 
            [ "Jane O'Hara" ],
            { start: function (query) {
                test.equal("SELECT * FROM users WHERE name = 'Jane O\\'Hara'", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT *, 'Use ? mark' FROM users WHERE id = ? AND created > ?", 
            [ 2, "2011-03-09 12:00:00" ],
            { start: function (query) {
                test.equal("SELECT *, 'Use ? mark' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT *, 'Use ? mark', ? FROM users WHERE id = ? AND created > ?", 
            [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
            { start: function (query) {
                test.equal("SELECT *, 'Use ? mark', 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "SELECT *, 'Use ? mark', Unquoted\\?mark, ? FROM users WHERE id = ? AND created > ?", 
            [ "Escape 'quotes' for safety", 2, "2011-03-09 12:00:00" ],
            { start: function (query) {
                test.equal("SELECT *, 'Use ? mark', Unquoted?mark, 'Escape \\'quotes\\' for safety' FROM users WHERE id = 2 AND created > '2011-03-09 12:00:00'", query);
                return false;
            }}
        ).execute();

        mysql.query(
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
        var mysql = this.mysql;
        test.expect(4);

        var created = new Date();
        mysql.query(
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

        mysql.query(
            "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
            [
                [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
            ],
            { start: function (query) {
                test.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
                return false;
            }}
        ).execute();

        mysql.query(
            "INSERT INTO users(username,name,age,created,approved) VALUES ?", 
            [ [
                [ "john", "John Doe", 32, new Date(1978,6,13,18,30,0), true ],
            ] ],
            { start: function (query) {
                test.equal("INSERT INTO users(username,name,age,created,approved) VALUES ('john','John Doe',32,'1978-07-13 18:30:00',1)", query);
                return false;
            }}
        ).execute();

        mysql.query(
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

        test.done();
    },
    "select()": function(test) {
        var mysql = this.mysql;
        test.expect(11);

        test.throws(
            function () {
                mysql.query().select();
            },
            "Argument \"from\" is mandatory"
        );

        mysql.query().select("*").execute({ start: function(query) {
            test.equal("SELECT *", query);
            return false;
        }});

        test.throws(
            function () {
                mysql.query().select({});
            },
            "Non empty objects should be used for value aliasing in select"
        );

        test.throws(
            function () {
                mysql.query().select([]);
            },
            "No fields specified in select"
        );

        test.throws(
            function () {
                mysql.query().select([1]);
            },
            "Incorrect value type provided as field for select"
        );

        mysql.query().select(["id", "user", {"number": 1}, {"date": new Date(1978,6,13,18,30,0)}]).execute({ start: function(query) {
            test.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);
            return false;
        }});

        mysql.query().select(["id", "user", {"number": 1, "date": new Date(1978,6,13,18,30,0)}]).execute({ start: function(query) {
            test.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);
            return false;
        }});

        mysql.query().select({"total": "COUNT(*)"}).execute({ start: function(query) {
            test.equal("SELECT COUNT(*) AS `total`", query);
            return false;
        }});

        mysql.query().select(["id", {"total": "COUNT(*)"}]).execute({ start: function(query) {
            test.equal("SELECT `id`,COUNT(*) AS `total`", query);
            return false;
        }});

        mysql.query().select(["id", "user", {"string": {"escape": true, "value": "Hello 'world'"}}]).execute({ start: function(query) {
            test.equal("SELECT `id`,`user`,'Hello \\'world\\'' AS `string`", query);
            return false;
        }});

        mysql.query().select({"string": { "escape": true, "value": "Hello 'world'"}}).execute({ start: function(query) {
            test.equal("SELECT 'Hello \\'world\\'' AS `string`", query);
            return false;
        }});

        test.done();
    },
    "select()": function(test) {
        var mysql = this.mysql;
        test.expect(6);

        test.throws(
            function () {
                mysql.query().from();
            },
            "Argument \"fields\" is mandatory"
        );

        mysql.query().from("users").execute({ start: function(query) {
            test.equal(" FROM `users`", query);
            return false;
        }});

        mysql.query().from("users, profiles", false).execute({ start: function(query) {
            test.equal(" FROM users, profiles", query);
            return false;
        }});

        test.throws(
            function () {
                mysql.query().from({});
            },
            "Non empty objects should be used for aliasing in from"
        );

        mysql.query().from({"users_alias": "users"}).execute({ start: function(query) {
            test.equal(" FROM `users` AS `users_alias`", query);
            return false;
        }});

        mysql.query().from({"users_alias": "users"}, false).execute({ start: function(query) {
            test.equal(" FROM users AS users_alias", query);
            return false;
        }});

        test.done();
    },
    "where()": function(test) {
        var mysql = this.mysql;
        test.expect(8);

        test.throws(
            function () {
                mysql.query().where();
            },
            "Argument \"conditions\" is mandatory"
        );

        mysql.query().where("1=1").execute({ start: function(query) {
            test.equal(" WHERE 1=1", query);
            return false;
        }});

        mysql.query().where("id = 1 AND age > 30").execute({ start: function(query) {
            test.equal(" WHERE id = 1 AND age > 30", query);
            return false;
        }});

        mysql.query().where("name = '?'").execute({ start: function(query) {
            test.equal(" WHERE name = '?'", query);
            return false;
        }});

        test.throws(
            function () {
                mysql.query().where("id = ?");
            },
            "Wrong number of values to escape"
        );

        test.throws(
            function () {
                mysql.query().where("id = ?", []);
            },
            "Wrong number of values to escape"
        );

        mysql.query().where("id=?", [ 1 ]).execute({ start: function(query) {
            test.equal(" WHERE id=1", query);
            return false;
        }});

        mysql.query().where("(id=? OR name=?) AND created > ?", [ 1, "Janine O'Hara", new Date(2011,2,12,20,15,0) ]).execute({ start: function(query) {
            test.equal(" WHERE (id=1 OR name='Janine O\\'Hara') AND created > '2011-03-12 20:15:00'", query);
            return false;
        }});

        test.done();
    },
    "join()": function(test) {
        var mysql = this.mysql;
        test.expect(8);
 
        test.throws(
            function () {
                mysql.query().join();
            },
            "Argument \"join\" is mandatory"
        );

        mysql.query().join({ "table": "profiles" }).execute({ start: function(query) {
            test.equal(" INNER JOIN `profiles`", query);
            return false;
        }});

        mysql.query().join({ 
            "table": "profiles",
            "alias": "p" 
        }).execute({ start: function(query) {
            test.equal(" INNER JOIN `profiles` AS `p`", query);
            return false;
        }});

        mysql.query().join({ 
            "table": "profiles",
            "alias": "p",
            "conditions": "p.id = u.profile_id"
        }).execute({ start: function(query) {
            test.equal(" INNER JOIN `profiles` AS `p` ON (p.id = u.profile_id)", query);
            return false;
        }});

        test.throws(
            function () {
                mysql.query().join({ 
                    "table": "profiles",
                    "alias": "p",
                    "conditions": "p.id = u.profile_id"
                }, [ 1, new Date(2011, 2, 12, 19, 49, 0) ]);
            },
            "Wrong number of values to escape"
        );

        mysql.query().join(
            { 
            "table": "profiles",
            "alias": "p",
            "conditions": "p.id = u.profile_id AND approved = ? AND created >= ?"
            },
            [ 1, new Date(2011, 2, 12, 19, 49, 0) ]
        ).execute({ start: function(query) {
            test.equal(" INNER JOIN `profiles` AS `p` ON (p.id = u.profile_id AND approved = 1 AND created >= '2011-03-12 19:49:00')", query);
            return false;
        }});

        mysql.query().join({ 
            "type": "left",
            "escape": false,
            "table": "(t2,t3,t4)"
        }).execute({ start: function(query) {
            test.equal(" LEFT JOIN (t2,t3,t4)", query);
            return false;
        }});

        mysql.query().join({ 
            "type": "left",
            "escape": false,
            "table": "(t2 CROSS JOIN t3 CROSS JOIN t4)",
            "conditions": "t2.a=t1.a AND t3.b=t1.b AND t4.c=t1.c"
        }).execute({ start: function(query) {
            test.equal(" LEFT JOIN (t2 CROSS JOIN t3 CROSS JOIN t4) ON (t2.a=t1.a AND t3.b=t1.b AND t4.c=t1.c)", query);
            return false;
        }});

        test.done();
    },
    "limit()": function(test) {
        var mysql = this.mysql;
        test.expect(4);
 
        test.throws(
            function () {
                mysql.query().limit();
            },
            "Argument \"rows\" is mandatory"
        );

        test.throws(
            function () {
                mysql.query().limit("1");
            },
            "Argument \"rows\" must be a valid UINT32"
        );

        mysql.query().limit(1).execute({ start: function(query) {
            test.equal(" LIMIT 1", query);
            return false;
        }});

        mysql.query().limit(5, 10).execute({ start: function(query) {
            test.equal(" LIMIT 5,10", query);
            return false;
        }});

        test.done();
    },
    "add()": function(test) {
        var mysql = this.mysql;
        test.expect(3);
 
        test.throws(
            function () {
                mysql.query().add();
            },
            "Argument \"join\" is mandatory"
        );

        mysql.query().add("one").execute({ start: function(query) {
            test.equal(" one", query);
            return false;
        }});

        mysql.query().add("one").add("two").execute({ start: function(query) {
            test.equal(" one two", query);
            return false;
        }});

        test.done();
    },
    "chained build": function(test) {
        var mysql = this.mysql;
        test.expect(1);

        mysql.query().
            select("*").
            from("users").
            join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
            where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
            limit(10).
            execute({ start: function(query) {
                test.equal("SELECT * FROM `users` INNER JOIN `profiles` AS `p` ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);
                return false;
            }});

        test.done();
    }
});
