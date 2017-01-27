'use strict'
var Kraken = require('kraken');
var fs = require("fs");
var async = require("async");
var request = require('request');

var externals = {}

externals.senRequest = function(urlService, parameter) {
  return new Promise(function(resolve, reject) {
  	var url = urlService + parameter;
  	console.log('Url callback', url)
	request(url, function (error, response, body) {		
		return resolve('ok')
	})
  })
}

externals.handler = (event, context, callback) => {

	var kraken = new Kraken({
		'api_key': '3b566aa6c8c21d78f2ac628cdeb7b84e',
		'api_secret': '099f09d9395a3e9a03c131ac0ef1fa067f996a20'
	});	

	var idParameter = event.query.id === undefined ? Math.floor((Math.random() * 10000)) : event.query.id	

	var urlCallback = event.query.callback === undefined ? 'http://www.google.com' : event.query.callback

	var content = fs.readFileSync("config.json");
	var configTypes = JSON.parse(content);
	var typeParameter = event.query.type

	if (!typeParameter in configTypes)
		typeParameter = 'facebook'

	async.each(configTypes[typeParameter], function (file, callback) {
		var params = {
			url: event.query.url,			
			wait: true,
			resize: {
				width: parseInt(file.width),
				height: parseInt(file.height),
				strategy: 'exact'
			},
			s3_store: {
				key: 'AKIAJBVITO43KTLBDOLQ',
				secret: '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',
				bucket: 'test-lambda-smartly',
				path: 'images/' + typeParameter + '/' + idParameter + file.width + 'x' + file.height + '.jpg'
			},
			webp: true,
			lossy: true
		};

		kraken.url(params, function (status) {
			if (status.success) {
				externals.senRequest(urlCallback, '?id='+idParameter+'&success=true')
				.then(function(response){
					callback()	
				})
				
			} else {
				externals.senRequest(urlCallback, '?id='+idParameter+'&success=false')
				.then(function(response){
					callback()	
				})				
			}
		});

	}, function (err) {
		if (err) {
			console.log('A file failed to process');
			callback(null, {"success": "Processing request id " + idParameter});
		} else {
			console.log('A file success to process');
			callback(null, {"success": "Processing request id " + idParameter});
		}
	});	
};


module.exports = externals