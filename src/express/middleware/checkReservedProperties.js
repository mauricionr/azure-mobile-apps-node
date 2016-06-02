// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/checkReservedProperties
@description The checkReservedProperties middleware ensures that objects
with reserved properties are not presented to the REST API. These properties
are stripped out by the client SDK before transmitting to the server.
*/
var errors = require('../../utilities/errors'),
    reservedProperties = ['createdat', 'updatedat', 'deleted'];

/** The module directly exports an instance of the middleware */
module.exports = function (req, res, next) {
    var properties = Object.keys(req.azureMobile.item),
        propertyName;

    for(var i = 0, l = properties.length; i < l && !propertyName; i++)
        if(reservedProperties.indexOf(properties[i].toLowerCase()) > -1)
            propertyName = properties[i]

    if(propertyName)
        next(errors.badRequest("Cannot update item with property '" + propertyName + "' as it is reserved"));
    else
        next();
};
