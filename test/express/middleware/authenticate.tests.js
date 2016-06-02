// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var middleware = require('../../../src/express/middleware/authenticate'),
    auth = require('../../../src/auth')({ secret: 'secret' }),
    expect = require('chai').use(require('chai-subset')).expect,
    secret = 'secret', // token and secret E2E tests
    token = auth.sign({ "sub": "Facebook:someuserid@hotmail.com" }),
    config = { auth: { secret: secret } };

describe('azure-mobile-apps.express.middleware.authenticate', function () {
    it("populates context.user with validated claims", function (done) {
        var req = { get: function () { return token; } };
        middleware(config)(req, null, function () {
            try {
                expect(req.azureMobile.user).to.containSubset({
                    claims: {
                        "aud": "urn:microsoft:windows-azure:zumo",
                        "iss": "urn:microsoft:windows-azure:zumo",
                        "sub": "Facebook:someuserid@hotmail.com",
                    },
                    token: token,
                    id: "Facebook:someuserid@hotmail.com"
                });
                done();
            } catch(err) {
                done(err);
            }
        });
    });
});
