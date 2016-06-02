// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var merge = require('../../utilities/assign'),
    path = require('path');

module.exports = function (configuration, filePath) {
    filePath = filePath || path.resolve(configuration.basePath, configuration.configFile);
    try {
        return merge(configuration, require(filePath));
    } catch(ex) {
        return configuration;
    }
}
