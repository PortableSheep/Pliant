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
                        required: {
                            message: 'required overridden'
                        }
                    }
                },
                {
                    field: emailaddress,
                    rules: {
                        custom: {
                            message: 'custom',
                            validate: function(o) {
                                if (this.val() == 'override') {
                                    o.SetMessage('custom overridden');
                                }
                                return this.val() == 'success';
                            }
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function MessageOverrides() {
    this.echo('>> Testing message overrides. <<', 'info');
    this.click('#submit');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'required overridden', 'Overridden error is showing.');

    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'custom', 'Custom error is showing.');

    this.fill('form', {
        emailaddress: 'override'
    });
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'custom overridden', 'Overridden error is showing.');

    this.fill('form', {
        emailaddress: 'test'
    });
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'custom', 'Custom error is showing.');

    this.fill('form', {
        username: 'test',
        emailaddress: 'success'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username error class is removed.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'Username error messages are hidden.');

    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'Emailaddress error class is removed.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').length;
    }, 0, 'Emailaddress error messages are hidden.');
});

casper.run(function() {
    this.test.done();
});