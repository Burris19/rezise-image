'use strict'

const Bucker = require('bucker')
const Code = require('code')
const Lab = require('lab')
const nock = require('nock')

const Lambda = require('../index.js')
const Logger = Bucker.createLogger({ name: '/tests/index.js'})

const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
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

})