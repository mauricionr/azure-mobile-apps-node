// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var sinon = require('sinon'),
    sinonPromised = require('sinon-as-promised'),
    expect = require('chai')
        .use(require('sinon-chai'))
        .expect,
    request = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory').ignoreEnvironment,
    nhStub, notifFactoryStub, app, installation;


var notificationMiddleware = require('../../../src/express/middleware/notifications');

describe('azure-mobile-apps.express.integration.notifications', function () {    
    beforeEach(function () {
        installation = createInstallation();

        nhStub = createNHClientStub();

        app = express();
        app.use('/push/installations', notificationMiddleware(mobileApps({ notifications: { client: nhStub }}).configuration));
    });

    it('returns 204 on successful creation', function () {
        return request(app)
            .put('/push/installations/' + installation.installationId)
            .type('json')
            .send(JSON.stringify(installation))
            .expect(204)
            .then(function (res) {
                expect(nhStub.createOrUpdateInstallation).to.be.calledWith(installation);
            });
    });

    it('returns 400 and message on error', function () {
        installation.installationId = 'errorMessage';
        return request(app)
            .put('/push/installations/' + installation.installationId)
            .type('json')
            .send(JSON.stringify(installation))
            .expect(400)
            .then(function (res) {
                expect(nhStub.createOrUpdateInstallation).to.be.calledWith(installation);
                expect(res.error.text).to.equal('errorMessage');
            });
    });

    it('returns 400 and bad request message for unspecified error', function () {
        installation.installationId = 'error';
        return request(app)
            .put('/push/installations/' + installation.installationId)
            .type('json')
            .send(JSON.stringify(installation))
            .expect(400)
            .then(function (res) {
                expect(nhStub.createOrUpdateInstallation).to.be.calledWith(installation);
                expect(res.error.text).to.equal('Bad Request');
            });
    });

    it('strips all tags from installation', function () {
        installation.tags = [ 'tag' ];
        installation.templates.temp1.tags = [ 'tempTag' ];
        installation.secondaryTiles.tile1.tags = [ 'tileTag' ];
        installation.secondaryTiles.tile1.templates.tileTemp.tags = [ 'tileTempTag' ];
        return request(app)
            .put('/push/installations/' + installation.installationId)
            .type('json')
            .send(JSON.stringify(installation))
            .expect(204)
            .then(function (res) {
                expect(nhStub.createOrUpdateInstallation).to.be.calledWith(createInstallation());
            });
    })

    it('returns 204 on successful deletion', function () {
        return request(app)
            .delete('/push/installations/' + installation.installationId)
            .expect(204)
            .then(function (res) {
                expect(nhStub.deleteInstallation).to.be.calledWith(installation.installationId);
            });
    });

    function createNHClientStub () {
        var stub = {};
        stub.createOrUpdateInstallation = sinon.stub().yields(undefined, 'ok');
        stub.createOrUpdateInstallation.withArgs(sinon.match({ installationId: 'errorMessage'}))
                .throws({ message: 'errorMessage' });
        stub.createOrUpdateInstallation.withArgs(sinon.match({ installationId: 'error'}))
                .throws({});

        stub.deleteInstallation = sinon.stub().yields(undefined, 'ok');

        stub.listRegistrationsByTag = sinon.stub().yields(undefined, []);
        stub.listRegistrationsByTag.withArgs('$InstallationId:{tags}')
                .onCall(0).yields(undefined, [{ Tag: 'tag1' }, { Tag: 'tag2'} ]);

        return stub;
    }

    function createInstallation () {
        return {
            installationId: 'id',
            pushChannel: 'channel',
            platform: 'wns',
            templates: {
                temp1: {
                    headers: {
                        header: 'header'
                    },
                    body: 'body'
                }
            },
            secondaryTiles: {
                tile1: {
                    pushChannel: 'tileChannel',
                    templates: {
                        tileTemp: {
                            headers: {
                                header: 'header'
                            },
                            body: 'body'
                        }
                    }
                }
            },
            tags: []
        };
    }
});
