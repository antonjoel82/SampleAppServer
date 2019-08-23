function getSampleTags () {
  return [
    {
      'id': 'forehand',
      'label': 'forehand',
      'summary': 'Examples, technique, and tips for the forehand throw',
      'creator': '5d4b56dc75f83175987a26c9',
      'create_date': '2019-08-12T22:08:00'
    },
    {
      'id': 'backhand',
      'label': 'backhand',
      'summary': 'Examples, technique, and tips for the backhand throw',
      'creator': '5d4b56dc75f83175987a26c9',
      'create_date': '2019-08-14T22:08:00'
    },
    {
      'id': 'backing',
      'label': 'backing',
      'summary': 'Defensive positioning strategy to prevent deep cuts',
      'creator': '5d4b56dc75f83175987a26c9',
      'create_date': '2019-08-13T12:08:00'
    }
  ];
}

function getSingleTag () {
  return {
    'label': 'bail out',
    'summary': 'High stall throws',
    'creator': '5d4b56dc75f83175987a26c9',
    'create_date': '2019-08-13T12:08:00'
  };
}

module.exports = {
  getSampleTags,
  getSingleTag
};
