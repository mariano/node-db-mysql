// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./connection.h"

node_db_mysql::Connection::Connection()
    : compress(false),
      readTimeout(0),
      reconnect(true),
      sslVerifyServer(false),
      timeout(0),
      writeTimeout(0),
      connection(NULL) {
    this->port = 3306;
}

node_db_mysql::Connection::~Connection() {
    this->close();
}

void node_db_mysql::Connection::setCharset(const std::string& charset) throw() {
    this->charset = charset;
}

void node_db_mysql::Connection::setCompress(const bool compress) throw() {
    this->compress = compress;
}

void node_db_mysql::Connection::setInitCommand(const std::string& initCommand) throw() {
    this->initCommand = initCommand;
}

void node_db_mysql::Connection::setReadTimeout(const uint32_t readTimeout) throw() {
    this->readTimeout = readTimeout;
}

void node_db_mysql::Connection::setReconnect(const bool reconnect) throw() {
    this->reconnect = reconnect;
}

void node_db_mysql::Connection::setSocket(const std::string& socket) throw() {
    this->socket = socket;
}

void node_db_mysql::Connection::setSslVerifyServer(const bool sslVerifyServer) throw() {
    this->sslVerifyServer = sslVerifyServer;
}

void node_db_mysql::Connection::setTimeout(const uint32_t timeout) throw() {
    this->timeout = timeout;
}

void node_db_mysql::Connection::setWriteTimeout(const uint32_t writeTimeout) throw() {
    this->writeTimeout = writeTimeout;
}

bool node_db_mysql::Connection::isAlive(bool ping) throw() {
    if (ping && this->alive) {
        this->alive = (mysql_ping(this->connection) == 0);
    }
    return this->alive;
}

void node_db_mysql::Connection::open() throw(node_db::Exception&) {
    this->close();

    this->connection = mysql_init(NULL);
    if (this->connection == NULL) {
        throw node_db::Exception("Cannot create MYSQL handle");
    }

    if (!this->charset.empty()) {
        mysql_options(this->connection, MYSQL_SET_CHARSET_NAME, this->charset.c_str());
    }

    if (this->compress) {
        mysql_options(this->connection, MYSQL_OPT_COMPRESS, (const char*) 0);
    }

    if (!this->initCommand.empty()) {
        mysql_options(this->connection, MYSQL_INIT_COMMAND, this->initCommand.c_str());
    }

    if (this->readTimeout > 0) {
        mysql_options(this->connection, MYSQL_OPT_READ_TIMEOUT, (const char*) &this->readTimeout);
    }

#if MYSQL_VERSION_ID >= 50013
    mysql_options(this->connection, MYSQL_OPT_RECONNECT, (const char*) &this->reconnect);
#endif

    mysql_options(this->connection, MYSQL_OPT_SSL_VERIFY_SERVER_CERT, (const char*) &this->sslVerifyServer);

    if (this->timeout > 0) {
        mysql_options(this->connection, MYSQL_OPT_CONNECT_TIMEOUT, (const char*) &this->timeout);
    }

    if (this->writeTimeout > 0) {
        mysql_options(this->connection, MYSQL_OPT_WRITE_TIMEOUT, (const char*) &this->writeTimeout);
    }

    this->alive = mysql_real_connect(
        this->connection,
        this->hostname.c_str(),
        this->user.c_str(),
        this->password.c_str(),
        this->database.c_str(),
        this->port,
        !this->socket.empty() ? this->socket.c_str() : NULL,
        0);

#if MYSQL_VERSION_ID >= 50013 && MYSQL_VERSION_ID < 50019
    // MySQL incorrectly resets the MYSQL_OPT_RECONNECT option to its default value before MySQL 5.0.19
    mysql_options(this->connection, MYSQL_OPT_RECONNECT, (const char*) &this->reconnect);
#endif

    if (!this->alive) {
        throw node_db::Exception(mysql_error(this->connection));
    }
}

void node_db_mysql::Connection::close() {
    if (this->alive) {
        mysql_close(this->connection);
    }
    this->alive = false;
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
    std::string version = mysql_get_server_info(this->connection);
    return version;
}

node_db::Result* node_db_mysql::Connection::query(const std::string& query) const throw(node_db::Exception&) {
#ifdef MYSQL_NON_THREADSAFE
    throw node_db::Exception("This binding needs to be linked with the thread safe MySQL library libmysqlclient_r");
#endif

    if (mysql_real_query(this->connection, query.c_str(), query.length()) != 0) {
        throw node_db::Exception(mysql_error(this->connection));
    }

    return new node_db_mysql::Result(this->connection);
}
