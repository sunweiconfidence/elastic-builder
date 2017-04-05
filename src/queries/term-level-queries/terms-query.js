'use strict';

const _ = require('lodash');

const {
    util: { checkType }
} = require('../../core');

const { Query } = require('../../core');

/**
 * Filters documents that have fields that match any of the provided terms (*not analyzed*).
 *
 * [Elasticsearch reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html)
 *
 * @extends Query
 */
class TermsQuery extends Query {

    // TODO: The DSL is a mess. Think about cleaning up some.

    /**
     * Creates an instance of `TermsQuery`.
     *
     * @param {string=} field
     * @param {Array|string|number=} values
     */
    constructor(field, values) {
        super('terms');

        // Default assume user is not insane
        this._isTermsLookup = false;
        this._termsLookupOpts = {};
        this._values = [];

        if (!_.isNil(field)) this._field = field;
        if (!_.isNil(values)) {
            if (_.isArray(values)) this.values(values);
            else this.value(values);
        }
    }

    /**
     * Private helper function to set a terms lookup option.
     *
     * @private
     * @param {string} key
     * @param {string|number} val
     */
    _setTermsLookupOpt(key, val) {
        this._isTermsLookup = true;
        this._termsLookupOpts[key] = val;
    }

    /**
     * Sets the field to search on.
     *
     * @param {string} field
     * @returns {TermsQuery} returns `this` so that calls can be chained.
     */
    field(field) {
        this._field = field;
        return this;
    }

    /**
     * Append given value to list of values to run Terms Query with.
     *
     * @param {string|number} value
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    value(value) {
        this._values.push(value);
        return this;
    }

    /**
     * Specifies the values to run query for.
     *
     * @param {Array} values Values to run query for.
     * @returns {TermsQuery} returns `this` so that calls can be chained
     * @throws {TypeError} If `values` is not an instance of Array
     */
    values(values) {
        checkType(values, Array);

        this._values = _.concat(this._values, values);
        return this;
    }

    /**
     * Convenience method for setting term lookup options.
     * Valid options are `index`, `type`, `id`, `path`and `routing`
     *
     * @param {Object} lookupOpts An object with any of the keys `index`,
     * `type`, `id`, `path` and `routing`.
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    termsLookup(lookupOpts) {
        checkType(lookupOpts, Object);

        this._isTermsLookup = true;
        Object.assign(this._termsLookupOpts, lookupOpts);
        return this;
    }

    /**
     * The index to fetch the term values from. Defaults to the current index.
     *
     * @param {string} idx The index to fetch the term values from.
     * Defaults to the current index.
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    index(idx) {
        this._setTermsLookupOpt('index', idx);
        return this;
    }

    /**
     * The type to fetch the term values from.
     *
     * @param {string} type
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    type(type) {
        this._setTermsLookupOpt('type', type);
        return this;
    }

    /**
     * The id of the document to fetch the term values from.
     *
     * @param {string} id
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    id(id) {
        this._setTermsLookupOpt('id', id);
        return this;
    }

    /**
     * The field specified as path to fetch the actual values for the `terms` filter.
     *
     * @param {string} path
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    path(path) {
        this._setTermsLookupOpt('path', path);
        return this;
    }

    /**
     * A custom routing value to be used when retrieving the external terms doc.
     *
     * @param {string} routing
     * @returns {TermsQuery} returns `this` so that calls can be chained
     */
    routing(routing) {
        this._setTermsLookupOpt('routing', routing);
        return this;
    }

    /**
     * Build and returns DSL representation of the term level query class instance.
     *
     * @returns {Object} returns an Object which maps to the elasticsearch query DSL
     * @override
     */
    getDSL() {
        return {
            [this.type]: Object.assign({}, this._queryOpts, {
                [this._field]: this._isTermsLookup ? this._termsLookupOpts : this._values
            })
        };
    }
}

module.exports = TermsQuery;