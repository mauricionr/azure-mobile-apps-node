// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var executeOperation = require('../../../src/express/middleware/executeOperation'),
    promises = require('../../../src/utilities/promises'),
    data = require('../../../src/data/memory')({ 'table': { '1': { id: 1, value: 'test' } } }),
    expect = require('chai').expect,
    req = { method: 'get', azureMobile: { data: data, table: { name: 'table' } } };

describe('azure-mobile-apps.express.middleware.executeOperation', function() {
    it('sets results when no operation is provided', function () {
        var res = {};
        executeOperation({})(req, res, function () {
            expect(res.results).to.not.be.undefined;
        })
    });

    it('sets results when operation is provided that returns a value directly', function () {
        var res = {};
        executeOperation({
            get: function () { return 'results'; }
        })(req, res, function () {
            expect(res.results).to.equal('results');
        })
    });

    it('sets results when operation is provided that returns a value through a promise', function () {
        var res = {};
        executeOperation({
            get: function () { return promises.resolved('results'); }
        })(req, res, function () {
            expect(res.results).to.equal('results');
        })
    });
})
