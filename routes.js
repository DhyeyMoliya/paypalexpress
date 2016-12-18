var path = require('path');
var paypal = require('paypal-rest-sdk');
var config = {};
var redirect_link = null;
exports.init = function(c){
  config = c;
  paypal.configure(c.api);
}
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.sendFile(path.join(__dirname + '/../public/index.html'));
};

/*
 * SDK configuration
 */

exports.create = function (req, res) {

	var payment = {
		"intent": "sale",
		"payer": {
            "payment_method": "paypal"
		},
		"transactions": [{
			"amount": {
				"currency": "USD",
				"total": "1"
			},
			"description": "description"
		}],
        "redirect_urls": {
			"return_url": "http://paypalexpress.heroku.com/execute",
			"cancel_url": "http://paypalexpress.heroku.com/cancel"
		}
	};
	
	paypal.payment.create(payment, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error });
		} else {
			req.session.paymentId = payment.id;
			res.redirect(payment.links[1].href);
		}
	});
};

exports.execute = function(req, res) {
    var paymentId = req.session.paymentId;
	var payerId = req.param('PayerID');

	var details = { "payer_id": payerId };
	var payment = paypal.payment.execute(paymentId, details, function (error, pay) {
		if (error) {
			res.render('error', { 'error': error });
		} else {
			res.render('success', {'message': 'success', 'payment' : pay});
		}
	});
}

exports.cancel = function(req, res){
  res.send('Payment Cancelled.');
};
