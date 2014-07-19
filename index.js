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
    { url: 'http://localhost:5678'
    , port: 5678
    , numProcesses: Math.ceil(cpus.length * 0.7)
    }
  options = extend({}, defaults, options)

  clusterMaster(function () {

    var serverDomain = domain.create()
    serverDomain.run(function () {

      var httpServer = http.createServer(function (req, res) {

        var resd = domain.create()
        resd.add(req)
        resd.add(res)

        resd.on('error', function (error) {
          logger.error('Error', error, req.url)
          resd.dispose()
        })

        resd.run(function () {
          return server(req, res)
        })
      }).listen(options.port, function () {
        logger.info('Server running on address: '
          + httpServer.address().address + ' port: ' + httpServer.address().port
          + ' URL: ' + options.url)
        server.emit('started', httpServer)
      })
    })

  }
  , { logger: logger
    , size: options.numProcesses
    })
}
