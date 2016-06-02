// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest'),
    express = require('express'),
    mobileApps = require('../../../appFactory').ignoreEnvironment,
    config = require('../../../appFactory').configuration,

    app, mobileApp;

    // the default configuration uses the in-memory data provider - it does not (yet) support queries
describe('azure-mobile-apps.express.integration.tables.configuration', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps();
    });

    it('executes user code when provided', function (done) {
        var table = mobileApp.table();
        table.read(function (query, context) {
            return 'function executed';
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        supertest(app)
            .get('/tables/todoitem')
            .end(function (err, res) {
                expect(res.body.indexOf('function executed')).to.not.equal(-1);
                done();
            });
    });

    it('executes custom middleware', function (done) {
        var table = mobileApp.table(),
            value;

        table.read.use(function (req, res, next) {
            value = 'test';
            next();
        });

        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        supertest(app)
            .get('/tables/todoitem')
            .end(function (err, res) {
                expect(value).to.equal('test');
                done();
            });
    });

    it('uses custom root path', function (done) {
        mobileApp = mobileApps({ tableRootPath: '/test' });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        supertest(app)
            .get('/test/todoitem')
            .expect(200)
            .end(done);
    });
})
