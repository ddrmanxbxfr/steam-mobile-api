/* Simple steam api request using json returns steam sales from (Daily deal + Sales) using HTTP.

Copyright (C) 2013  Mathieu Rhéaume <mathieu@codingrhemes.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Functions that are used by the app.
function formatPrice(strPrice) {
	return strPrice.substr(0, strPrice.length - 2) + "," + strPrice.substr(strPrice.length - 2) + "$";
}

// Function that check if the item is already in JSON array.
// Return true if already there!
function checkInArray(pArray, pName) {
	var alreadyPresent;
	alreadyPresent = false;
	for (var cItem in pArray) {
		if (pArray[cItem].hasOwnProperty("name") && JSON.stringify(pArray[cItem].name) == pName)
			alreadyPresent = true;
	}
	return alreadyPresent;
}

function writeWholeJSON(str, res) {
	var responseJSON;
	// Parse my JSON bro.
	responseJSON = JSON.parse(str);
	// Finding the daily deal as there is a lot of sales!!
	var iCpt = 0;
	var dailyDealJSON;
	var itemToDeal;
	var allSpecialsItemsJSON = [];
	// Generate the specials in an new way !
	// Get all the items with a discounted price and
	// put them in the same JSONObject!
	var nbItemsAllSpecialsJSON = 0;
	try {
		for (var item in responseJSON) {
			if (responseJSON[item].hasOwnProperty("items")) {
				for (pElements in responseJSON[item].items) {
					itemToDeal = responseJSON[item].items[pElements];

					if (!checkInArray(allSpecialsItemsJSON, JSON.stringify(itemToDeal.name)) && itemToDeal.hasOwnProperty("discount_percent") && JSON.stringify(itemToDeal.discount_percent) != "0" && JSON.stringify(itemToDeal.discounted) == "true" && JSON.stringify(itemToDeal.original_price) != "null") {
						nbItemsAllSpecialsJSON = nbItemsAllSpecialsJSON + 1;
						// Add , and $ to the prices.
						itemToDeal.original_price = formatPrice(JSON.stringify(itemToDeal.original_price));
						// With Discount % to show in app (19%) 10,33$ Per example
						if (responseJSON[item].name != "Top Sellers")
							itemToDeal.final_price = "(" + JSON.stringify(itemToDeal.discount_percent) + "%) " + formatPrice(JSON.stringify(itemToDeal.final_price))
						allSpecialsItemsJSON.push(itemToDeal);
					}
				}
			}
		}
	} catch (err) {}

	var allSpecialsJSON = {
		"items": allSpecialsItemsJSON
	};

	try {
		while (responseJSON[iCpt].name != "Daily Deal") {
			iCpt = iCpt + 1;
		}
		dailyDealJSON = responseJSON[iCpt];
		// Correct the prices provided by steam.
		// Formatting 4099 to 40,99$  per example.
		// With Discount % to show in app (19%) 10,33$ Per example
		//dailyDealJSON.items[0].final_price = "(" + JSON.stringify(dailyDealJSON.items[0].discount_percent) + "%) " + formatPrice(JSON.stringify(dailyDealJSON.items[0].final_price));
	} catch (err) {}

// Verify if daily deal was found else return a not found item.
if (dailyDealJSON == null)
	dailyDealJSON = {
		"items": [{
			"final_price": " ",
			"discount_percent": " ",
			"name": "Daily Deal Not Active in steam store."
		} ]
	}
	try {
		// Format for most popular
		// Format prices and compute discounted price in Specials
		for (iCpt = 0; iCpt < responseJSON.top_sellers.items.length; iCpt++) {
			// Add % to the discounted prices
			//responseJSON.top_sellers.items[iCpt].discount_percent = JSON.stringify(responseJSON.top_sellers.items[iCpt].discount_percent) + "%"
			// Add , and $ to the prices.
			responseJSON.top_sellers.items[iCpt].original_price = formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].original_price))
			// With Discount % to show in app (19%) 10,33$ Per example
			if (JSON.stringify(responseJSON.top_sellers.items[iCpt].discount_percent) != "0")
				responseJSON.top_sellers.items[iCpt].final_price = "(" + JSON.stringify(responseJSON.top_sellers.items[iCpt].discount_percent) + "%) " + formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].final_price))
			else
				responseJSON.top_sellers.items[iCpt].final_price = formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].final_price))
		}
	} catch (err) {}

	// Build the JSON Object	
	var dealsJSON = {
		"dailyDeal": dailyDealJSON,
		"specials": allSpecialsJSON, //responseJSON.specials,
		"most_popular": responseJSON.top_sellers
	};
	res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.write(JSON.stringify(dealsJSON));
	res.end();
}

function writeDailyDealJSON(str, res) {
	var responseJSON;
	// Parse my JSON bro.
	responseJSON = JSON.parse(str);
	// Finding the daily deal as there is a lot of sales!!
	var iCpt = 0;
	var dailyDealJSON;
	while (responseJSON[iCpt].name != "Daily Deal") {
		iCpt = iCpt + 1;
	}
	dailyDealJSON = responseJSON[iCpt];
	// Correct the prices provided by steam.
	// Formatting 4099 to 40,99$  per example.
	dailyDealJSON.items[0].final_price = "(" + JSON.stringify(dailyDealJSON.items[0].discount_percent) + "%) " + formatPrice(JSON.stringify(dailyDealJSON.items[0].final_price));

	// Build the JSON Object	
	var dealsJSON = {
		"dailyDeal": dailyDealJSON,
	};
	res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.write(JSON.stringify(dealsJSON));
	res.end();
}


function writeSpecialsJSON(str, res) {
	var responseJSON;
	// Parse my JSON bro.
	responseJSON = JSON.parse(str);
	// Finding the daily deal as there is a lot of sales!!
	var iCpt = 0;

	// Format prices and compute discounted price in Specials
	for (iCpt = 0; iCpt < responseJSON.specials.items.length; iCpt++) {
		// Add % to the discounted prices
		//responseJSON.specials.items[iCpt].discount_percent = JSON.stringify(responseJSON.specials.items[iCpt].discount_percent) + "%"
		// Add , and $ to the prices.
		responseJSON.specials.items[iCpt].original_price = formatPrice(JSON.stringify(responseJSON.specials.items[iCpt].original_price))
		// With Discount % to show in app (19%) 10,33$ Per example
		responseJSON.specials.items[iCpt].final_price = "(" + JSON.stringify(responseJSON.specials.items[iCpt].discount_percent) + "%) " + formatPrice(JSON.stringify(responseJSON.specials.items[iCpt].final_price))
	}

	// Build the JSON Object	
	var dealsJSON = {
		"specials": responseJSON.specials
	};
	res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.write(JSON.stringify(dealsJSON));
	res.end();
}

function writeMostPopularJSON(str, res) {
	var responseJSON;
	// Parse my JSON bro.
	responseJSON = JSON.parse(str);
	// Finding the daily deal as there is a lot of sales!!
	var iCpt = 0;

	// Format prices and compute discounted price in Specials
	for (iCpt = 0; iCpt < responseJSON.top_sellers.items.length; iCpt++) {
		// Add % to the discounted prices
		//responseJSON.top_sellers.items[iCpt].discount_percent = JSON.stringify(responseJSON.top_sellers.items[iCpt].discount_percent) + "%"
		// Add , and $ to the prices.
		responseJSON.top_sellers.items[iCpt].original_price = formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].original_price))
		// With Discount % to show in app (19%) 10,33$ Per example
		if (JSON.stringify(responseJSON.specials.items[iCpt].discount_percent) != "0")
			responseJSON.top_sellers.items[iCpt].final_price = "(" + JSON.stringify(responseJSON.top_sellers.items[iCpt].discount_percent) + "%) " + formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].final_price))
		else
			responseJSON.top_sellers.items[iCpt].final_price = formatPrice(JSON.stringify(responseJSON.top_sellers.items[iCpt].final_price))
	}

	// Build the JSON Object	
	var dealsJSON = {
		"most_popular": responseJSON.top_sellers
	};
	res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.write(JSON.stringify(dealsJSON));
	res.end();
}

// Main program!
var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
	// Original Steam API URL.
	var options = {
		host: 'store.steampowered.com',
		path: '/api/featuredcategories'
	};

	http.get(options, function(response) {
		var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function(chunk) {
			str += chunk;
		});

		//the whole response has been recieved!
		response.on('end', function() {
			var url_parts = url.parse(req.url);
			// Rooting meh I don't need a lib for that !
			switch (url_parts.pathname) {
				case '/':
					writeWholeJSON(str, res);
					break;
				case '/dailydeal':
					writeDailyDealJSON(str, res);
					break;
				case '/special':
					writeSpecialsJSON(str, res);
					break;
				case '/mostpopular':
					writeMostPopularJSON(str, res);
					break;
				default:
					res.write('Too bad 404');
					res.end();
			}

		});


	});
});

server.listen(8081);
