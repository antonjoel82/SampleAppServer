const { describe, it } = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const dirtyChai = require('dirty-chai');

const { QueryStringQuery } = require('../../src/elasticsearch/querystring-query-builder.js');

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

  // TODO: Complete the rest of the query builder tests
});
