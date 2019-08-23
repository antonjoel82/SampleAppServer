const ResourceTypes = Object.freeze({
  Video: 'video',
  Link: 'link',
  Image: 'image',
  Document: 'document',
  Text: 'text'
});

const Sources = Object.freeze({
  Youtube: 'youtube',
  Vimeo: 'vimeo',
  OtherLink: 'other',
  Raw: 'raw'
});

const ObjectTypes = Object.freeze({
  Tag: 'tag',
  Resource: 'resource',
  User: 'user',
  Test: 'test'
});

const QueryStringOperators = Object.freeze({
  Or: 'OR',
  And: 'AND',
  Default: 'OR'
});

module.exports = {
  ResourceTypes,
  Sources,
  ObjectTypes,
  QueryStringOperators
};
