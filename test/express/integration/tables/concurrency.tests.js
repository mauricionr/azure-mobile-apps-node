// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').use(require('chai-subset')).expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),
    data = require('../../../../src/data'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.tables.concurrency', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps();
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'concurrency' }));

    it('returns 409 when version columns do not match', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .patch('/tables/concurrency')
                    .send({ id: '1', value: 'test', version: 'incorrect version' })
                    .expect(409);
            })
            .then(function (res) {
                expect(res.headers.etag).to.not.be.undefined;
                expect(res.body).to.containSubset({ id: '1', value: 'test' });
                expect(res.body.version).to.not.equal('incorrect version');
            });
    });

    it('returns 412 when version does not match If-Match header', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .patch('/tables/concurrency')
                    .set('if-match', 'incorrect version')
                    .send({ id: '1', value: 'test', version: 'incorrect version' })
                    .expect(412);
            })
            .then(function (res) {
                expect(res.headers.etag).to.not.be.undefined;
                expect(res.body).to.containSubset({ id: '1', value: 'test' });
                expect(res.body.version).to.not.equal('incorrect version');
            });
    });

    it('returns 200 when version columns match', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .patch('/tables/concurrency')
                    .send({ id: '1', value: 'test', version: res.body.version })
                    .expect(200);
            });
    });

    it('returns 412 when delete is attempted with incorrect version', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/concurrency/1')
                    .set('If-Match', 'incorrect version')
                    .expect(412);
            });
    });

    it('returns 200 when delete is attempted with correct version', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/concurrency/1')
                    .set('If-Match', res.body.version)
                    .expect(200);
            });
    });

    it('returns 412 when undelete is attempted with incorrect version', function () {
        mobileApp.tables.add('concurrency', { softDelete: true });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/concurrency/1')
                    .expect(200);
            })
            .then(function (){
                return supertest(app)
                    .post('/tables/concurrency/1')
                    .set('If-Match', 'incorrect version')
                    .expect(412);
            });
    });

    it('returns 409 when inserting duplicate record', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .post('/tables/concurrency')
                    .send({ id: '1', value: 'test' })
                    .expect(409);
            });
    });

    it('does not check concurrency on delete if version is not specified', function () {
        mobileApp.tables.add('concurrency');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/concurrency')
            .send({ id: '1', value: 'test' })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/concurrency/1')
                    .expect(200);
            });
    });
});
