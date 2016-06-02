// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var statements = require('./statements'),
    execute = require('./execute'),
    dynamicSchema = require('./dynamicSchema'),
    schema = require('./schema'),
    log = require('../../logger'),
    assert = require('../../utilities/assert').argument,
    queries = require('../../query'),
    uuid = require('node-uuid');

module.exports = function (configuration) {
    assert(configuration, 'Data configuration was not provided.');
    assert(configuration.server, 'A database server was not specified.');
    assert(configuration.user, 'A database user was not specified.');
    assert(configuration.password, 'A password for the database user was not specified');

    setEncryption();

    var tableAccess = function (table) {
        assert(table, 'A table was not specified');

        // set execute functions based on dynamic schema and operation
        var read, update, insert;
        if (table.dynamicSchema !== false) {
            read = dynamicSchema(table).read;
            update = insert = dynamicSchema(table).execute;
        } else {
            read = update = insert = execute;
        }

        return {
            read: function (query) {
                query = query || queries.create(table.containerName);
                return read(configuration, statements.read(query, table));
            },
            update: function (item, query) {
                assert(item, 'An item to update was not provided');
                return update(configuration, statements.update(table, item, query), item);
            },
            insert: function (item) {
                assert(item, 'An item to insert was not provided');
                item.id = item.id || uuid.v4();
                return insert(configuration, statements.insert(table, item), item);
            },
            delete: function (query, version) {
                assert(query, 'The delete query was not provided');
                return execute(configuration, statements.delete(table, query, version));
            },
            undelete: function (query, version) {
                assert(query, 'The undelete query was not provided');
                return execute(configuration, statements.undelete(table, query, version));
            },
            truncate: function () {
                return execute(configuration, statements.truncate(table));
            },
            initialize: function () {
                return schema(configuration).initialize(table).catch(function (error) {
                    log.error('Error occurred during table initialization', error);
                    throw error;
                });
            },
            schema: function () {
                return schema(configuration).get(table);
            }
        };
    };

    // expose a method to allow direct execution if SQL queries
    tableAccess.execute = function (statement) {
        assert(statement, 'A SQL statement was not provided');
        return execute(configuration, statement);
    };

    return tableAccess;

    function setEncryption() {
        configuration.options = configuration.options || {};
        if(configuration.server.indexOf('database.windows.net') > -1) {
            log.verbose('SQL Azure database detected - setting connection encryption');
            configuration.options.encrypt = true;
        }
    }
};
