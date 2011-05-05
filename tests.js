/* Escape & Query building tests */

require("./db-mysql");
try {
    nodeunit = require("nodeunit");
} catch(err) {
    require.paths.unshift("/usr/lib/node_modules");
    nodeunit = require("nodeunit/lib/nodeunit");
}
var testCase = nodeunit.testCase;

exports["Client"] = testCase({
    "setUp": function(callback) {
        this.client = new Mysql();
        callback();
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
    "table() and field()": function(test) {
        var client = this.client;
        test.expect(3);

        test.equal("`field`", client.field("field"));
        test.equal("`table`", client.field("table"));
        test.equal("`table`.`field`", client.field("table.field"));
        
        test.done();
    }
});

exports["Query"] = testCase({
    "setUp": function(callback) {
        this.client = new Mysql();
        callback();
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
        test.expect(4);

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

        test.done();
    },
    "select()": function(test) {
        var client = this.client, query = "";
        test.expect(11);

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
        test.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);

        query = client.query().select(["id", "user", {"number": 1, "date": new Date(1978,6,13,18,30,0)}]).sql();
        test.equal("SELECT `id`,`user`,1 AS `number`,'1978-07-13 18:30:00' AS `date`", query);

        query = client.query().select({"total": "COUNT(*)"}).sql();
        test.equal("SELECT COUNT(*) AS `total`", query);

        query = client.query().select(["id", {"total": "COUNT(*)"}]).sql();
        test.equal("SELECT `id`,COUNT(*) AS `total`", query);

        query = client.query().select(["id", "user", {"string": {"escape": true, "value": "Hello 'world'"}}]).sql();
        test.equal("SELECT `id`,`user`,'Hello \\'world\\'' AS `string`", query);

        query = client.query().select({"string": { "escape": true, "value": "Hello 'world'"}}).sql();
        test.equal("SELECT 'Hello \\'world\\'' AS `string`", query);

        test.done();
    },
    "from()": function(test) {
        var client = this.client, query = "";
        test.expect(6);

        test.throws(
            function () {
                client.query().from();
            },
            "Argument \"fields\" is mandatory"
        );

        query = client.query().from("users").sql();
        test.equal(" FROM `users`", query);

        query = client.query().from("users, profiles", false).sql();
        test.equal(" FROM users, profiles", query);

        test.throws(
            function () {
                client.query().from({});
            },
            "Non empty objects should be used for aliasing in from"
        );

        query = client.query().from({"users_alias": "users"}).sql();
        test.equal(" FROM `users` AS `users_alias`", query);

        query = client.query().from({"users_alias": "users"}, false).sql();
        test.equal(" FROM users AS users_alias", query);

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
                client.query().where("id = ?");
            },
            "Wrong number of values to escape"
        );

        test.throws(
            function () {
                client.query().where("id = ?", []);
            },
            "Wrong number of values to escape"
        );

        query = client.query().where("id=?", [ 1 ]).sql();
        test.equal(" WHERE id=1", query);

        query = client.query().where("(id=? OR name=?) AND created > ?", [ 1, "Janine O'Hara", new Date(2011,2,12,20,15,0) ]).sql();
        test.equal(" WHERE (id=1 OR name='Janine O\\'Hara') AND created > '2011-03-12 20:15:00'", query);

        query = client.query().where("1=1").and("2=2").sql();
        test.equal(" WHERE 1=1 AND 2=2", query);

        query = client.query().where("1=1").and("2=2").or("3=3").sql();
        test.equal(" WHERE 1=1 AND 2=2 OR 3=3", query);

        test.done();
    },
    "join()": function(test) {
        var client = this.client, query = "";
        test.expect(8);
 
        test.throws(
            function () {
                client.query().join();
            },
            "Argument \"join\" is mandatory"
        );

        query = client.query().join({ "table": "profiles" }).sql();
        test.equal(" INNER JOIN `profiles`", query);

        query = client.query().join({ 
            "table": "profiles",
            "alias": "p" 
        }).sql();
        test.equal(" INNER JOIN `profiles` AS `p`", query);

        query = client.query().join({ 
            "table": "profiles",
            "alias": "p",
            "conditions": "p.id = u.profile_id"
        }).sql();
        test.equal(" INNER JOIN `profiles` AS `p` ON (p.id = u.profile_id)", query);

        test.throws(
            function () {
                client.query().join({ 
                    "table": "profiles",
                    "alias": "p",
                    "conditions": "p.id = u.profile_id"
                }, [ 1, new Date(2011, 2, 12, 19, 49, 0) ]);
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
        ).sql();
        test.equal(" INNER JOIN `profiles` AS `p` ON (p.id = u.profile_id AND approved = 1 AND created >= '2011-03-12 19:49:00')", query);

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

        test.done();
    },
    "limit()": function(test) {
        var client = this.client;
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
        test.equal("(SELECT * FROM `users`)", query);

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
        test.equal("DELETE `users`", query);

        query = client.query().
            delete({"users_alias": "users"}).
            sql();
        test.equal("DELETE `users` AS `users_alias`", query);

        test.done();
    },
    "insert()": function(test) {
        var client = this.client, query = "";
        test.expect(6);

        query = client.query().
            insert("users").
            sql();
        test.equal("INSERT INTO `users` ", query);

        query = client.query().
            insert("users", ["name", "email"]).
            sql();
        test.equal("INSERT INTO `users`(`name`,`email`) ", query);

        query = client.query().
            insert("users", ["name", "email"], ["john", "john.doe@email.com"]).
            sql();
        test.equal("INSERT INTO `users`(`name`,`email`) VALUES ('john','john.doe@email.com')", query);

        query = client.query().
            insert("users", ["name", "email"], [["john", "john.doe@email.com"]]).
            sql();
        test.equal("INSERT INTO `users`(`name`,`email`) VALUES ('john','john.doe@email.com')", query);

        query = client.query().
            insert("users", ["name", "email"], [["john", "john.doe@email.com"],["jane", "jane.doe@email.com"]]).
            sql();
        test.equal("INSERT INTO `users`(`name`,`email`) VALUES ('john','john.doe@email.com'),('jane','jane.doe@email.com')", query);

        query = client.query().
            insert("users", false, [["john", "john.doe@email.com"],["jane", "jane.doe@email.com"]]).
            sql();
        test.equal("INSERT INTO `users` VALUES ('john','john.doe@email.com'),('jane','jane.doe@email.com')", query);

        test.done();
    },
    "update()": function(test) {
        var client = this.client, query = "";
        test.expect(6);

        query = client.query().
            update("users").
            sql();
        test.equal("UPDATE `users`", query);

        query = client.query().
            update({"u": "users"}).
            sql();
        test.equal("UPDATE `users` AS `u`", query);

        query = client.query().
            update("users").
            set({ "name": "John Doe" }).
            sql();
        test.equal("UPDATE `users` SET `name`='John Doe'", query);

        query = client.query().
            update("users").
            set({ "name": "John Doe", "email": "john.doe@email.com" }).
            sql();
        test.equal("UPDATE `users` SET `name`='John Doe',`email`='john.doe@email.com'", query);

        query = client.query().
            update("users").
            set({ "name": "John Doe", "email": "john.doe@email.com", "age": 33 }).
            sql();
        test.equal("UPDATE `users` SET `name`='John Doe',`email`='john.doe@email.com',`age`=33", query);

        query = client.query().
            update("users").
            set({ "name": "John Doe", "email": "john.doe@email.com", "age": {"value": "real_age", "escape": false} }).
            sql();
        test.equal("UPDATE `users` SET `name`='John Doe',`email`='john.doe@email.com',`age`=real_age", query);

        test.done();
    },
    "chained select": function(test) {
        var client = this.client, query = "";
        test.expect(2);

        query = client.query().
            select("*").
            from("users").
            join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
            where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
            limit(10).
            sql();

        test.equal("SELECT * FROM `users` INNER JOIN `profiles` AS `p` ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);

        query = client.query().
            select("*").
            from("users").
            where("id IN ?", [ client.query().
                select("id").
                from("profiles")
            ]).
            sql();

        test.throws(
            function () {
                sql = client.query().
                    select("*").
                    from("users").
                    where("id IN ?", [ { "test": "value" }]).
                    sql();
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
            sql();
        test.equal("DELETE FROM `users` WHERE created > '2011-03-12 20:16:00'", query);

        query = client.query().
            delete("users").
            from("users").
            join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
            where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
            sql();
        test.equal("DELETE `users` FROM `users` INNER JOIN `profiles` AS `p` ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00'", query);

        test.done();
    },
    "chained insert": function(test) {
        var client = this.client, query = "";
        test.expect(1);

        query = client.query().
            insert("profiles", ["name", "age", "created"]).
            select(["name", {"value": 32}, "created"]).
            from("users").
            join({"table": "profiles", "alias": "p", "conditions": "p.id=users.profile_id"}).
            where("created > ?", [ new Date(2011,02,12,20,16,0) ]).
            limit(10).
            sql();
        test.equal("INSERT INTO `profiles`(`name`,`age`,`created`) SELECT `name`,32 AS `value`,`created` FROM `users` INNER JOIN `profiles` AS `p` ON (p.id=users.profile_id) WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);

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
            sql();
        test.equal("UPDATE `users` INNER JOIN `profiles` AS `p` ON (p.id=users.profile_id) SET `name`='New Name' WHERE created > '2011-03-12 20:16:00' LIMIT 10", query);

        test.done();
    }
});
