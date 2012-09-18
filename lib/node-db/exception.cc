// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./exception.h"

node_db::Exception::Exception(const char* message) throw() : exception() {
    this->setMessage(message);
}

node_db::Exception::Exception(const std::string& message) throw() : exception() {
    this->setMessage(message.c_str());
}

node_db::Exception::~Exception() throw() {
}

void node_db::Exception::setMessage(const char* message) throw() {
    this->message = message;
}

const char* node_db::Exception::what() const throw() {
    return (!this->message.empty() ? this->message.c_str() : NULL);
}

std::string::size_type node_db::Exception::size() throw() {
    return (!this->message.empty() ? this->message.size() : 0);
}
