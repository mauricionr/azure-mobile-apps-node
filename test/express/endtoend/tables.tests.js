// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    request = require('supertest-as-promised'),
    app = require('express')(),
    mobileApp = require('../../appFactory')()
    data = require('../../../src/data'),
    config = require('../../appFactory').configuration();

describe('azure-mobile-apps.express.integration.endtoend.tables', function () {
    beforeEach(dropTable);
    afterEach(dropTable);

    mobileApp.tables.import('express/files/tables/endtoend');
    app.use(mobileApp);

    function dropTable() {
        return data(config).execute({ sql: 'drop table endtoend' }).catch(function () { });
    }

    it('import, initialise, persist and query with custom middleware and operations', function () {
        return insert({ id: '1', clientValue: 'show' })
            .then(function (res) {
                // insert middleware and operation have executed
                expect(res.body).to.containSubset({ id: '1', clientValue: 'show', insertOperation: 'insert', insertMiddleware: 'insert' });
                return insert({ id: '2', clientValue: 'noshow' });
            })
            .then(read)
            .then(function (res) {
                // read query has been augmented with { clientValue: 'show' } so it will only return the first record
                expect(res.body).to.containSubset([{ id: '1', clientValue: 'show', insertOperation: 'insert', insertMiddleware: 'insert', readOperation: 'read', readMiddleware: 'read' }]);
                return update({ id: '2', clientValue: 'show' });
            })
            .then(function (res) {
                // update middleware and operation have executed
                expect(res.body).to.containSubset({ id: '2', clientValue: 'show', insertOperation: 'insert', insertMiddleware: 'insert', updateOperation: 'update', updateMiddleware: 'update' });
                return request(app).get("/tables/endtoend?$filter=id gt '1'").set('zumo-api-version', '2.0.0').expect(200);
            })
            .then(function (res) {
                // OData query is executed and returns updated record
                expect(res.body).to.containSubset([{ id: '2', clientValue: 'show', insertOperation: 'insert', insertMiddleware: 'insert', updateOperation: 'update', updateMiddleware: 'update', readOperation: 'read', readMiddleware: 'read' }]);
            })
            .catch(convertError);
    });

    it('delete and undelete with custom middleware and operations', function () {
        return insert({ id: '1', clientValue: 'show' })
            .then(read)
            .then(function (res) {
                expect(res.body.length).to.equal(1);
                return del(1);
            })
            .then(function (res) {
                expect(res.body.deleteOperation).to.equal('delete');
                expect(res.body.deleteMiddleware).to.equal('delete');
                return read();
            })
            .then(function (res) {
                expect(res.body.length).to.equal(0);
                return undelete(1);
            })
            .then(function (res) {
                expect(res.body.undeleteOperation).to.equal('undelete');
                expect(res.body.undeleteMiddleware).to.equal('undelete');
                return read();
            })
            .then(function (res) {
                expect(res.body.length).to.equal(1);
            });
    });
});

function insert(item) {
    return request(app).post('/tables/endtoend').set('zumo-api-version', '2.0.0').send(item).expect(201);
}

function update(item) {
    return request(app).patch('/tables/endtoend').set('zumo-api-version', '2.0.0').send(item).expect(200);
}

function del(id) {
    return request(app).delete('/tables/endtoend/' + id).set('zumo-api-version', '2.0.0').expect(200);
}

function undelete(id) {
    return request(app).post('/tables/endtoend/' + id).set('zumo-api-version', '2.0.0').expect(201);
}

function read() {
     return request(app).get('/tables/endtoend').set('zumo-api-version', '2.0.0').expect(200);
}

function convertError(err) {
    if(err && err.response) {
        var body = err.response.body,
            result = body.constructor === String ? body : JSON.stringify(body);
        throw new Error(err.message + ' - ' + result);
    }
    throw err;
}
