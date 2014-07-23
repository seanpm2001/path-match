
var request = require('supertest')
var assert = require('assert')
var koa = require('koa')

var match = require('..')()

describe('match(path)', function () {
  describe('matches', function () {
    it('should execute the fn', function (done) {
      var app = koa()
      app.use(match('/a/b', function* (next) {
        this.status = 204
      }))

      request(app.listen())
      .get('/a/b')
      .expect(204, done)
    })

    it('should populate this.params', function (done) {
      var app = koa()
      app.use(match('/:a(a)/:b(b)', function* (next) {
        this.status = 204
        assert.equal('a', this.params.a)
        assert.equal('b', this.params.b)
      }))

      request(app.listen())
      .get('/a/b')
      .expect(204, done)
    })
  })

  describe('does not match', function () {
    it('should not execute the fn', function (done) {
      var app = koa()
      app.use(match('/a/b', function* (next) {
        this.status = 204
      }))

      request(app.listen())
      .get('/a')
      .expect(404, done)
    })
  })
})

describe('match(path, fns...)', function () {
  it('should support multiple functions', function (done) {
    var calls = 0
    function* call(next) {
      yield* next
      this.body = String(++calls)
    }

    var app = koa()
    app.use(match('/a/b', call, call, call))

    request(app.listen())
    .get('/a/b')
    .expect(200)
    .expect('3', done)
  })

  it('should support nested functions', function (done) {
    var calls = 0
    function* call(next) {
      yield* next
      this.body = String(++calls)
    }

    var app = koa()
    app.use(match('/a/b', [call, [call, call]]))

    request(app.listen())
    .get('/a/b')
    .expect(200)
    .expect('3', done)
  })

  it('should support both multiple and nested functions', function (done) {
    var calls = 0
    function* call(next) {
      yield* next
      this.body = String(++calls)
    }

    var app = koa()
    app.use(match('/a/b', [call, [call, call]], call, [call, call]))

    request(app.listen())
    .get('/a/b')
    .expect(200)
    .expect('6', done)
  })
})
