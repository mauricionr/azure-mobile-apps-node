// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var eTag = require('../../../src/express/middleware/eTag'),
    expect = require('chai').expect,
    req = {},
    res;

describe('azure-mobile-apps.express.middleware.eTag', function () {
    beforeEach(function () {
        res = {
            headers: { },
            set: function (key, value) {
                this.headers[key] = value;
            }
        };
    });

    it('does not add eTag if no results', function () {
        eTag(req, res, function () {
            expect(res.headers).to.not.have.property('ETag');
        });
    });

    it('does not add eTag if no results version', function () {
        res.results = { id: 1 };
        eTag(req, res, function () {
            expect(res.headers).to.not.have.property('ETag');
        });
    });

    it('adds eTag with version of results', function () {
        res.results = { id: 1, version: 'version' };
        eTag(req, res, function () {
            expect(res.headers).to.have.property('ETag', '"version"');
        });
    });

    it('escapes quotes', function () {
        res.results = { id: 1, version: 'versi"on' };
        eTag(req, res, function () {
            expect(res.headers).to.have.property('ETag', '"versi\\"on"');
        });
    });
});
