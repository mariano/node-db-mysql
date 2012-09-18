// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./events.h"

#if !NODE_VERSION_AT_LEAST(0, 5, 0)
v8::Persistent<v8::String> node_db::EventEmitter::syEmit;
#endif

node_db::EventEmitter::EventEmitter() : node::ObjectWrap() {
}

void node_db::EventEmitter::Init() {
#if !NODE_VERSION_AT_LEAST(0, 5, 0)
    syEmit = NODE_PERSISTENT_SYMBOL("emit");
#endif
}

bool node_db::EventEmitter::Emit(const char* event, int argc, v8::Handle<v8::Value> argv[]) {
    v8::HandleScope scope;

    int nArgc = argc + 1;
    v8::Handle<v8::Value>* nArgv = new v8::Handle<v8::Value>[nArgc];
    if (nArgv == NULL) {
        return false;
    }

    nArgv[0] = v8::String::New(event);
    for (int i=0; i < argc; i++) {
        nArgv[i + 1] = argv[i];
    }

#if NODE_VERSION_AT_LEAST(0, 5, 0)
    node::MakeCallback(this->handle_, "emit", nArgc, nArgv);
#else
    v8::Local<v8::Value> emit_v = this->handle_->Get(syEmit);
    if (!emit_v->IsFunction()) {
        return false;
    }
    v8::Local<v8::Function> emit = v8::Local<v8::Function>::Cast(emit_v);

    v8::TryCatch try_catch;
    emit->Call(this->handle_, nArgc, nArgv);
#endif

    delete [] nArgv;

#if !NODE_VERSION_AT_LEAST(0, 5, 0)
    if (try_catch.HasCaught()) {
        node::FatalException(try_catch);
    }
#endif

    return true;
}
