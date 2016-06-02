// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/parseQuery
@description Creates middleware that parses an OData query from the querystring
into a queryjs query object and attach to request object.
*/
var queries = require('../../query'),
    errors = require('../../utilities/errors');

/**
Create a new instance of the parseQuery middleware
@param {tableDefinition} table The table that is being queried
*/
module.exports = function (table) {
    return function (req, res, next) {
        var context = req.azureMobile;

        context.table = table;

        if(req.params.id) {
            context.id = req.params.id || context.id;
            context.query = queries.create(table.containerName).where({ id: context.id });
            context.query.id = context.id;
            context.query.single = true;
        } else {
            enforceMaxTop();
            context.query = queries.fromRequest(req);
        }

        if(req.query.__includeDeleted)
            context.query.includeDeleted = true;

        var etag = req.get('if-match');
        if(etag)
            context.version = etag;

        // set take to the min of $top and pageSize, can be overridden in server middleware
        context.query = context.query.take(Math.min(table.pageSize, req.query.$top));

        next();

        function enforceMaxTop() {
            if(table.maxTop) {
                var top = req.query.$top;

                if(top > table.maxTop)
                    throw errors.badRequest("You cannot request more than " + table.maxTop + " records");

                if(!top)
                    req.query.$top = table.maxTop
            }
        }
    };
};
