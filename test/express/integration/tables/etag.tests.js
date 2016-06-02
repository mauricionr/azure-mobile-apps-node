// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory').ignoreEnvironment,

    app, mobileApp;

// the default configuration uses the in-memory data provider - it does not (yet) support queries
describe('azure-mobile-apps.express.integration.tables.etag', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ pageSize: 2, data: { provider: 'memory' } });
        var table = mobileApp.table();
        table.read(function (context) {
            return {
                id: '1', version: 'ver'
            };
        });
        mobileApp.tables.add('headers', table);
        app.use(mobileApp);
    });

    it('adds ETag header for single results', function () {
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1', version: 'ver' })
            .expect(201)
            .then(function (res) {
                // version etag because single result post
                expect(res.headers.etag).to.equal('"' + res.body.version + '"');
            });
    });

    it('adds ETag header for id reads', function () {
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1', version: 'ver' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .get('/tables/headers/1')
                    .expect(200)
                    .expect(function (res) {
                        // version etag because read id query
                        expect(res.headers.etag).to.equal('"' + res.body.version + '"');
                    });
            });
    });

    it('adds no ETag header for non id reads', function () {
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1', version: 'ver' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .get('/tables/headers')
                    .expect(200)
                    .expect(function (res) {
                        // no version etag because multiple result query
                        expect(res.headers.etag).to.contain('W/');
                    });
            });
    });
});
