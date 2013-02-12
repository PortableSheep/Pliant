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
            rules: {},
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
                            min: 10, max: 20, message: 'length'
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function toggle() {
    this.echo('>> Testing field toggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.toggle(false, username);
    });
    this.click('#submit');

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error messages showing.');

    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error showing.');

    this.evaluate(function() {
        pliantInst.toggle(true, username);
        pliantInst.toggle(false, emailaddress);
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
    }, false, 'Emailaddress has no error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error messages showing.');
});

casper.then(function ToggleFieldRule() {
    this.echo('>> Testing rule toggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.toggle(true, emailaddress);
        pliantInst.toggle(false, emailaddress, 'required');
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
    }, 'length', 'Length error message showing.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.toggle(true, emailaddress, 'required');
    });
    this.click('#submit');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message showing.');
});

casper.run(function() {
    this.test.done();
});