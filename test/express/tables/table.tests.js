// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var tableFactory = require('../../../src/express/tables/table'),
    executeOperation = require('../../../src/express/middleware/executeOperation'),
    tableRouter = require('../../../src/express/tables/tableRouter'),
    expect = require('chai').expect,
    express = require('express');

describe('azure-mobile-apps.express.tables.table', function () {
    it('generates specified middleware stack for overall execution', function () {
        var table = tableFactory();
        table.use(testMiddleware);
        table.use(testMiddleware);
        var result = tableRouter(table);

        expect(result.length).to.equal(2);
        expect(result[0]).to.equal(testMiddleware);
        expect(result[1]).to.equal(testMiddleware);
    });

    it('generates default middleware stack for overall execution', function () {
        var stack = tableRouter(tableFactory());
        expect(stack.length).to.equal(1);
        expect(stack[0].handle).to.equal(express.Router().handle);
        expect(stack[0].stack.length).to.equal(8);
        expect(stack[0].stack[0].route.stack.length).to.equal(3);
    });

    it('generates middleware stack for individual operations', function () {
        var table = tableFactory();
        table.read.use(testMiddleware);
        table.read.use(testMiddleware);

        var stack = tableRouter(table);
        expect(stack[0].stack[0].route.stack.length).to.equal(4);
        expect(stack[0].stack[0].route.stack[1].handle).to.equal(testMiddleware);
        expect(stack[0].stack[0].route.stack[2].handle).to.equal(testMiddleware);
    });

    it('generates default middleware stack for individual operations', function () {
        var stack = tableRouter(tableFactory());
        expect(stack[0].stack[0].route.stack.length).to.equal(3);
        expect(stack[0].stack[0].route.stack[1].handle.constructor).to.equal(Function); // used to test against executeOperation, no longer possible
    });

    it('preserves pre-configured operation settings', function () {
        var table = tableFactory({ read: { property: true }});
        expect(table.read).to.have.property('property', true);
    });
    
    it('allows chaining of configuration functions', function () {
        tableFactory().use(function () {}).use(function () {}).read(function () {}).use(function () {});        
    })

    function testMiddleware(req, res, next) { }
});
