const fs = require('fs');
const { describe, it, before } = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const dirtyChai = require('dirty-chai');
const elastic = require('../../src/elasticsearch/elasticsearch.js');

const ESTestHelpers = require('./elasticsearch-test-helpers.js');
const { ObjectTypes } = require('../../src/enum.js');

chai.use(dirtyChai);

const TEST_INDEX_NAME = 'testndx';

describe('ElasticSearch Operations', () => {
  before(done => {
    elastic.ping()
      .then((res) => {
        if (res) {
          console.debug('ElasticSearch is up and running!');
        } else {
          throw new Error('ElasticSearch is not running!');
        }
        return elastic.deleteIndex(TEST_INDEX_NAME);
      })
      .then((res) => {
        console.debug('testndx was deleted.');
      })
      .catch(() => {
        console.debug('testndx could not be deleted during setup.');
      })
      .finally(done);
  });

  describe('Create Index', () => {
    it('should create index "testndx"', () => {
      const settings = JSON.parse(fs.readFileSync('./src/elasticsearch/tag-settings.json'));
      return elastic.createIndex(TEST_INDEX_NAME, settings)
        .then((res) => {
          expect(res).to.be.true('Should acknowledge index creation as true.');
        });
    });
  });
  describe('Index Exists', () => {
    it('should verify that index "testndx" exists', () => {
      return elastic.doesIndexExist(TEST_INDEX_NAME)
        .then((res) => {
          expect(res).to.be.true('Expected "true" - signaling that index exists.');
        });
    });
  });

  describe('Create One Document in Index', () => {
    it('should add new Tag to testndx', () => {
      return elastic.createDocument(TEST_INDEX_NAME, 'bailout', ESTestHelpers.getSingleTag())
        .then((res) => {
          expect(res.result).to.equal('created', `Document was not created properly`);
        });
    });
  });

  describe('Bulk Create Documents to Index', () => {
    it('should add new Tags to testndx', () => {
      return elastic.bulkCreate(TEST_INDEX_NAME, ESTestHelpers.getSampleTags(), 'true')
        .then((res) => {
          expect(res.errors).to.be.false(`Documents were not created properly`);
          expect(res.items[0].create.result).to.equal('created', `Document 0 was not created properly`);
          expect(res.items[1].create.result).to.equal('created', `Document 1 was not created properly`);
          expect(res.items[2].create.result).to.equal('created', `Document 2 was not created properly`);
        });
    });
  });

  describe('Count Documents in Index', () => {
    it('should count 4 documents in testndx', () => {
      return elastic.countAllDocuments(TEST_INDEX_NAME)
        .then((res) => {
          expect(res).to.be.a('object');
          expect(res.count).to.equal(4);
        });
    });
  });

  describe('Get Document from Index', () => {
    it('should get a Tag from testndx.', () => {
      return elastic.getDocument(TEST_INDEX_NAME, 'backhand')
        .then((res) => {
          expect(res).to.be.a('object');
          expect(res.label).to.equal('backhand');
        });
    });
  });

  describe('Get All Documents from Index', () => {
    it('should get all Tags from testndx.', () => {
      return elastic.getAllDocuments(TEST_INDEX_NAME)
        .then((res) => {
          expect(res).to.be.a('object');
          expect(res.hits).to.be.a('array');
          expect(res.total.value).to.equal(4);
          expect(res.hits.length).to.equal(4);
        });
    });
  });

  describe('Search Documents in Index', () => {
    it('should search documents in testndx and return "backhand" and "backing"', () => {
      return elastic.search(ObjectTypes.Test, null, 'bac')
        .then((res) => {
          expect(res).to.be.a('object');
          expect(res.hits).to.be.a('array');
          expect(res.total.value).to.equal(2);
          expect(res.hits.length).to.equal(2);
        });
    });
  });

  describe('Delete Index', () => {
    it('should delete "testndx" and verify that it no longer exists.', () => {
      return elastic.deleteIndex(TEST_INDEX_NAME)
        .then((res) => {
          expect(res).to.be.a('object');
          expect(res.acknowledged).to.be.true('Should acknowledge that testndx has been deleted');
          return elastic.doesIndexExist(TEST_INDEX_NAME);
        })
        .then((res) => {
          expect(res).to.be.false('Expected "false" - signaling that index has been deleted.');
        });
    });
  });
});
