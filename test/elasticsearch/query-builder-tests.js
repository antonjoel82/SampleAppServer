const { describe, it } = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const dirtyChai = require('dirty-chai');

const { QueryStringQuery } = require('../../src/elasticsearch/querystring-query-builder.js');
const { ObjectTypes, QueryStringOperators } = require('../../src/enum.js');
const { INDEX_SEARCH_MAPPINGS } = require('../../src/elasticsearch/elasticsearch-helpers.js');

chai.use(dirtyChai);

describe('QueryString Query Building', () => {
  describe('No ObjectType parameter provided', () => {
    it('should throw an error for not passing an ObjectType', (done) => {
      expect(() => QueryStringQuery()).to.throw('Must supply an ObjectType to QueryStringQuery.');
      done();
    });
  });

  describe('Invalid ObjectType parameter provided', () => {
    it('should throw an error for not passing a valid ObjectType', (done) => {
      expect(() => QueryStringQuery('bleh')).to.throw('Must supply a valid ObjectType to QueryStringQuery.');
      done();
    });
  });

  describe('Valid ObjectType passed, no other updates', () => {
    it('should assemble a default query but throw an error upon "building"', (done) => {
      const qb = QueryStringQuery(ObjectTypes.Test);
      const mapping = INDEX_SEARCH_MAPPINGS[ObjectTypes.Test];
      expect(qb.getIndexName()).to.equal(mapping.indexName);
      expect(qb.getDocType()).to.equal(mapping.docType);
      expect(qb.getFields()).to.equal(mapping.searchFields);
      expect(qb.getOperator()).to.equal(QueryStringOperators.Default);
      expect(() => qb.buildQuery()).to.throw('Must supply query strings in order to build a query.');
      done();
    });
  });

  describe('Fully assembled query object', () => {
    it('should assemble a full query', (done) => {
      const qb = QueryStringQuery(ObjectTypes.Test)
        .setOperator(QueryStringOperators.And)
        .setQueryStrings('back', 'ba');

      const mapping = INDEX_SEARCH_MAPPINGS[ObjectTypes.Test];
      expect(qb.getIndexName()).to.equal(mapping.indexName);
      expect(qb.getDocType()).to.equal(mapping.docType);
      expect(qb.getFields()).to.equal(mapping.searchFields);
      expect(qb.getOperator()).to.equal(QueryStringOperators.And);
      expect(qb.getQueryStrings()).eql(['back', 'ba']);
      expect(qb.buildQuery()).to.eql({
        query: {
          query_string: {
            query: '(back) AND (ba)',
            fields: mapping.searchFields
          }
        }
      });
      done();
    });
  });

  describe('Fully assembled query string', () => {
    it('should assemble the string representation of a full query', (done) => {
      const qb = QueryStringQuery(ObjectTypes.Test)
        .setOperator(QueryStringOperators.Or)
        .setQueryStrings('fore', 'ba');

      const mapping = INDEX_SEARCH_MAPPINGS[ObjectTypes.Test];

      expect(qb.buildQueryString()).to.equal(JSON.stringify({
        query: {
          query_string: {
            query: '(fore) OR (ba)',
            fields: mapping.searchFields
          }
        }
      }));
      done();
    });
  });
});
