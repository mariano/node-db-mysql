// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./node-db/binding.h"
#include "./mysql.h"
#include "./query.h"

extern "C" {
    void init(v8::Handle<v8::Object> target) {
        node_db::EventEmitter::Init();
        node_db_mysql::Mysql::Init(target);
        node_db_mysql::Query::Init(target);
    }

    NODE_MODULE(mysql_bindings, init);
}
