{
  "targets": [
    {
      "target_name": "mysql_bindings",
      'include_dirs': [
              'lib/',
              '.',
              '<!@(mysql_config --include)'
      ],
      'cflags': [
        '<!@(mysql_config --cflags)'
      ],
      'cflags!': [
        '-fno-exceptions'
      ],
      'cflags_cc!': [
        '-fno-exceptions'
      ],
      "sources": [ 
        "lib/node-db/exception.cc",
        "lib/node-db/binding.cc",
        "lib/node-db/connection.cc",
        "lib/node-db/events.cc",
        "lib/node-db/query.cc",
        "lib/node-db/result.cc",
        "src/connection.cc",
        "src/mysql.cc",
        "src/query.cc",
        "src/result.cc",
        "src/mysql_bindings.cc"
      ],
      'link_settings': {
          'libraries': [
              '<!@(mysql_config --libs_r)'
          ]
      }
    }
  ]
}
