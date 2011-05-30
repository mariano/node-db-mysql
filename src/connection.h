// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#ifndef SRC_CONNECTION_H_
#define SRC_CONNECTION_H_

#include <mysql.h>
#include <string>
#include "./node-db/connection.h"
#include "./result.h"

namespace node_db_mysql {
class Connection : public node_db::Connection {
    public:
        Connection();
        ~Connection();
        void setCharset(const std::string& charset) throw();
        void setCompress(const bool compress) throw();
        void setInitCommand(const std::string& initCommand) throw();
        void setReadTimeout(const uint32_t readTimeout) throw();
        void setReconnect(const bool reconnect) throw();
        void setSocket(const std::string& socket) throw();
        void setSslVerifyServer(const bool sslVerifyServer) throw();
        void setTimeout(const uint32_t timeout) throw();
        void setWriteTimeout(const uint32_t writeTimeout) throw();
        bool isAlive(bool ping) throw();
        void open() throw(node_db::Exception&);
        void close();
        std::string escape(const std::string& string) const throw(node_db::Exception&);
        std::string version() const;
        node_db::Result* query(const std::string& query) const throw(node_db::Exception&);

    protected:
        std::string charset;
        bool compress;
        std::string initCommand;
        uint32_t readTimeout;
        bool reconnect;
        std::string socket;
        bool sslVerifyServer;
        uint32_t timeout;
        uint32_t writeTimeout;

    private:
        MYSQL* connection;
};
}

#endif  // SRC_CONNECTION_H_
