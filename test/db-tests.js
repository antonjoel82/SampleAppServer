function testMocha () {
  return 'Testing the test framework #meta';
}

function registerNewUserRequest () {
  return {
    email: 'joel@gmail.com',
    username: 'joelcore',
    password: 'ultimate2019',
    name: { first: 'Joel', last: 'CORE' }
  };
}

function loginUserRequest () {
  return {
    login: 'joel@gmail.com',
    password: 'ultimate2019'
  };
}

function saveUser (user, done) {
  user.save(done);
}

module.exports = {
  testMocha,
  registerNewUserRequest,
  loginUserRequest,
  saveUser
};
