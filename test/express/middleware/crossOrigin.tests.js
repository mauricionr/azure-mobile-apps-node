// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var middleware = require('../../../src/express/middleware/crossOrigin'),
    expect = require('chai').expect,
    accessControlRequestHeader = 'access-control-request-headers',
    accessControlAllowOriginHeader = 'Access-Control-Allow-Origin',
    accessControlAllowMethodsHeader = 'Access-Control-Allow-Methods',
    accessControlAllowHeadersHeader = 'Access-Control-Allow-Headers',
    accessControlMaxAgeHeader = 'Access-Control-Max-Age',
    expectedAllowedMethods = 'GET, PUT, PATCH, POST, DELETE, OPTIONS',
    config = {
        cors: {
            maxAge: 6000,
            hostnames: ['localhost', { host: '*.v1.com' }, 'test.*.net']
        }
    },
    req = {
        method: 'GET',
        headers: { },
        get: function (key) {
            return this.headers[key];
        }
    },
    res = {
        headers: { },
        set: function (key, value) {
            this.headers[key] = value;
        }
    };

describe('azure-mobile-apps.express.middleware.crossOrigin', function () {
    beforeEach(function () {
        req.headers = {};
        req.method = 'GET';
        res.headers = {};
    });

    it("properly configures response headers", function () {
        req.headers.origin = 'https://www.v1.com';
        req.headers[accessControlRequestHeader] = 'list, of, headers';
        req.method = 'OPTIONS';

        middleware(config)(req, res, function () {
            expect(res.headers[accessControlAllowOriginHeader]).to.equal(req.headers.origin);
            expect(res.headers[accessControlAllowMethodsHeader]).to.equal(expectedAllowedMethods);
            expect(res.headers[accessControlAllowHeadersHeader]).to.equal(req.headers[accessControlRequestHeader]);
            expect(res.headers[accessControlMaxAgeHeader]).to.equal(config.cors.maxAge);
        });
    });

    it("ignores non matching request", function () {
        req.headers.origin = 'www.v2.com';

        middleware(config)(req, res, function () {
            expect(res.headers[accessControlAllowOriginHeader]).to.be.undefined;
            expect(res.headers[accessControlAllowMethodsHeader]).to.be.undefined;
            expect(res.headers[accessControlAllowHeadersHeader]).to.be.undefined;
            expect(res.headers[accessControlMaxAgeHeader]).to.be.undefined;
        });
    });
});
