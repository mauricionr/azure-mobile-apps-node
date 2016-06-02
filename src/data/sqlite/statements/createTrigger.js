// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var helpers = require('../helpers');

module.exports = function (tableConfig) {
    var tableName = helpers.formatTableName(tableConfig);
    return {
        sql: "CREATE TRIGGER [TR_" + tableConfig.name + "] UPDATE ON " + tableName + " BEGIN UPDATE " + tableName + " SET [updatedAt] = (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), [version] = OLD.[version] + 1 WHERE " + tableName + ".[id] = NEW.[id]; END;"
    }
}
