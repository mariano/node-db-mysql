// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./query.h"

v8::Persistent<v8::FunctionTemplate> node_db_mysql::Query::constructorTemplate;

void node_db_mysql::Query::Init(v8::Handle<v8::Object> target) {
    v8::HandleScope scope;

    v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

    constructorTemplate = v8::Persistent<v8::FunctionTemplate>::New(t);
    constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);

    node_db::Query::Init(target, constructorTemplate);

    target->Set(v8::String::NewSymbol("Query"), constructorTemplate->GetFunction());
}

v8::Handle<v8::Value> node_db_mysql::Query::New(const v8::Arguments& args) {
    v8::HandleScope scope;

    node_db_mysql::Query* query = new node_db_mysql::Query();
    if (query == NULL) {
        THROW_EXCEPTION("Can't create query object")
    }

    if (args.Length() > 0) {
        v8::Handle<v8::Value> set = query->set(args);
        if (!set.IsEmpty()) {
            return scope.Close(set);
        }
    }

    query->Wrap(args.This());

    return scope.Close(args.This());
}
