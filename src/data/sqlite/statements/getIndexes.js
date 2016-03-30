// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers');

module.exports = function (tableConfig) {
    return {
        sql: "PRAGMA index_list(" + helpers.formatTableName(table.name) + ")"
    };
};
