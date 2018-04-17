var csv = require('csv-parser');
var fs = require('fs');
var request = require('request');

// Update the key and secret with your actual ones
var key = "xx";
var secret = "yy";
var auth = "Basic " + new Buffer(key + ":" + secret).toString("base64");

// Entry point
start();

function start(){
  // Create file and insert headers
  createFile();
  // Read numbers from file and perfom lookup on each function
  fs.createReadStream('numbers.csv')
    .pipe(csv())
    .on('data', function (data) {
        lookup(data.Number);
    });
}

// Make call to Lookups API and return data to writeToFile function
function lookup(number){
  var url = "https://api.messagemedia.com/v1/lookups/phone/"+number+"?options=carrier%2Ctype";
  request({
          url : url,
          headers : { "Authorization" : auth }
      },
      function (error, response, body) {
          //console.log((body));
          var phone_number = JSON.parse(body)["phone_number"]
          var type = JSON.parse(body)["type"];
          var carrier = JSON.parse(body)["carrier"]["name"];
          var country_code = JSON.parse(body)["country_code"];

          writeToFile(phone_number, type, carrier, country_code);
      }
  );
}

// Fill in the lookup details of the number in the csv file
function writeToFile(phone_number, type, carrier, country_code) {
  var dataToWrite = phone_number+","+type+","+carrier+","+country_code+"\n";
  fs.appendFile('results.csv', dataToWrite, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('Lookups information added successfully.');
    }
  });
}

// Create and add headers to the file
function createFile(){
  var dataToWrite = "Phone Number,Type,Carrier,Country Code\n";
  fs.writeFile('results.csv', dataToWrite, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('File created and headings added.');
    }
  });
}
