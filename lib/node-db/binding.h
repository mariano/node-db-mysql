// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#ifndef BINDING_H_
#define BINDING_H_

#include <node.h>
#include <node_version.h>
#include <string>
#include "./node_defs.h"
#include "./connection.h"
#include "./events.h"
#include "./exception.h"
#include "./query.h"

namespace node_db {
class Binding : public EventEmitter {
    public:
        Connection* connection;

    protected:
        struct connect_request_t {
            v8::Persistent<v8::Object> context;
            Binding* binding;
            const char* error;
        };
        v8::Persistent<v8::Function>* cbConnect;

        Binding();
        ~Binding();
        static void Init(v8::Handle<v8::Object> target, v8::Persistent<v8::FunctionTemplate> constructorTemplate);
        static v8::Handle<v8::Value> Connect(const v8::Arguments& args);
        static v8::Handle<v8::Value> Disconnect(const v8::Arguments& args);
        static v8::Handle<v8::Value> IsConnected(const v8::Arguments& args);
        static v8::Handle<v8::Value> Escape(const v8::Arguments& args);
        static v8::Handle<v8::Value> Name(const v8::Arguments& args);
        static v8::Handle<v8::Value> Query(const v8::Arguments& args);
        static void uvConnect(uv_work_t* uvRequest);
        static void uvConnectFinished(uv_work_t* uvRequest);
        static void connect(connect_request_t* request);
        static void connectFinished(connect_request_t* request);
        virtual v8::Handle<v8::Value> set(const v8::Local<v8::Object> options) = 0;
        virtual v8::Persistent<v8::Object> createQuery() const = 0;
};
}

#endif  // BINDING_H_
