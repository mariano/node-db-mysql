// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#ifndef EXCEPTION_H_
#define EXCEPTION_H_

#include <exception>
#include <string>

namespace node_db {
class Exception : public std::exception {
    public:
        explicit Exception(const char* message) throw();
        explicit Exception(const std::string& message) throw();
        ~Exception() throw();
        const char* what() const throw();
        std::string::size_type size() throw();
        void setMessage(const char* message) throw();
    protected:
        std::string message;
};
}

#endif  // EXCEPTION_H_
