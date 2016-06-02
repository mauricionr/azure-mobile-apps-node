// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/eTag
@description Creates middleware that extracts the current item's version and
adds an HTTP response header called 'ETag' containing the version value.
*/
var getEtagFromVersion = require('../../utilities/strings').getEtagFromVersion;

/** The module directly exports an instance of the middleware */
module.exports = function (req, res, next) {
    var result = res.results && (res.results.constructor === Array && res.results[0]) || res.results;
    if (result && result.version) {
        res.set('ETag', getEtagFromVersion(result.version));
    }
    next();
};
