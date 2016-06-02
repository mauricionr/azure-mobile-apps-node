// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/nextLink
@description Creates middleware that adds a HTTP response header called "Link"
that contains a URL to retrieve the next page of data.
*/
var queries = require('../../query'),
    assign = require('../../utilities/assign'),
    formatUrl = require('url').format;

/** The module directly exports an instance of the middleware */
var nextLink = module.exports = function (req, res, next) {
    if (req.azureMobile.query && res.results) {
        // res.results is default, res.results.results if total count requested
        var results = res.results.results || res.results,
            query = queries.toOData(req.azureMobile.query);

        // Add link if requested $top was more than result count AND
        // if query.take (equal to table.pageSize or overridden by server middleware) is equal to result count
        if (req.query.$top > results.length && results.length === query.take) {
            var skip = (query.skip || 0) + results.length,
                top = req.query.$top - results.length;
            res.set('Link', nextLink.createLinkHeader(req, top, skip));
        }
    }
    next();
}

nextLink.createLinkHeader = function (req, take, skip) {
    var urlObj = {
        protocol: req.protocol,
        hostname: req.hostname,
        pathname: req.path,
        query: assign(req.query, { $top: take, $skip: skip })
    };

    var formattedUrl = formatUrl(urlObj);

    return formattedUrl + '; rel=next';
}
