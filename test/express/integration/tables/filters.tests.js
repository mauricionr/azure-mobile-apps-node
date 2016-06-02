// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var expect = require('chai').use(require('chai-subset')).expect,
    supertest = require('supertest-as-promised'),
    data = require('../../../../src/data'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.tables.filters', function () {
    beforeEach(function (done) {
        app = express();
        mobileApp = createMobileApp().then(function () {
            done();
        }, done);
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'filters' }));

    it('allows filters on reads', function () {
        return supertest(app)
            .get('/tables/filters')
            .expect(function (res) {
                expect(res.body.length).to.equal(2);
                expect(res.body).to.containSubset([
                    { id: '1', userId: '1' },
                    { id: '2', userId: '1' }
                ]);
            });
    });

    it('allows filters on deletes and returns a 404 when filtered', function () {
        return supertest(app)
            .delete('/tables/filters/3')
            .expect(404);
    });

    it('allows filters on deletes and behaves as normal when not filtered', function () {
        return supertest(app)
            .delete('/tables/filters/1')
            .expect(200);
    });

    it('allows filters on updates and returns a 404 when filtered', function () {
        return supertest(app)
            .patch('/tables/filters/3')
            .send({ userId: '1' })
            .expect(404);
    });

    it('allows filters on updates and behaves as normal when not filtered', function () {
        return supertest(app)
            .patch('/tables/filters/1')
            .send({ userId: '1' })
            .expect(200);
    });

    it('applies filters to results of update operations', function () {
        return supertest(app)
            .delete('/tables/filters/1')
            .expect(200)
            .then(function () {
                return supertest(app)
                    .patch('/tables/filters/1')
                    .send({ userId: '2' })
                    // this 404s because the updated record isn't selected back out after the userId is changed
                    .expect(404)
            })
            .then(function () {
                // this succeeds in the test below, so we know the above update actually succeeded
                return supertest(app)
                    .post('/tables/filters/1')
                    .expect(404)
            });
    });

    it('allows filters on deletes and behaves as normal when not filtered', function () {
        return supertest(app)
            .delete('/tables/filters/1')
            .expect(200)
            .then(function () {
                return supertest(app)
                    .post('/tables/filters/1')
                    .expect(201)
            });
    });

    function filter(context) {
        context.query.where({ userId: '1' });
        return context.execute();
    }

    function createMobileApp(operation) {
        mobileApp = mobileApps();

        var table = mobileApp.table();
        table.read(filter);
        table.update(filter);
        table.delete(filter);
        table.undelete(filter);
        table.seed = [
            { id: '1', userId: '1' },
            { id: '2', userId: '1' },
            { id: '3', userId: '2' }
        ];
        table.softDelete = true;

        mobileApp.tables.add('filters', table);
        app.use(mobileApp);
        return mobileApp.tables.initialize();
    }
});
