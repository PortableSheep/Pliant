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
                        required: {},
                        length: {
                            min: 10, max: 15, message: 'length'
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function set_field_state() {
    this.echo('>> Testing setting field state. <<', 'info');
    this.evaluate(function() {
        pliantInst.state({
            field: username,
            rules: {
                required: false
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message is showing.');

    this.evaluate(function() {
        pliantInst.state([{
            field: username,
            rules: {
                required: true
            }
        }, {
            field: emailaddress,
            rules: {
                length: false
            }
        }]);
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username error class is removed.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'Required error message is removed.');

    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error message is showing.');
});

casper.then(function resetFieldState() {
    this.echo('>> Testing resetting field state. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset(emailaddress);
    });
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'Emailaddress error class is removed.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-input-error:visible').length;
    }, 0, 'All error message removed.');
});

casper.run(function() {
    this.test.done();
});