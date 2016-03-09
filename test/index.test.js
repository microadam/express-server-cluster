var assert = require('assert')
  , request = require('supertest')
  , express = require('express')
  , createServerCluster = require('../')
  , logger = require('mc-logger')
  , options =
    { url: 'http://localhost:5679'
    , port: 5679
    , numProcesses: 1
    }

describe('express-server-cluster', function () {

  it('should throw error if not given a server', function () {
    assert.throws(function () {
      createServerCluster()
    }, /Must pass in an instance of a server/)
  })

  it('should throw error if not given a logger', function () {
    var server = express()
    assert.throws(function () {
      createServerCluster(server)
    }, /Must pass in an instance of a logger/)
  })

  it('should start up a clustered server', function (done) {
    var server = express()
    server.on('started', function (server) {
      assert.equal(server.address().port, 5679)
      server.close()
      done()
    })
    createServerCluster(server, logger, options)
  })

  it('should start up a clustered server with default options', function (done) {
    var server = express()
    server.on('started', function (server) {
      assert.equal(server.address().port, 5678)
      server.close()
      done()
    })
    createServerCluster(server, logger)
  })

  it('should handle successful requests', function (done) {
    var server = express()
    server.get('/', function (req, res) {
      res.sendStatus(200)
    })
    server.on('started', function (server) {
      request(server)
      .get('/')
      .expect(200)
      .end(function (error) {
        server.close()
        if (error) return done(error)
        done()
      })

    })
    createServerCluster(server, logger, options)
  })

})
