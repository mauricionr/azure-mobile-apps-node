// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').use(require('chai-subset')).expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),
    promises = require('../../../../src/utilities/promises'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.tables.dynamicSchema', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps();
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'dynamic' }));

    it('creates table and returns inserted records', function () {
        mobileApp.tables.add('dynamic');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ id: '1', string: 'test', bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .get('/tables/dynamic')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body).to.containSubset([{ id: '1', string: 'test', bool: true, number: 1 }]);
            });
    });

    it('updates table schema', function () {
        mobileApp.tables.add('dynamic');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ id: '1', string: 'one' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/dynamic')
                    .send({ id: '2', string: 'two', bool: false, number: 2 })
                    .expect(201);
            })
            .then(function () {
                return supertest(app).get('/tables/dynamic');
            })
            .then(function (res) {
                expect(res.body).to.containSubset([
                    { id: '1', string: 'one', bool: null, number: null },
                    { id: '2', string: 'two', bool: false, number: 2 }
                ]);
            });
    });

    it('creates table with numeric id and returns inserted records', function () {
        mobileApp.tables.add('dynamic');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ id: 1, string: 'test', bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .get('/tables/dynamic')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body).to.containSubset([{ id: 1, string: 'test', bool: true, number: 1 }]);
            });
    });

    it('creates table with autoIncrement id', function () {
        mobileApp.tables.add('dynamic', { autoIncrement: true });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ string: 'test', bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                expect(res.body).to.containSubset({ id: 1, string: 'test', bool: true, number: 1 });
            });
    });

    it('updates updatedAt column', function () {
        var updatedAt;

        mobileApp.tables.add('dynamic');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ id: '1', string: 'one' })
            .then(function (inserted) {
                updatedAt = inserted.body.updatedAt;
                return promises.sleep(20);
            })
            .then(function () {
                return supertest(app)
                    .patch('/tables/dynamic')
                    .send({ id: '1', string: 'two' });
            })
            .then(function (updated) {
                expect(updated.body.updatedAt).to.be.greaterThan(updatedAt);
            });
    });

    it('creates predefined columns', function () {
        mobileApp.tables.add('dynamic', { columns: {
            string: 'string',
            number: 'number',
            bool: 'boolean',
            date: 'datetime'
        } });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/dynamic')
            .send({ id: '1' })
            .then(function (inserted) {
                expect(inserted.body).to.containSubset({ id: '1', string: null, number: null, bool: null, date: null });
            });
    });
});
