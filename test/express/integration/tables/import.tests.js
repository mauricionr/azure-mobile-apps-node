// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    request = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),

    app, mobileApp;

    app = express();
    mobileApp = mobileApps();
    mobileApp.api.import('express/files/tables');
    app.use(mobileApp);

describe('azure-mobile-apps.express.integration.tables.import', function () {
    it('handles multiple import calls correctly', function () {
        app = express();
        mobileApp = mobileApps();
        mobileApp.tables.import('express/files/tables');
        app.use(mobileApp);

        app = express();
        mobileApp = mobileApps();
        mobileApp.tables.import('express/files/tables');
        app.use(mobileApp);

        return request(app)
            .get('/tables/count')
            .expect(200)
            .then(function (response) {
                expect(response.body.count).to.equal(1);
            });
    });
});
