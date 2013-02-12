casper.start('unit_tests/index.html', function InitTest() {
	this.echo('Testing for title, form, and setting up init pliant.', 'info');
	this.test.assertTitle('Pliant Test Suite', 'Title is found.');
	this.test.assertExists('form[action="#"]', 'Form found.');
	this.evaluate(function() {
		username = $('#username');
		emailaddress = $('#emailaddress');
		birthdate = $('#birthdate');
		address1 = $('#address1');
		address2 = $('#address2');
		city = $('#city');
		state = $('#state');
		zip = $('#zip');
		homephone = $('#homephone');
		workphone = $('#workphone');
		password = $('#password');
		confirmpassword = $('#confirmpassword');
		submit = $('#submit');
		pliantInst = $('form').pliant({
			rules: {
			},
			fields: [
				{
					field: username,
					rules: {
						required: {}
					}
				},
				{
					field: emailaddress,
					rules: {
						required: {}
					}
				},
				{
					field: birthdate,
					rules: {
						required: {},
						custom: {
							message: 'custom',
							validate: function() {
								return this.val() == 'custom';
							}
						}
					}
				}
			]
		});
	});
});

//Check that the fields are now invalid, except the address1 since it's disabled.
casper.then(function CheckForFields() {
	this.echo('>> Checking for fields after submit on init. <<', 'info');

	//Submit the form.
	this.evaluate(function SubmitForm() {
		pliantInst.remove(address1);
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
	this.fill('form', {
		birthdate: 'custom'
	});
	this.test.assertEvalEquals(function() {
		return pliantInst.invalidCount();
	}, 1, "One field invalid.");
	this.test.assertEvalEquals(function() {
		pliantInst.reset();
		return pliantInst.invalidCount();
	}, 0, 'Form reset - no fields invalid.');
});

casper.then(function CustomRule() {
	this.echo('>> Testing a custom rule. <<', 'info');
	this.fill('form', {
		birthdate: 'test'
	});
	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, true, 'Birthdate has error class.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').text();
	}, 'custom', 'Custom error showing.');
	this.fill('form', {
		birthdate: 'custom'
	});
	this.test.assertEvalEquals(function() {
		return birthdate.hasClass('pl-input-error');
	}, false, 'Birthdate error class removed.');
	this.test.assertEvalEquals(function() {
		return birthdate.parent().find('.pl-element-error:visible').length;
	}, 0, 'No error message showing.')
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

casper.then(function ValidateOnValidate() {
	this.echo('>> Testing external Validate call. <<', 'info');
	this.evaluate(function() {
		pliantInst.ResetState();
		pliantInst.Validate();
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

casper.then(function ExpectedResult() {
	this.echo('>> Testing ExpectedResult. <<', 'info');
	this.evaluate(function() {
		pliantInst.destroy();
		pliantInst.add({
			field: username,
			rules: {
				test: {
					expectedResult: 'test',
					message: 'test',
					validate: function() {
						return this.val();
					}
				}
			}
		});
	});
	this.fill('form', {
		username: 'derp'
	});
	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, true, 'Username has error class.');
	this.fill('form', {
		username: 'test'
	});
	this.test.assertEvalEquals(function() {
		return username.hasClass('pl-input-error');
	}, false, 'Username is fixed.');
});

//Run the tests!
casper.run(function() {
	this.test.done();
});