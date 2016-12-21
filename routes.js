var path = require('path');
var paypal = require('paypal-rest-sdk');

/*
 * GET home page.
 */

var first_config = {
    'mode': 'sandbox',
    'client_id': 'AdJNBuss4e-3bSAiNBatiFBhMTNjNA0xvLUo8lnzf0nC_ElOA7R6rbGe4UmR4edLmkASDcX-qW8IpyVa',
    'client_secret': 'EHkhZimLCGU-J0a5XfKxJb4bxLDraRlPO5tMmgHSYQlGZYSaVvmhAGcKcRJJLUodUe6XCgf1FaTg-d7h'
};

var second_config = {
    'mode': 'sandbox',
    'client_id': '<SECOND_CLIENT_ID>',
    'client_secret': '<SECOND_CLIENT_SECRET>'
};

//This sets up client id and secret globally
//to FIRST_CLIENT_ID and FIRST_CLIENT_SECRET
paypal.configure(first_config);

/*
 * SDK configuration
 */
exports.index = function(req, res){
	
    res.sendFile(path.join(__dirname + '/../public/login.html'));
	console.log('index');
};

exports.create = function (req, res) {

	var create_payment_json = {
		"intent": "sale",
		"redirect_urls":
		{
			"return_url": "http://localhost:5000/execute-payment",
			"cancel_url": "http://paypalexpress.herokuapp.com/cancel-payment"
		},
		"payer":
		{
			"payment_method": "paypal"
		},
		"transactions": [
		{
			"amount":
			{
			"total": "4.00",
			"currency": "USD",
			"details":
			{
				"subtotal": "2.00",
				"shipping": "1.00",
				"tax": "2.00",
				"shipping_discount": "-1.00"
			}
			},
			"item_list":
			{
			"items": [
			{
				"quantity": "1",
				"name": "item 1",
				"price": "1",
				"currency": "USD",
				"description": "item 1 description",
				"tax": "1"
			},
			{
				"quantity": "1",
				"name": "item 2",
				"price": "1",
				"currency": "USD",
				"description": "item 2 description",
				"tax": "1"
			}]
			},
			"description": "The payment transaction description.",
			"custom": "merchant custom data"
		}]
	};
	
	paypal.payment.create(create_payment_json, function (error, payment) {
		if (error) {
			console.log(error.response.details);
			res.send({ 'err': error });
		} else {
			console.log("Create Payment Response");
			console.log(payment);
			req.session.payment = payment;
			var paymentLink = "";
			res.send({'paymentID': payment.id});
			/*for (var index = 0; index < payment.links.length; index++) {
				//Redirect user to this endpoint for redirect url
				if (payment.links[index].rel === 'approval_url') {
					paymentLink = payment.links[index].href;
				}
			}
			res.render('payment-details',{'payment': payment, 'paymentLink': paymentLink});*/
		}
	});

	/*paypal.payment.create(payment, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error });
		} else {
			req.session.paymentId = payment.id;
			res.redirect(payment.links[1].href);
		}
	});*/
};

exports.execute = function(req, res) {
	var paymentId = req.session.payment.id;
	console.log("In execute");
	paypal.payment.get(paymentId, function (error, payment) {
	console.log("In get payment");
        payerId = payment.payer.payer_info.payer_id;
		console.log(paymentId+" "+payerId);
		var details = { "payer_id": payerId };
		paypal.payment.execute(paymentId, details, function (error, payment) {
	console.log("In execute payment");
			if (error) {
				console.log(error);
				res.send({'err': error });
			} else {
	console.log("After execute payment");
					console.log(payment);
					req.session.payment = payment;
					res.send({'payment' : payment});   
			}
		});
	});
}



exports.error = function(req, res) {
    /**/
    res.render('error');
};

exports.success = function(req, res){
	res.send('<h1>Payment Success: </h1><br/>' + JSON.stringify(req.session.payment));
};

exports.cancel = function(req, res){
  	
	res.send('<h1>Payment Cancelled. </h1><br/>');
};
