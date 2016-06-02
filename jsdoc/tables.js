// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@typedef tableDefinition
@description Specifies options for table access
@property {boolean} authorize=false - Execute the {@link module:azure-mobile-apps/src/express/middleware/authorize authorize middleware} for each table operation
@property {boolean} autoIncrement=false - Automatically increment the id column on each insert
@property {boolean} dynamicSchema=true - Dynamically create table schema
@property {string} name - Name of the table
@property {object} columns - Object containing column definitions; property key defines the column name, the value should be one of 'number', 'string', 'boolean' or 'datetime'
@property {string} schema=dbo - SQL Server schema name to use for the table
@property {string} [databaseTableName] - The name of the database table to use. If unspecified, the name property is used
@property {integer} maxTop - Limit the maximum number of rows a client can request
@property {boolean} softDelete=false Turn on soft deletion for the table
*/
