// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#ifndef RESULT_H_
#define RESULT_H_

#include <stdint.h>
#include <stdexcept>
#include <string>
#include "./exception.h"

namespace node_db {
class Result {
    public:
        class Column {
            public:
                typedef enum {
                    STRING,
                    TEXT,
                    INT,
                    NUMBER,
                    DATE,
                    TIME,
                    DATETIME,
                    BOOL,
                    SET
                } type_t;

                virtual ~Column();
                virtual std::string getName() const = 0;
                virtual type_t getType() const = 0;
                virtual bool isBinary() const;
        };

        virtual ~Result();
        virtual void release() throw();
        virtual bool hasNext() const throw(Exception&) = 0;
        virtual char** next() throw(Exception&) = 0;
        virtual unsigned long* columnLengths() throw(Exception&) = 0;
        virtual uint64_t index() const throw(std::out_of_range&) = 0;
        virtual Column* column(uint16_t i) const throw(std::out_of_range&) = 0;
        virtual uint64_t insertId() const throw(Exception&);
        virtual uint64_t affectedCount() const throw() = 0;
        virtual uint16_t warningCount() const throw(Exception&);
        virtual uint16_t columnCount() const throw() = 0;
        virtual uint64_t count() const throw(Exception&);
        virtual bool isBuffered() const throw() = 0;
        virtual bool isEmpty() const throw() = 0;
};
}

#endif  // RESULT_H_
