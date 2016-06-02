// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
﻿var expect = require('chai').expect,
    tableFactory = require('../../../src/express/tables/table')
    tables = require('../../../src/express/tables');

describe('azure-mobile-apps.express.tables', function() {
    it("imports table configuration for file", function () {
        var config = tables({ basePath: __dirname });
        config.import('../files/tables/table1');
        expect(config.configuration.table1).to.not.be.undefined;
    });

    it("imports table configuration for empty file", function () {
        var config = tables({ basePath: __dirname });
        config.import('../files/tables/empty');
        expect(config.configuration.empty).to.not.be.undefined;
    });

    it('loads table with json config', function () {
        var config = tables({ basePath: __dirname });
        config.import('../files/tables/tableconfig');

        expect(config.configuration).to.have.property('jsontable');
        var tableConfig = config.configuration.jsontable;

        expect(tableConfig).to.have.property('name', 'jsontable');
        expect(tableConfig).to.have.property('containerName', 'databasejsontable');
        expect(tableConfig).to.have.property('softDelete', true);
        expect(tableConfig).to.have.property('schema', 'dbo');
        expect(tableConfig).to.have.property('dynamicSchema', false);
        expect(tableConfig).to.have.property('authorize', false);
        expect(tableConfig.columns).to.eql({ name: 'string', date1: 'date' });
        expect(tableConfig.indexes).to.eql([ 'name' ]);
    });

    it('adds global data settings', function () {
        var config = tables({ basePath: __dirname, data: { schema: 'schema', dynamicSchema: 'dynamicSchema' } });
        config.import('../files/tables/empty');
        expect(config.configuration.empty).to.have.property('schema', 'schema');
        expect(config.configuration.empty).to.have.property('dynamicSchema', 'dynamicSchema');
    });

    it('prioritizes table specific settings over global', function () {
        var config = tables({ basePath: __dirname, data: { schema: 'schema', dynamicSchema: 'dynamicSchema' } });
        config.import('../files/tables/tableconfig');
        expect(config.configuration.jsontable).to.have.property('schema', 'dbo');
        expect(config.configuration.jsontable).to.have.property('dynamicSchema', false);
    });

    it('correctly sets authorize and delete based on precedence', function () {
        var config = tables({});

        var table = tableFactory();

        // table level
        table.authorize = true;
        table.disable = false;

        // method level
        table.read.authorize = false;
        table.read.disable = true;

        // access level
        table.delete.access = 'authenticated'; // TF
        table.undelete.access = 'disabled'; // FT
        table.update.access = 'anonymous';  // FF

        config.add('table', table);
        table = config.configuration.table;

        // table level
        expect(table.insert).to.have.property('authorize', true);
        expect(table.insert).to.have.property('disable', false);

        // method level override
        expect(table.read).to.have.property('authorize', false);
        expect(table.read).to.have.property('disable', true);

        // authenticated override
        expect(table.delete).to.have.property('authorize', true);
        expect(table.delete).to.have.property('disable', false);

        // disabled override
        expect(table.undelete).to.have.property('authorize', false);
        expect(table.undelete).to.have.property('disable', true);

        // anonymous override
        expect(table.update).to.have.property('authorize', false);
        expect(table.update).to.have.property('disable', false);
    });
});
