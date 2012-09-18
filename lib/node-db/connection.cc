// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./connection.h"

node_db::Connection::Connection()
    :quoteString('\''),
    alive(false),
    quoteName('`') {
    pthread_mutex_init(&(this->connectionLock), NULL);
}

node_db::Connection::~Connection() {
    pthread_mutex_destroy(&(this->connectionLock));
}

std::string node_db::Connection::getHostname() const {
    return this->hostname;
}

void node_db::Connection::setHostname(const std::string& hostname) {
    this->hostname = hostname;
}

std::string node_db::Connection::getUser() const {
    return this->user;
}

void node_db::Connection::setUser(const std::string& user) {
    this->user = user;
}

std::string node_db::Connection::getPassword() const {
    return this->password;
}

void node_db::Connection::setPassword(const std::string& password) {
    this->password = password;
}

std::string node_db::Connection::getDatabase() const {
    return this->database;
}

void node_db::Connection::setDatabase(const std::string& database) {
    this->database = database;
}

uint32_t node_db::Connection::getPort() const {
    return this->port;
}

void node_db::Connection::setPort(uint32_t port) {
    this->port = port;
}

bool node_db::Connection::isAlive(bool ping) {
    return this->alive;
}

std::string node_db::Connection::escapeName(const std::string& string) const throw(Exception&) {
    std::string escaped;
    if (string.find_first_of('.') != string.npos) {
        char* original = reinterpret_cast<char*>(const_cast<char*>(string.c_str()));
        char* token;
        char* rest;
        bool first = true;

        while ((token = strtok_r(original, ".", &rest))) {
            if (!first) {
                escaped += '.';
            } else {
                first = false;
            }
            if (token[0] != '*') {
                escaped += this->quoteName;
                escaped += token;
                escaped += this->quoteName;
            } else {
                escaped += token;
            }
            original = rest;
        }
    } else {
        escaped = this->quoteName + string + this->quoteName;
    }
    return escaped;
}

void node_db::Connection::lock() {
    pthread_mutex_lock(&(this->connectionLock));
}

void node_db::Connection::unlock() {
    pthread_mutex_unlock(&(this->connectionLock));
}
