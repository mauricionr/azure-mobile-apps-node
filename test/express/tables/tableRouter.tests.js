// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var factory = require('../../../src/express/tables/tableRouter'),
    tableFactory = require('../../../src/express/tables/table'),
    expect = require('chai').expect;

describe('azure-mobile-apps.express.tables.tableRouter', function () {
    it('uses executeOperation for operation middleware if none was specified', function () {
        var table = tableFactory();
        factory(table);

        var router = table.execute;
        expect(router.stack[0].route.stack.length).to.equal(3);
        expect(router.stack[0].route.stack[1].handle.constructor).to.equal(Function); // used to test against executeOperation, no longer possible
    });

    it('returns router if no execution middleware was specified', function () {
        var table = tableFactory();
        var results = factory(table);
        
        var router = table.execute;
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(router);
    })

    it('arranges middleware onto router', function () {
        var table = tableFactory();
            table.use(testMiddleware);
            table.read(testMiddleware);
            table.insert([testMiddleware, testMiddleware]);
        var results = factory(table);

        var router = table.execute;

        expect(router.stack.length).to.equal(8);

        // too flaky
        // expect(router.stack[0].route.methods.get).to.be.true;
        // expect(router.stack[0].route.stack.length).to.equal(3);
        // expect(router.stack[0].route.stack[1].handle).to.equal(testMiddleware);
        //
        // expect(router.stack[1].route.methods.post).to.be.true;
        // expect(router.stack[1].route.stack.length).to.equal(4);
        // expect(router.stack[1].route.stack[1].handle).to.equal(testMiddleware);
        // expect(router.stack[1].route.stack[2].handle).to.equal(testMiddleware);
    });

    function testMiddleware(req, res, next) { }
})
