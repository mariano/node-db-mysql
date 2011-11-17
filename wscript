####
# Copyright by Mariano Iglesias
# See contributors list in README.md
#
# See license text in LICENSE file
####

import Options, Utils
from os import unlink, symlink, chdir
from os.path import exists

srcdir = "."
blddir = "build"
VERSION = "0.7.6"

def set_options(opt):
  opt.tool_options("compiler_cxx")
  opt.add_option('--debug', action='store_true', help='Run tests with nodeunit_g')
  opt.add_option('--warn', action='store_true', help='Enable extra -W* compiler flags')

def configure(conf):
  conf.check_tool("compiler_cxx")
  conf.check_tool("node_addon")
  
  # Enables all the warnings that are easy to avoid
  conf.env.append_unique('CXXFLAGS', ["-Wall"])
  if Options.options.warn:
    # Extra warnings
    conf.env.append_unique('CXXFLAGS', ["-Wextra"])
    # Extra warnings, gcc 4.4
    conf.env.append_unique('CXXFLAGS', ["-Wconversion", "-Wshadow", "-Wsign-conversion", "-Wunreachable-code", "-Wredundant-decls", "-Wcast-qual"])

  # MySQL flags and libraries
  mysql_config = conf.find_program('mysql_config', var='MYSQL_CONFIG', mandatory=True)

  conf.env.append_unique('CXXFLAGS', Utils.cmd_output(mysql_config + ' --include').split())
  conf.env.append_unique('LINKFLAGS', Utils.cmd_output(mysql_config + ' --libs_r').split())
  conf.check_cxx(lib="mysqlclient_r", errmsg="Missing libmysqlclient_r")

def build(bld):
  obj = bld.new_task_gen("cxx", "shlib", "node_addon")
  obj.target = "mysql_bindings"
  obj.source = "lib/node-db/binding.cc lib/node-db/connection.cc lib/node-db/events.cc lib/node-db/exception.cc lib/node-db/query.cc lib/node-db/result.cc src/connection.cc src/mysql.cc src/query.cc src/result.cc src/mysql_bindings.cc"
  obj.includes = "lib/"
  obj.uselib = "MYSQLCLIENT"

def test(tst):
  test_binary = 'nodeunit'
  if Options.options.debug:
    test_binary = 'nodeunit_g'
  
  Utils.exec_command(test_binary + ' tests.js')

def lint(lnt):
  # Bindings C++ source code
  print("Run CPPLint:")
  Utils.exec_command('cpplint --filter=-whitespace/line_length ./lib/node-db/*.h ./lib/node-db/*.cc ./src/*.h ./src/*.cc')
  # Bindings javascript code, and tools
  print("Run Nodelint for sources:")
  Utils.exec_command('nodelint ./package.json ./db-drizzle.js')
