// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./connection.h"

node_db_mysql::Connection::Connection()
    : connection(NULL) {
    this->connection = new MYSQL();
    if (this->connection == NULL) {
        throw node_db::Exception("Cannot create MYSQL handle");
    }
    mysql_init(this->connection);
}

node_db_mysql::Connection::~Connection() {
    this->close();
    if (this->connection != NULL) {
        delete this->connection;
    }
}

void node_db_mysql::Connection::open() throw(node_db::Exception&) {
    this->close();

    this->opened = mysql_real_connect(
        this->connection,
        this->hostname.c_str(),
        this->user.c_str(),
        this->password.c_str(),
        this->database.c_str(),
        this->port,
        NULL,
        0);
    if (!this->opened) {
        throw node_db::Exception(mysql_error(this->connection));
    }
}

void node_db_mysql::Connection::close() {
    if (this->opened) {
        mysql_close(this->connection);
    }
    this->opened = false;
}

std::string node_db_mysql::Connection::escape(const std::string& string) const throw(node_db::Exception&) {
    char* buffer = new char[string.length() * 2 + 1];
    if (buffer == NULL) {
        throw node_db::Exception("Can\'t create buffer to escape string");
    }

    mysql_real_escape_string(this->connection, buffer, string.c_str(), string.length());

    std::string escaped = buffer;
    delete [] buffer;
    return escaped;
}

std::string node_db_mysql::Connection::version() const {
    std::string version;
    if (this->opened) {
        version = mysql_get_server_info(this->connection);
    }
    return version;
}

node_db::Result* node_db_mysql::Connection::query(const std::string& query) const throw(node_db::Exception&) {
#ifdef MYSQL_NON_THREADSAFE
    throw node_db::Exception("This binding needs to be linked with the thread safe MySQL library libmysqlclient_r");
#endif

    if (!this->opened) {
        throw node_db::Exception("Can't execute query without an opened connection");
    }

    if (mysql_query(this->connection, query.c_str()) != 0) {
        throw node_db::Exception(mysql_error(this->connection));
    }

    MYSQL_RES* result = mysql_store_result(this->connection);
    if (result == NULL) {
        throw node_db::Exception("Could not fetch result of query");
    }

    return new node_db_mysql::Result(this->connection, result);
}
