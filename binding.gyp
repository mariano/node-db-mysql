{
  'conditions': [
    ['OS=="mac"', {
      'make_global_settings': [
        ['CC', '/usr/bin/gcc'],
        ['CXX', '/usr/bin/g++']
      ]
    }]],
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
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'GCC_ENABLE_CPP_RTTI': 'YES'
          }
        }]],
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
