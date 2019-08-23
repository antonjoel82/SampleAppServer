const { QueryStringOperators } = require('../enum.js');
const { INDEX_SEARCH_MAPPINGS } = require('./elasticsearch-helpers.js');

function QueryStringQuery (objectType) {
  if (!objectType) {
    throw new Error('Must supply an ObjectType to QueryStringQuery.');
  }
  if (!INDEX_SEARCH_MAPPINGS[objectType]) {
    throw new Error('Must supply a valid ObjectType to QueryStringQuery.');
  }

  // Lookup basic index details by objectType
  const { indexName, defaultField, searchFields, docType } = INDEX_SEARCH_MAPPINGS[objectType];

  this.index = indexName;
  this.defaultField = defaultField;
  this.fields = searchFields;
  this.queryStrings = null;
  this.operator = QueryStringOperators.Default;
  this.docType = docType;

  this.getIndexName = function () {
    return this.index;
  };

  this.setQueryStrings = function (...queryStrings) {
    this.queryStrings = queryStrings || this.queryStrings;
    return this;
  };

  this.getQueryStrings = function () {
    return this.queryStrings;
  };

  this.setFields = function (...fields) {
    this.fields = fields || this.fields;
    return this;
  };

  this.getFields = function () {
    return this.fields;
  };

  this.setDefaultField = function (defaultField) {
    this.defaultField = defaultField || this.defaultField;
    return this;
  };

  this.getDefaultField = function () {
    return this.defaultField;
  };

  this.setOperator = function (operator) {
    this.operator = operator || this.operator;
    return this;
  };

  this.getOperator = function () {
    return this.operator;
  };

  this.setDocType = function (docType) {
    this.docType = docType || this.docType;
    return this;
  };

  this.getDocType = function () {
    return this.docType;
  };

  this.buildQuery = function () {
    if (!this.getQueryStrings() || this.getQueryStrings().length === 0) {
      throw new Error('Must supply query strings in order to build a query.');
    }

    let queryCond = '';
    for (let i = 0; i < this.queryStrings.length; i++) {
      queryCond += `(${this.queryStrings[i]})`;

      // append operator if not the last string
      if (i !== this.queryStrings.length - 1) {
        queryCond += ` ${this.operator} `;
      }
    }

    return { query: { query_string: { query: queryCond, fields: this.fields } } };
  };

  this.buildQueryString = function () {
    return JSON.stringify(this.buildQuery());
  };

  return this;
}

module.exports = {
  QueryStringQuery
};
