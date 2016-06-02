// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
module.exports = function (configuration) {
    var dataCleanUp = require('./data/' + configuration.data.provider + '/integration.cleanUp'),
        api = {
            table: function (table) {
                return dataCleanUp(configuration.data, table)
                    .then(function() {})
                    .catch(function() {});
            },
            testTable: function (table) {
                return function(done) {
                    return api.table(table).then(done);
                };
            }
        };

    return api;
}
