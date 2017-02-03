'use strict'

const Bucker = require('bucker')
const Code = require('code')
const Lab = require('lab')
const nock = require('nock')

const Lambda = require('../index.js')
const configTypes = require('../config.json')
const Logger = Bucker.createLogger({ name: '/tests/index.js'})

const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('Lambda Function', () => {
	it('Testing function uploadImages well :)', done => {					
		var urlCallback = 'http://myapp.iriscouch.com'		
		var idParameter = 'testId'
		var data = [{'url': 'imagesOne'}, {'url': 'imagesTwo'}]

		var scope = nock('http://myapp.iriscouch.com')
			.post('/')
			.reply(200);

		Lambda.sendRequest(urlCallback, idParameter, JSON.stringify(data))
		.then(response => {									
			expect(response.response).to.exist();
			expect(response.response.statusCode).to.equal(200);			
        	done()
		})
	})

	it('Testing function uploadImages well :)', done => {

		let objectParameter = [];
		let urlObject = [];
		objectParameter['configTypes'] = configTypes['facebook'];
		objectParameter['urlImage'] = 'http://ondesarrollo.com/wp-content/uploads/2016/11/testing.jpg'
		objectParameter['typeParameter'] = 'facebook'
		objectParameter['idParameter'] = 'testing'
		objectParameter['urlObject'] = urlObject
		
		Lambda.uploadImages(objectParameter)
		.then(response => {
			console.log(response)
			expect(response).to.be.an.array()
			response.forEach(function(item) {			    
				expect(item).to.be.an.object()
				expect(item).to.include('url');
			})
			done()
		})
	})
})