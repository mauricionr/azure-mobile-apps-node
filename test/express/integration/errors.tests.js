// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory').ignoreEnvironment,
    app, mobileApp;

describe('azure-mobile-apps.express.integration.errors', function () {
    it('returns error details when in debug mode', function () {
        setup(true);
        return supertest(app)
            .get('/tables/todoitem')
            .expect(500)
            .then(function (res) {
                expect(res.body.error).to.equal('test');
                expect(res.body.stack).to.not.be.undefined;
            });
    });

    it('does not return stack trace when not in debug mode', function () {
        setup(false);
        return supertest(app)
            .get('/tables/todoitem')
            .expect(500)
            .then(function (res) {
                expect(res.body.error).to.equal('test');
                expect(res.body.stack).to.be.undefined;
            });
    });

    function setup(debug) {
        app = express();
        mobileApp = mobileApps({ debug: debug });
        var table = mobileApp.table();
        table.read.use(function (req, res, next) { throw new Error('test'); });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);
    }
});
