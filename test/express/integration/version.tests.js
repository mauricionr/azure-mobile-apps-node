// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.version', function () {
    it('attaches server version header', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment();
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect('x-zumo-server-version', 'node-' + require('../../../package.json').version);
    });

    it('does not attach version header if version is set to undefined', function() {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ version: undefined });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(function (res) {
                expect(res.headers['x-zumo-version']).to.be.undefined;
            });
    });

    it('does not attach version header if MS_DisableVersionHeader is specified', function() {
        app = express();
        mobileApp = mobileApps({}, { MS_DisableVersionHeader: 'true' });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(function (res) {
                expect(res.headers['x-zumo-version']).to.be.undefined;
            });
    });

    it('returns 400 when appropriate api version is not specified', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(400);
    });

    it('succeeds when appropriate api version is specified in a header', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('zumo-api-version', '2.0.0')
            .expect(200);
    });

    it('api version header is case insensitive', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('ZuMo-ApI-vErSiOn', '2.0.0')
            .expect(200);
    });

    it('succeeds when appropriate api version is specified in a querystring', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem?zumo-api-version=2.0.0')
            .expect(200);
    });

    it('api version querystring is case insensitive', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem?ZuMo-ApI-vErSiOn=2.0.0')
            .expect(200);
    });

    it('ignores api version when skipVersionCheck is set in configuration', function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment();
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(200);
    });

    it('ignores api version when MS_SkipVersionCheck environment setting is specified', function () {
        app = express();
        mobileApp = mobileApps({}, { MS_SkipVersionCheck: 'true' });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(200);
    });

    it("ignores api version when doing CORS preflight", function () {
        app = express();
        mobileApp = mobileApps.ignoreEnvironment({ skipVersionCheck: false });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .options('/tables/todoitem')
            .expect(200);
    });
});
