'use strict'

var Kraken = require('kraken')
var fs = require('fs')
var async = require('async')
var request = require('request')
var Promise = require("bluebird");
var configTypes = require('./config.json')
var nock = require('nock');

var externals = {}
var kraken = new Kraken({
	'api_key': 'xxxxxxxxx',
	'api_secret': 'xxxxxxxxxx'
})	
var urlObject = []
var objectParameter = []

externals.sendRequest = function (urlService, id, data) {
	return new Promise(function (resolve, reject) {	
		request.post({
        	url: urlService,
         	data: {
         		'id': id,
         		'data': data
         	}
        }, function(error, response){
        	if (error) {
        		resolve({'error': error})
        	}
            resolve({'response': response})
    	});
	})
}

externals.uploadImages = function(settings){
	return 	new Promise(function(resolve, reject){
		async.each(settings.configTypes, function (file, callback) {
			var params = {
				url: settings.urlImage,			
				wait: true,
				resize: {
					width: parseInt(file.width),
					height: parseInt(file.height),
					strategy: 'exact'
				},
				s3_store: {
					key: 'xxxxxxxxx',
					secret: 'xxxxxxxxxxxx',
					bucket: 'test-lambda-smartly',
					path: 'images/' + settings.typeParameter + '/' + settings.idParameter + file.width + 'x' + file.height + '.jpg'
				},
				webp: true,
				lossy: true
			}

			kraken.url(params, function (response) {
				if (response.success) {
	        		settings.urlObject.push({'url': response.kraked_url});		        		
	    		}
	    		callback()
			})		

		}, function (err) {
			resolve(settings.urlObject)
		})	
	})
}

externals.handler = function(event, context) {
	
	var idParameter = event.query.id === undefined ? Math.floor((Math.random() * 10000)) : event.query.id	
	var urlCallback = event.query.callback
	var typeParameter = event.query.type

	if (!typeParameter in configTypes)
		typeParameter = 'facebook'
	
	objectParameter['configTypes'] = configTypes[typeParameter]
	objectParameter['urlImage'] = event.query.url
	objectParameter['typeParameter'] = typeParameter
	objectParameter['idParameter'] = idParameter
	objectParameter['urlObject'] = urlObject

	externals.uploadImages(objectParameter)
		.then(function(data){			
			if (urlCallback) {
				return externals.sendRequest(urlCallback, idParameter, JSON.stringify(data))
			}
			return null 
		}).then(function(response){
			context.done()
		})
}

module.exports = externals
