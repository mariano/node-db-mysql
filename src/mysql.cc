// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./mysql.h"

v8::Persistent<v8::FunctionTemplate> node_db_mysql::Mysql::constructorTemplate;

node_db_mysql::Mysql::Mysql(): node_db::Binding() {
    this->connection = new node_db_mysql::Connection();
    assert(this->connection);
}

node_db_mysql::Mysql::~Mysql() {
    if (this->connection != NULL) {
        delete this->connection;
    }
}

void node_db_mysql::Mysql::Init(v8::Handle<v8::Object> target) {
    v8::HandleScope scope;

    v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

    constructorTemplate = v8::Persistent<v8::FunctionTemplate>::New(t);
    constructorTemplate->Inherit(node::EventEmitter::constructor_template);
    constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);

    node_db::Binding::Init(target, constructorTemplate);

    target->Set(v8::String::NewSymbol("Mysql"), constructorTemplate->GetFunction());
}

v8::Handle<v8::Value> node_db_mysql::Mysql::New(const v8::Arguments& args) {
    v8::HandleScope scope;

    node_db_mysql::Mysql* binding = new node_db_mysql::Mysql();
    if (binding == NULL) {
        THROW_EXCEPTION("Can't create client object")
    }

    if (args.Length() > 0) {
        v8::Handle<v8::Value> set = binding->set(args);
        if (!set.IsEmpty()) {
            return scope.Close(set);
        }
    }

    binding->Wrap(args.This());

    return scope.Close(args.This());
}

v8::Handle<v8::Value> node_db_mysql::Mysql::set(const v8::Arguments& args) {
    v8::Handle<v8::Value> result = node_db::Binding::set(args);

    v8::Local<v8::Object> options = args[0]->ToObject();
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, socket);

    node_db_mysql::Connection* connection = static_cast<node_db_mysql::Connection*>(this->connection);

    if (options->Has(socket_key)) {
        v8::String::Utf8Value socket(options->Get(socket_key)->ToString());
        connection->setSocket(*socket);
    }

    return result;
}

v8::Persistent<v8::Object> node_db_mysql::Mysql::createQuery() const {
    v8::Persistent<v8::Object> query(
        node_db_mysql::Query::constructorTemplate->GetFunction()->NewInstance());
    return query;
}
