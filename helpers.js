
const generateRandomString = function() {

  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toString();

}

const getUserByEmail = function(email, users){
  for( let user in users){
    if(email === users[user].email){
      //console.log("here")    
      return users[user];
    }
  }
  return null;

}
const urlsForUser = function (id, urlDatabase){
const userUrl = [];
for (const urlId in urlDatabase){
   const url = urlDatabase[urlId]
   //console.log(url.userID , id)
 if(url && url.userID === id){
   userUrl.push({id:urlId, longUrl: url.longURL})
   //console.log(userUrl)
 }
}
//console.log(urlDatabase)
return userUrl;
}

module.exports = {generateRandomString, getUserByEmail, urlsForUser};