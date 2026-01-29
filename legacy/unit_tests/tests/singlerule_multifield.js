casper.start('unit_tests/index.html', function InitTest() {
	this.echo('Testing that multiple fields can be defined in one "field" definition, since they share the same rule.', 'info');
	this.test.assertTitle('Pliant Test Suite', 'Title is found.');
	this.test.assertExists('form[action="#"]', 'Form found.');
	this.evaluate(function() {
		username = $('#username');
		emailaddress = $('#emailaddress');
		birthdate = $('#birthdate');
		submit = $('#submit');
		pliantInst = $('form').pliant({
			rules: {},
			fields: [
				{
					field: $('input[type="text"]:lt(3)'),
					rules: {
						required: {}
					}
				}
			]
		});
	});
});

//Check that the fields are now invalid.
casper.then(function CheckForFields() {
	this.echo('>> Checking for fields after submit on init. <<', 'info');

	//Submit the form.
	this.evaluate(function SubmitForm() {
		submit.submit();
	});

	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, true, 'Username error class found.');
	this.test.assertEvalEquals(function() {
		return username.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');

	this.test.assertEvalEquals(function() {
		return emailaddress.hasClass('pl-input-error');
	}, true, 'Emailaddress error class found.');
	this.test.assertEvalEquals(function() {
		return emailaddress.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');

	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, true, 'Birthdate has error class.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
});

//Go through each enabled field, change the value and confirm it fixed it on change.
casper.then(function ValidateOnChange() {
	this.echo('>> Testing for validation on field change. <<', 'info');
	this.fill('form', {
		username: 'test'
	});
	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, false, 'Username error class removed.');
	this.test.assertEvalEquals(function() {
		return username.parent().find('.pl-element-error:visible').length;
	}, 0, 'No error messages showing.');
	this.test.assertEvalEquals(function() {
		return emailaddress.hasClass('pl-input-error');
	}, true, 'Emailaddress error class found.');
	this.test.assertEvalEquals(function() {
		return emailaddress.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, true, 'Birthday=te error class found.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
	this.fill('form', {
		username: '',
		emailaddress: 'test'
	});
	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, true, 'Username has error class.');
	this.test.assertEvalEquals(function() {
		return username.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
	this.test.assertEvalEquals(function() {
		return emailaddress.hasClass('pl-input-error');
	}, false, 'Emailaddress error class removed.');
	this.test.assertEvalEquals(function() {
		return emailaddress.parent().find('.pl-element-error:visible').length;
	}, 0, 'No error messages showing.');
	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, true, 'Birthdate has error class.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
	this.fill('form', {
		emailaddress: '',
		birthdate: 'test'
	});
	this.test.assertEvalEquals(function() {
		return pliantInst.invalidCount();
	}, 2, "Two field invalid.");
	this.test.assertEvalEquals(function() {
		pliantInst.reset();
		return pliantInst.invalidCount();
	}, 0, 'Form reset - no fields invalid.');
});

casper.then(function ValidateOnSubmit() {
	this.echo('>> Testing submit validation. <<', 'info');
	this.evaluate(function() {
		username.val('');
		emailaddress.val('');
		birthdate.val('');
		pliantInst.ResetState();
	});
	this.click('#submit');
	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, true, 'Username has error class.');
	this.test.assertEvalEquals(function() {
		return username.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');

	this.test.assertEvalEquals(function() {
		return emailaddress.hasClass('pl-input-error');
	}, true, 'Emailaddress has error class.');
	this.test.assertEvalEquals(function() {
		return emailaddress.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');

	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, true, 'Birthdate has error class.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').text();
	}, 'Required', 'Required error showing.');
});

//Run the tests!
casper.run(function() {
	this.test.done();
});