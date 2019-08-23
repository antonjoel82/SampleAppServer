const es = require('elasticsearch');
const ESHelpers = require('./elasticsearch-helpers.js');
const { QueryStringQuery } = require('./querystring-query-builder.js');

const {
  ELASTICSEARCH_SELECT_ALL_LIMIT,
  ELASTICSEARCH_DEFAULT_DOC_TYPE,
  ELASTICSEARCH_PING_TIMEOUT
} = require('../constants.js');

const esClient = new es.Client({
  host: 'localhost:9200'
  // ,log: 'trace'
});

function ping () {
  return esClient.ping({ requestTimeout: ELASTICSEARCH_PING_TIMEOUT });
}

function createBlankIndex (name) {
  return esClient.indices.create({ index: name });
}

function createIndex (indexName, settings) {
  return esClient.indices.create({
    index: indexName,
    body: settings
  }).then((res) => {
    return res.acknowledged;
  });
}

function deleteIndex (name) {
  return esClient.indices.delete({ index: name });
}

function doesIndexExist (name) {
  return esClient.indices.exists({ index: name });
}

function initMapping (indexName, settings) {
  return esClient.indices.putMapping({
    index: indexName,
    body: settings
  });
}

function createDocument (indexName, id, payload, docType = ELASTICSEARCH_DEFAULT_DOC_TYPE) {
  return esClient.create({
    index: indexName,
    type: docType,
    id: id,
    body: payload
  });
}

/**
 * Adds an array of documents to add to the index
 * @param {String} indexName
 * @param {Array} payloadArr Array of Objects to be added to the specified index
 * @param {String} shouldRefresh tells the index how to handle refreshes. Primarily used for testing.
 * @param {String} docType defaults to "_doc"
 */
function bulkCreate (indexName, payloadArr, shouldRefresh = 'false', docType = ELASTICSEARCH_DEFAULT_DOC_TYPE) {
  return esClient.bulk({
    index: indexName,
    type: docType,
    refresh: shouldRefresh,
    body: ESHelpers.prepareBulkReqFromArr(payloadArr)
  });
}

function updateDocument (indexName, _id, payload, docType = ELASTICSEARCH_DEFAULT_DOC_TYPE) {
  return esClient.update({
    index: indexName,
    type: docType,
    _id: _id,
    body: payload
  });
}

function getDocument (indexName, id, docType = ELASTICSEARCH_DEFAULT_DOC_TYPE) {
  return esClient.get({
    index: indexName,
    type: docType,
    id: id
  }).then((res) => {
    // return the actual document for easier access.
    return res._source;
  });
}

function search (objectType, operator, ...searchStrs) {
  const qb = QueryStringQuery(objectType);
  qb.setOperator(operator)
    .setQueryStrings(searchStrs);

  return _search(qb);
}

function _search (queryStringQuery) {
  return esClient.search({
    index: queryStringQuery.getIndexName(),
    type: queryStringQuery.getDocType(),
    body: queryStringQuery.buildQuery()
  }).then((res) => {
    return res.hits;
  });
}

function getAllDocuments (indexName, docType = ELASTICSEARCH_DEFAULT_DOC_TYPE, limit = ELASTICSEARCH_SELECT_ALL_LIMIT) {
  return esClient.search({
    index: indexName,
    type: docType,
    body: {
      size: limit,
      query: {
        match_all: {}
      }
    }
  }).then((res) => {
    return res.hits;
  });
}

function countAllDocuments (indexName, docType = ELASTICSEARCH_DEFAULT_DOC_TYPE) {
  return esClient.count({
    index: indexName,
    type: docType
  });
}

module.exports = {
  ping,
  createBlankIndex,
  deleteIndex,
  doesIndexExist,
  initMapping,
  createIndex,
  createDocument,
  bulkCreate,
  updateDocument,
  getDocument,
  search,
  getAllDocuments,
  countAllDocuments
};
