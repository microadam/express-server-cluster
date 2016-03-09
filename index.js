module.exports = createServerCluster

var http = require('http')
  , clusterMaster = require('clustered')
  , cpus = require('os').cpus()
  , extend = require('lodash.assign')

function createServerCluster(server, logger, options) {
  if (!server) {
    throw new Error('Must pass in an instance of a server')
  }

  if (!logger) {
    throw new Error('Must pass in an instance of a logger')
  }

  var defaults =
    { port: 5678
    , numProcesses: Math.ceil(cpus.length * 0.7)
    }
  options = extend({}, defaults, options)

  clusterMaster(function () {
      var httpServer = http.createServer(function (req, res) {
        return server(req, res)
      }).listen(options.port, function () {
        server.emit('started', httpServer)
      })
    }
  , { logger: logger
    , size: options.numProcesses
    }
  )
}
