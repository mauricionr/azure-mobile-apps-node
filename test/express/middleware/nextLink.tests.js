// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var nextLink = require('../../../src/express/middleware/nextLink'),
    queries = require('../../../src/query'),
    expect = require('chai').expect,
    req, res;

describe('azure-mobile-apps.express.middleware.nextLink', function () {
    beforeEach(function () {
        req = { 
            protocol: 'http', hostname: 'host.com', path: 'tables/table', 
            query: { $top: 3 },
            azureMobile: { query: queries.create('table').take(2) }
        };
        res = {
            results: [ 1, 2 ],
            headers: { },
            set: function (key, value) {
                this.headers[key] = value;
            }
        };
    });

    it('does not create link if no query', function () {
        delete req.azureMobile.query;
        nextLink(req, res, function () {
            expect(res.headers).to.not.have.property('Link');
        });
    });

    it('does not create link if no results', function () {
        delete res.results;
        nextLink(req, res, function () {
            expect(res.headers).to.not.have.property('Link');
        });
    });

    it('does not create link if results.length < query.take', function () {
        req.azureMobile.query = req.azureMobile.query.take(3);
        nextLink(req, res, function () {
            expect(res.headers).to.not.have.property('Link');
        });
    });

    it('creates link with top and skip', function () {
        nextLink(req, res, function () {
            expect(res.headers.Link).to.equal('http://host.com/tables/table?%24top=1&%24skip=2; rel=next');
        });
    });

    it('creates link if results object contains total count', function () {
        req.azureMobile.results = { results: [ 1, 2], count: 2 };
        nextLink(req, res, function () {
            expect(res.headers.Link).to.equal('http://host.com/tables/table?%24top=1&%24skip=2; rel=next');
        });
    });

    it('creates link respecting server take and skip', function () {
        req.azureMobile.query = req.azureMobile.query.skip(2).take(2);
        nextLink(req, res, function () {
            expect(res.headers.Link).to.equal('http://host.com/tables/table?%24top=1&%24skip=4; rel=next');
        });
    });

    it('creates link with other query parameters', function () {
        req.protocol = 'https';
        req.hostname = 'other.net';
        req.path = 'other/table';
        req.query.otherQueryParam = 'other';
        nextLink(req, res, function () {
            expect(res.headers.Link).to.equal('https://other.net/other/table?%24top=1&otherQueryParam=other&%24skip=2; rel=next');
        });
    });

    describe('createNextLink', function () {
        it('generates correct link from req', function () {
            var req = {
                protocol: 'https',
                hostname: 'host.net',
                path: 'tables/table',
                query: {
                    "zumo-api-version": '2.0.0',
                    $filter: 'filters',
                    $orderby: 'ordering',
                    $skip: 'skip',
                    $top: 'take',
                    $select: 'selections',
                    $inlinecount: 'allpages'
                }
            };

            var link = nextLink.createLinkHeader(req, 4, 10);
            expect(link).to.equal('https://host.net/tables/table?zumo-api-version=2.0.0&%24filter=filters&%24orderby=ordering&%24skip=10&%24top=4&%24select=selections&%24inlinecount=allpages; rel=next');
        });
    });
});