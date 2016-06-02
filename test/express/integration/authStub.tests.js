// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory'),
    auth = require('../../../src/auth')({ secret: 'secret' }),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.authStub', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ auth: { secret: 'secret' }, homePage: true, authStubClaims: function () { return { sub: 'test' }; } });
        app.use(mobileApp);
    });

    it('.auth/login/provider returns appropriate redirect', function () {
        return supertest(app)
            .get('/.auth/login/facebook')
            .expect(302)
            .then(function (res) {
                var envelope = JSON.parse(decodeURIComponent(res.headers.location.match(/token=(.*)/)[1])),
                    token = envelope.authenticationToken;
                expect(token).to.not.be.undefined;
                return auth.validate(token);
            });
    });

    it('.auth/login/done returns 200', function () {
        return supertest(app)
            .get('/.auth/login/done')
            .expect(200);
    });

    it('authStub tokens can be used against app', function () {
        return supertest(app)
            .get('/.auth/login/facebook')
            .expect(302)
            .then(function (res) {
                var envelope = JSON.parse(decodeURIComponent(res.headers.location.match(/token=(.*)/)[1])),
                    token = envelope.authenticationToken;

                return supertest(app)
                    .get('/')
                    .set('x-zumo-auth', token)
                    .expect(200);
            });
    });

    it('authStub uses payload set in authStubClaims configuration object', function () {
        return supertest(app)
            .get('/.auth/login/facebook')
            .expect(302)
            .then(function (res) {
                var envelope = JSON.parse(decodeURIComponent(res.headers.location.match(/token=(.*)/)[1])),
                    token = envelope.authenticationToken;
                expect(auth.decode(token).id).to.equal('test');
            });
    });
});
