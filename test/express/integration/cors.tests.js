// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory').ignoreEnvironment,
    accessControlRequestHeader = 'access-control-request-headers',
    accessControlAllowOriginHeader = 'Access-Control-Allow-Origin',
    accessControlAllowMethodsHeader = 'Access-Control-Allow-Methods',
    accessControlAllowHeadersHeader = 'Access-Control-Allow-Headers',
    accessControlExposeHeadersHeader = 'Access-Control-Expose-Headers',
    accessControlMaxAgeHeader = 'Access-Control-Max-Age',
    expectedAllowedMethods = 'GET, PUT, PATCH, POST, DELETE, OPTIONS',

    app, mobileApp;

describe('azure-mobile-apps.express.integration.cors', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({
            cors: {
                maxAge: 6000,
                hostnames: ['localhost', { host: '*.v1.com' }, 'test.*.net']
            }
        });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);
    });

    it('sets allow origin header for basic', function () {
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'http://test.blah.net')
            .expect(accessControlAllowOriginHeader, 'http://test.blah.net')
            .expect(200);
    });

    it('sets allow origin header for v1 style cors', function () {
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'https://asdf.v1.com')
            .expect(accessControlAllowOriginHeader, 'https://asdf.v1.com')
            .expect(200);
    });

    it('discards non whitelisted origin', function () {
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'http://te.blah.net')
            .expect(200)
            .then(function (response) {
                expect(response.headers[accessControlAllowOriginHeader]).to.be.undefined;
            });
    });

    it('sets headers for options', function () {
        return supertest(app)
            .options('/tables/todoitem')
            .set('origin', 'http://test.blah.net')
            .expect(accessControlAllowOriginHeader, 'http://test.blah.net')
            .expect(accessControlAllowMethodsHeader, expectedAllowedMethods)
            .expect(accessControlMaxAgeHeader, 6000)
            .expect(200);
    });

    it('sets requested headers', function () {
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'http://test.blah.net')
            .set(accessControlRequestHeader, 'list, of, headers')
            .expect(accessControlAllowOriginHeader, 'http://test.blah.net')
            .expect(accessControlAllowHeadersHeader, 'list, of, headers')
            .expect(200);
    });

    it('sets exposed headers', function () {
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'http://test.blah.net')
            .expect(accessControlExposeHeadersHeader, 'Link,Etag')
            .expect(200);
    });

    it('sets exposed headers when hosted', function () {
        app = express();
        mobileApp = mobileApps({ hosted: true });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);
        return supertest(app)
            .get('/tables/todoitem')
            .set('origin', 'http://test.blah.net')
            .expect(accessControlExposeHeadersHeader, 'Link,Etag')
            .expect(200);
    });
});
