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
        void open() throw(node_db::Exception&);
        void close();
        std::string escape(const std::string& string) const throw(node_db::Exception&);
        std::string version() const;
        node_db::Result* query(const std::string& query) const throw(node_db::Exception&);

    private:
        MYSQL* connection;
};
}

#endif  // SRC_CONNECTION_H_
