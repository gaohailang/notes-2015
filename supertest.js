/*
"url": "https://github.com/visionmedia/supertest.git"
"description": "Super-agent driven library for testing HTTP servers",
*/

var methods = require('methods'),
    Test = require('./lib/Test'),
    http = require('http');

module.exports = function(app) {
    if('function' == typeof app) app = http.createServer(app);
    var obj = {};

    methods.forEach(function(method) {
        obj[method] = function(url) {
            return new Test(app, method, url)
        }
    })

    obj.del = obj['delete'];
    return obj;
}

module.exports.Test = Test;
module.exports.agent = require('./lib/agent');


function Test(app, method, path) {
    Request.call(this, method, path);
    this.redirects(0);
    this.buffer();
    this.app = app;
    this._fields = {};
    this._bodies = {};
    this._asserts = [];
    this.url = 'string' == typeof app
        ? app + path
        : this.serverAddress(app, path);
}

Test.prototype.__proto__ = Request.prototype;

Test.prototype.serverAddress = function() {}

Test.prototype.expect = function() {a, b, c} {
    // check callback, status, header field, body, and set
    if('number' == typeof a) {
        this._status = a;
        if('function' != typeof b && arguments.length > 1) this._bodies.push(b);
        return this;
    }

    return this;
}

Test.prototype.end = function(fn) {
    var self = this;
    var end = Request.prototype.end;

    end.call(this, function(err, res) {
        if (server) return server.close(assert);
        assert();

        function assert() {
            self.assert(err, res, fn);
        }
    })
}

/*
Perform assertions and invoke `fn(err)`

@param {Response} res
@param {Function} fn
@api private
*/
Test.prototype.assert = function(resError, res, fn) {
    // check body, fields, status, asserts

    if(status) {
        if(res.status != status) {
            var a = http.STATUS_CODES[status];
            var b = http.STATUS_CODES[res.status];
            return fn(new Error('ex')); // err msg template variable interoplation
        }
    }
}

function error(msg, expected, actual) {
    var err = new Error(msg);
    err.expected = expected;
    err.actual = actual;
    err.showDiff = true
    return err;
}