// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    bodyParser = require('body-parser'),
    mobileApps = require('../../../appFactory').ignoreEnvironment,

    app, mobileApp;

// the default configuration uses the in-memory data provider - it does not (yet) support queries
// in fact, some of these now rely on the memory provider, otherwise there are conflicts
// this should be cleaned up to match other integration tests, i.e. use proper provider, clean up table after each test
describe('azure-mobile-apps.express.integration.tables.behavior', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ data: { provider: 'memory' } });
    });

    it('returns 200 for table route', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(200);
    });

    it('returns 200 for table route with id parameter', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        supertest(app)
            .get('/tables/todoitem/id')
            .expect(200);
    });

    it('returns 404 for tables that are not registered', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem2')
            .expect(404);
    });

    it('returns 500 with error details when exception is thrown', function (done) {
        var table = mobileApp.table();
        table.read.use(function (req, res, next) { throw 'test'; });
        mobileApp = mobileApps({ debug: true });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        supertest(app)
            .get('/tables/todoitem')
            .expect(500)
            .end(function (err, res) {
                expect(res.body).to.deep.equal({"error":"test"});
                done();
            });
    });

    it('returns 400 when request size limit is exceeded', function () {
        mobileApp = mobileApps({ maxTop: 1000, data: { provider: 'memory' } });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem?$top=1001')
            .expect(400);
    });

    it('returns 200 when request size limit is set to 0', function () {
        mobileApp = mobileApps({ maxTop: 0, data: { provider: 'memory' } });
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem?$top=1000000')
            .expect(200);
    });

    it('sets request size limit implicitly (query.take) to pageSize', function () {
        var table, query;

        mobileApp = mobileApps({ pageSize: 40, skipVersionCheck: true, data: { provider: 'memory' } });
        table = mobileApp.table();
        table.read(function (context) {
            query = context.query.toOData();
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(function (err, res) {
                expect(query).to.contain('$top=40');
            });
    });

    it('returns 405 for disabled operations', function () {
        mobileApp.tables.add('todoitem', { read: { disable: true }});
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(405);
    });

    it('accepts ID on querystring for patch request', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send({ id: 1, text: 'test' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .patch('/tables/todoitem/1')
                    .send({ text: 'test2' })
                    .expect(200);
            })
            .then(function () {
                return supertest(app)
                    .get('/tables/todoitem')
                    .expect(function (res) {
                        expect(res.body.length).to.equal(1);
                        expect(res.body[0].text).to.equal('test2');
                    })
            });
    });

    it('returns 400 if item ID and querystring ID do not match', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send({ id: 1, text: 'test' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .patch('/tables/todoitem/2')
                    .send({ id: 1, text: 'test2' })
                    .expect(400);
            })
    });

    it('returns 400 if invalid json', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send('{ "id": 1,, "text": "test" }')
            .set('Content-Type', 'application/json')
            .expect(400);
    });

    it('treats content as json if falsey content-type', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send('{ "id": 1, "text": "test" }')
            .set('Content-Type', '')
            .expect(201)
            .then(function (res) {
                expect(res.body.id).to.equal(1);
            });
    });

    it('passes through non-json content-type', function () {
        var table = mobileApp.table();

        table.use(function (req, res, next) {
            var options = { type: function () { return true; }};
            bodyParser.text(options)(req, res, function (error) {
                req.azureMobile.item = req.body;
                next(error);
            });
        }, table.operation);

        table.insert(function (context) {
            return { id: 1, text: context.item }
        });

        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send('text')
            .set('Content-Type', 'text')
            .expect(201)
            .then(function (res) {
                expect(res.body.text).to.equal('text');
            });
    });

    it('handles content-type with charset', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send('{ "id": 1, "text": "test" }')
            .set('Content-Type', 'application/json; charset=utf-8')
            .expect(201);
    });

    it('content-type header is not case sensitive', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send('{ "id": 1, "text": "test" }')
            .set('ConTent-Type', 'application/json')
            .expect(201);
    })

    it('adds all settings to context object', function () {
        var table = mobileApp.table();

        table.read(function (context) {
            return Object.keys(context);
        });

        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(200)
            .then(function (res) {
                expect(res.body).to.deep.equal([
                    'req',
                    'res',
                    'data',
                    'push',
                    'configuration',
                    'logger',
                    'tables',
                    'table',
                    'query',
                    'execute'
                ]);
            });
    });

    it('terminates table middleware execution if response is sent directly', function () {
        var table = mobileApp.table(),
            nextMiddlewareExecuted = false;

        table.read(function (context) {
            context.res.status(202).end()
        });

        table.read.use(table.operation, function (req, res, next) {
            nextMiddlewareExecuted = true
            next()
        })

        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(function (res) {
                expect(nextMiddlewareExecuted).to.be.false;
            });
    });

    it('returns 400 on insert if reserved properties are contained in item', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send({ createdAt: new Date() })
            .expect(400);
    });

    it('returns 400 on update if reserved properties are contained in item', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .patch('/tables/todoitem')
            .send({ updatedAt: new Date() })
            .expect(400);
    });

    it('reserved properties are not case sensitive', function () {
        mobileApp.tables.add('todoitem');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/todoitem')
            .send({ CReatedAT: new Date() })
            .expect(400);
    });
});
