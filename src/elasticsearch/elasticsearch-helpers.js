const { ObjectTypes } = require('../enum.js');
const { ELASTICSEARCH_DEFAULT_DOC_TYPE } = require('../constants.js');

function prepareBulkReqFromArr (arr) {
  let reqStr = '';
  arr.forEach(element => {
    reqStr += `{"create":{"_id":"${element.id}"}}\n`;
    element.id = undefined; // ensure no id field is indexed on the doc itself
    reqStr += JSON.stringify(element) + '\n';
  });

  // console.debug('Bulk Request String: ', reqStr);
  return reqStr;
}

const INDEX_SEARCH_MAPPINGS = {};
INDEX_SEARCH_MAPPINGS[ObjectTypes.Tag] = {
  indexName: 'tags',
  defaultField: 'label',
  searchFields: ['label', 'summary'],
  docType: ELASTICSEARCH_DEFAULT_DOC_TYPE
};

INDEX_SEARCH_MAPPINGS[ObjectTypes.Resource] = {
  indexName: 'resources',
  defaultField: 'tags',
  searchFields: ['tags', 'title', 'summary'],
  docType: ELASTICSEARCH_DEFAULT_DOC_TYPE
};

INDEX_SEARCH_MAPPINGS[ObjectTypes.Test] = {
  indexName: 'testndx',
  defaultField: 'label',
  searchFields: ['label', 'summary'],
  docType: ELASTICSEARCH_DEFAULT_DOC_TYPE
};

module.exports = {
  prepareBulkReqFromArr,
  INDEX_SEARCH_MAPPINGS
};
