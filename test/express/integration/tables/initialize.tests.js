// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),
    promises = require('../../../../src/utilities/promises'),
    config = require('../../../appFactory').configuration,
    data = require('../../../../src/data'),
    
    app, mobileApp;

describe('azure-mobile-apps.express.integration.tables.initialize', function () {
    describe('basic initialization', function () {
        beforeEach(function () {
            setup({ string: 'string', number: 'number' });
        });

        afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'initialize' }));

        it('creates non-dynamic tables', function () {
            return supertest(app)
                .post('/tables/initialize')
                .send({ id: '1' })
                .expect(500)
                .then(function () {
                    return mobileApp.tables.initialize();
                })
                .then(function () {
                    return supertest(app)
                        .post('/tables/initialize')
                        .send({ id: '1' })
                        .expect(201)
                        .expect(function (res) {
                            expect(res.body.string).to.be.null;
                            expect(res.body.number).to.be.null;
                        });
                })
        });

        it('updates non-dynamic tables', function () {
            return mobileApp.tables.initialize()
                .then(function () {
                    return supertest(app)
                        .post('/tables/initialize')
                        .send({ id: '1' })
                        .expect(201)
                        .expect(function (res) {
                            expect(res.body.boolean).to.be.undefined;
                        });
                })
                .then(function () {
                    setup({ string: 'string', number: 'number', boolean: 'boolean' });
                    return mobileApp.tables.initialize();
                })
                .then(function () {
                    return supertest(app)
                        .get('/tables/initialize')
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body[0].boolean).to.be.null;
                        });
                });
        });

        function setup(columns) {
            app = express();
            mobileApp = mobileApps();
            mobileApp.tables.add('initialize', { dynamicSchema: false, columns: columns });
            app.use(mobileApp);
        }
    });

    describe('concurrent initialization', function () {
        it('successfully initializes multiple tables concurrently', function () {
            var execute  = data(config()).execute;
            
            app = express();
            mobileApp = mobileApps();

            var tables = [];
            for (var i = 0; i < 10; i++)
                tables.push(i);

            tables.forEach(create);

            // this is going to be a problem when we introduce a non-SQL data provider
            return mobileApp.tables.initialize()
                .then(function () {
                    return execute({ sql: 'drop table __types '});
                })
                // providers other than SQLite do not have this table, ignore failures
                .catch(function () {})
                .then(function () {
                    return promises.series(tables, drop);
                })

            function create(id) {
                mobileApp.tables.add('table' + id);
            }

            function drop(id) {
                return execute({ sql: 'drop table table' + id });
            }
        });
    })
});
