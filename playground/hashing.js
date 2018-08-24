const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

let message = 'I am John Cena!';
let hash = SHA256(message).toString();
console.log(`Message: ${message} - Hash: ${hash}`)

const data = {
  id: 4
};

const token = {
  data,
  hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
}

token.data = 6;
const computed = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

if (computed === token.hash) {
  console.log('Data is authentic');
} else {
  console.log('Untrusted source!');
}

const anotherData = {
  id: 10
}

const jwtToken = jwt.sign(anotherData, '123abc');
console.log(jwtToken);
anotherData.id = 100;
const decoded = jwt.verify(jwtToken, '123abc');

console.log('decoded', decoded);
