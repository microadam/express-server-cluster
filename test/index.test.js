var assert = require('assert')
  , request = require('supertest')
  , express = require('express')
  , createServerCluster = require('../')
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
    createServerCluster(server, console, options)
  })

  it('should start up a clustered server with default options', function (done) {
    var server = express()
    server.on('started', function (server) {
      assert.equal(server.address().port, 5678)
      server.close()
      done()
    })
    createServerCluster(server, console)
  })

  it('should handle successful requests', function (done) {
    var server = express()
    server.get('/', function (req, res) {
      res.send(200)
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
    createServerCluster(server, console, options)
  })

  it('should handle failed requests', function (done) {
    var server = express()
      , requestErrorCalled = false
    server.get('/', function () {
      setTimeout(function() {
        throw new Error('Asynchronous error')
      }, 100)
    })
    server.on('requestError', function (error, req) {
      assert(error, 'error should exist')
      assert(req, 'req should exist')
      requestErrorCalled = true
    })
    server.on('started', function (server) {
      request(server)
      .get('/')
      .expect(500)
      .end(function (error) {
        assert(error, 'error should exist')
        assert.equal(requestErrorCalled, true)
        done()
      })

    })
    createServerCluster(server, console, options)
  })

})
