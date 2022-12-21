"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.createConfig = void 0;
var createConfig = function (config) {
    var newConfig = __assign({}, config);
    Object.keys(newConfig).forEach(function (network) {
        var networkConfig = newConfig[network];
        var defaultProviders = [];
        var stringProviders = [];
        networkConfig.providers.forEach(function (provider) {
            var _a;
            if (typeof provider === "string") {
                stringProviders.push((_a = {}, _a[provider] = { name: provider }, _a));
                return;
            }
            defaultProviders.push(provider);
        });
        networkConfig.providers = Object.fromEntries(__spreadArray(__spreadArray([], defaultProviders, true), stringProviders, true).map(function (provider) { return Object.entries(provider); })
            .flat());
    });
    return newConfig;
};
exports.createConfig = createConfig;
