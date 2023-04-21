const { assert } = require('chai');

const { getUserByEmail , urlsForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    //console.log(user.id)
    const expectedUserID = "userRandomID";
    assert.deepEqual(expectedUserID ,user.id, 'user are equal');  
  })

    it('should return a user with valid email', function() {
      const user = getUserByEmail("user@example.come", testUsers);
      console.log(user)
      const expectedUserID = null;
      assert.deepEqual(expectedUserID ,user, 'if the email does not exist');  
    
    
  });

  
});

describe('urlsForUser', function() {
  it('should return a object with Url of user', function() {
    const userUrl = urlsForUser("aJ48lW", urlDatabase);
    //console.log(userUrl)
    const expectedUserID = [{ id: 'b6UTxQ', longUrl: 'https://www.tsn.ca' },
    { id: 'i3BoGr', longUrl: 'https://www.google.ca' }]
      
    assert.deepEqual(expectedUserID ,userUrl, 'user are equal');   
  });

  
})