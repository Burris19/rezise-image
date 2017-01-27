'use strict'

var Kraken = require('kraken')
var fs = require('fs')
var async = require('async')
var request = require('request')
var configTypes = require('./config.json')

var externals = {}

externals.sendRequest = function (urlService) {
	return new Promise(function (resolve, reject) {
		console.log('Url callback', urlService)
		request(urlService, function (error, response, body) {
			resolve('ok')
		})
	})
}

externals.callToNext = function (success, message, callback) {
    if (success) {
        return callback()
    }
    
    return callback(message)
}

externals.handler = function(event, context, callback) {

	var kraken = new Kraken({
		'api_key': '3b566aa6c8c21d78f2ac628cdeb7b84e',
		'api_secret': '099f09d9395a3e9a03c131ac0ef1fa067f996a20'
	})	

	var idParameter = event.query.id === undefined ? Math.floor((Math.random() * 10000)) : event.query.id	
	var urlCallback = event.query.callback
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
		}

		kraken.url(params, function (response) {			

			if (urlCallback) {
				var success = (response.success) ? 'true' : 'false'
				var urlCallbackResponse = urlCallback + '?id=' + idParameter + '&success=' + success
			    externals.sendRequest(urlCallbackResponse)
				    .then(() => {
				        externals.callToNext(response.success, response.message, callback)
				    })
			} else {
			    externals.callToNext(response.success, response.message, callback)
			}
			
		})

	}, function (err) {
		if (err) {
			console.log('A file failed to process')
			callback(err, {"message": "Processing request id " + idParameter})
		} else {
			console.log('A file success to process')
			callback(null, {"message": "Processing request id " + idParameter})
		}
	})	
}


module.exports = externals