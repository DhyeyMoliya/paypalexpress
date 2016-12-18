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
    res.sendFile(path.join(__dirname + '/../public/login.html'));
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
				"total": "10"
			},
			"description": "description"
		}],
        "redirect_urls": {
			"return_url": "http://paypalexpressheroku.com/execute",
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
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			console.log(error);
			res.render('error', { 'error': error });
		} else {
            if(payment.status == "approved")
			    res.redirect('success', {'payment' : payment});
            else
			    res.redirect('cancel', {'payment' : payment});
                
		}
	});
}



exports.checkout = function(req, res) {
    /**/
    res.send('sucess');
};

exports.success = function(req, res){
  res.send('Payment Success Response: <br/>' + JSON.stringify(req.param('payment')) );
};

exports.cancel = function(req, res){
  res.send('Payment Cancel Response: <br/>' + JSON.stringify(req.param('payment')) );
};
