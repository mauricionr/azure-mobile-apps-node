// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

module.exports = function (claims) {
    if(claims.constructor !== Array)
        claims = [claims];

    return claims.reduce(function (target, identity) {
        identity.claims = identity.user_claims.reduce(mapClaims, {});
        target[identity['provider_name']] = identity;
        return target;
    }, {});

    function mapClaims(target, claim) {
        setDefaults(target, claim.typ, claim.val);
        setClaim(target, claim.typ, claim.val);
        if (claim.typ.indexOf('http://schemas.xmlsoap.org/ws') !== -1)
            setClaim(target, claim.typ.slice(claim.typ.lastIndexOf('/') + 1), claim.val);
        return target;
    }

    function setDefaults(target, type, value) {
        if(type === 'groups') {
            if(target[type] === undefined)
                target[type] = [];
        }
    }

    function setClaim(target, type, value) {
        var existingValue = target[type];
        if(existingValue === undefined || existingValue === null)
            target[type] = value;
        else if (existingValue.constructor === Array)
            existingValue.push(value);
        else
            target[type] = [existingValue, value];
    }

};
