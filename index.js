module.exports = createServerCluster

var domain = require('domain')
  , http = require('http')
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

    var serverDomain = domain.create()
    serverDomain.run(function () {

      var httpServer = http.createServer(function (req, res) {

        var reqd = domain.create()
        reqd.add(req)
        reqd.add(res)

        reqd.on('error', function (error) {
          server.emit('requestError', error, req.url)
          reqd.dispose()
        })

        reqd.run(function () {
          return server(req, res)
        })
      }).listen(options.port, function () {
        server.emit('started', httpServer)
      })
    })

    serverDomain.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        logger.error('Error EADDRINUSE. Port %d already in use.', options.port)
      }
      throw err
    })

  }
  , { logger: logger
    , size: options.numProcesses
    })
}
