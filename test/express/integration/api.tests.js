// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').use(require('chai-subset')).expect,
    request = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory'),
    queries = require('../../../src/query'),
    app, mobileApp;

describe('azure-mobile-apps.express.integration.api', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ data: { provider: 'memory' } });
    });

    it('exposes data access object through request object', function () {
        mobileApp.tables.add('apiTest');
        app.use(mobileApp);

        app.get('/api/test', function (req, res, next) {
            expect(req.azureMobile.tables('apiTest').read).to.be.a('function');
            res.status(200).end();
        });

        return request(app).get('/api/test').expect(200);
    });

    it('allows table operations', function () {
        mobileApp.tables.add('apiTest');
        app.use(mobileApp);

        app.get('/api/createTest', function (req, res, next) {
            req.azureMobile.tables('apiTest').insert({ id: '1', value: 'test1' }).then(function () {
                res.status(200).end();
            });
        });

        app.get('/api/getTest', function (req, res, next) {
            var query = queries.create('apiTest').where({ id: '1' });
            req.azureMobile.tables('apiTest').read(query).then(function (results) {
                res.status(200).json(results);
            });
        });

        return request(app)
            .get('/api/createTest')
            .expect(200)
            .then(function () {
                return request(app).get('/api/getTest').expect(200);
            })
            .then(function (res) {
                expect(res.body).to.containSubset([{ id: '1', value: 'test1' }]);
            });
    });

    it('attaches query operators to data access objects', function () {
        mobileApp.tables.add('apiTest');
        app.use(mobileApp);

        app.get('/api/test', function (req, res, next) {
            var table = req.azureMobile.tables('apiTest');
            table.insert({ id: '1', value: 1 })
                .then(function () {
                    return table.where({ id: '1' }).read();
                })
                .then(function (results) {
                    expect(results).to.containSubset([{ id: '1', value: 1 }]);
                    res.status(200).end();
                });
        });

        return request(app).get('/api/test').expect(200);
    })
});
