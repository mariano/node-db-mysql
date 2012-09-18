// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#ifndef EVENTS_H_
#define EVENTS_H_

#include <v8.h>
#include <node_object_wrap.h>
#include <node_version.h>
#include "./node_defs.h"

namespace node_db {
class EventEmitter : public node::ObjectWrap {
    public:
        static void Init();

    protected:
#if !NODE_VERSION_AT_LEAST(0, 5, 0)
        static v8::Persistent<v8::String> syEmit;
#endif

        EventEmitter();
        bool Emit(const char* event, int argc,  v8::Handle<v8::Value> argv[]);
};
}

#endif  // BINDING_H_
