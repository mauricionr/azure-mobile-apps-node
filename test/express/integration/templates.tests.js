var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory'),
    app, mobileApp;

describe('azure-mobile-apps.express.integration.templates', function () {
    beforeEach(function () {
        app = express();
    });

    it("should not render home page on root path if not configured", function () {
        mobileApp = mobileApps();
        app.use(mobileApp);
        return supertest(app).get("/").expect(404);
    });

    it("should render home page on root path if configured", function () {
        mobileApp = mobileApps({ homePage: true });
        app.use(mobileApp);
        return supertest(app).get("/")
            .expect(200)
            .expect(function (res) {
                expect(res.text).to.contain("successfully created");
            });
    });
});
