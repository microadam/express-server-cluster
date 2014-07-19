# express-server-cluster

Create a clustered express server

[![build status](https://secure.travis-ci.org/microadam/express-server-cluster.png)](http://travis-ci.org/microadam/express-server-cluster)

## Installation

```
npm install express-server-cluster --save
```

## Usage

```
var express = require('express')
  , server = express()
  , createServerCluster = require('express-server-cluster')
  , options =
    { url: 'http://localhost:5678'
    , port: 5678
    , numProcesses: 1
    }

server.on('started', function (server) {
  console.log('server started on: ' + server.address().port)
})
createServerCluster(server, console, options)

```

## Credits
[Adam Duncan](https://github.com/microadam/)
