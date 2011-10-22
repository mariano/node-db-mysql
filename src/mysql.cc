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
        ARG_CHECK_OBJECT(0, options);

        v8::Handle<v8::Value> set = binding->set(args[0]->ToObject());
        if (!set.IsEmpty()) {
            return scope.Close(set);
        }
    }

    binding->Wrap(args.This());

    return scope.Close(args.This());
}

v8::Handle<v8::Value> node_db_mysql::Mysql::set(const v8::Local<v8::Object> options) {
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, hostname);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, user);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, password);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, database);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_UINT32(options, port);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, charset);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_BOOL(options, compress);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, initCommand);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_UINT32(options, readTimeout);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_BOOL(options, reconnect);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_STRING(options, socket);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_BOOL(options, sslVerifyServer);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_UINT32(options, timeout);
    ARG_CHECK_OBJECT_ATTR_OPTIONAL_UINT32(options, writeTimeout);

    node_db_mysql::Connection* connection = static_cast<node_db_mysql::Connection*>(this->connection);

    v8::String::Utf8Value hostname(options->Get(hostname_key)->ToString());
    v8::String::Utf8Value user(options->Get(user_key)->ToString());
    v8::String::Utf8Value password(options->Get(password_key)->ToString());
    v8::String::Utf8Value database(options->Get(database_key)->ToString());

    if (options->Has(hostname_key)) {
        connection->setHostname(*hostname);
    }

    if (options->Has(user_key)) {
        connection->setUser(*user);
    }

    if (options->Has(password_key)) {
        connection->setPassword(*password);
    }

    if (options->Has(database_key)) {
        connection->setDatabase(*database);
    }

    if (options->Has(port_key)) {
        connection->setPort(options->Get(port_key)->ToInt32()->Value());
    }

    if (options->Has(charset_key)) {
        v8::String::Utf8Value charset(options->Get(charset_key)->ToString());
        connection->setCharset(*charset);
    }

    if (options->Has(compress_key)) {
        connection->setCompress(options->Get(compress_key)->IsTrue());
    }

    if (options->Has(initCommand_key)) {
        v8::String::Utf8Value initCommand(options->Get(initCommand_key)->ToString());
        connection->setInitCommand(*initCommand);
    }

    if (options->Has(readTimeout_key)) {
        connection->setReadTimeout(options->Get(readTimeout_key)->ToInt32()->Value());
    }

    if (options->Has(reconnect_key)) {
        connection->setReconnect(options->Get(reconnect_key)->IsTrue());
    }

    if (options->Has(socket_key)) {
        v8::String::Utf8Value socket(options->Get(socket_key)->ToString());
        connection->setSocket(*socket);
    }

    if (options->Has(sslVerifyServer_key)) {
        connection->setSslVerifyServer(options->Get(sslVerifyServer_key)->IsTrue());
    }

    if (options->Has(timeout_key)) {
        connection->setTimeout(options->Get(timeout_key)->ToInt32()->Value());
    }

    if (options->Has(writeTimeout_key)) {
        connection->setWriteTimeout(options->Get(writeTimeout_key)->ToInt32()->Value());
    }

    return v8::Handle<v8::Value>();
}

v8::Persistent<v8::Object> node_db_mysql::Mysql::createQuery() const {
    v8::Persistent<v8::Object> query(
        node_db_mysql::Query::constructorTemplate->GetFunction()->NewInstance());
    return query;
}
