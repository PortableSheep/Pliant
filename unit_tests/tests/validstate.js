casper.start('unit_tests/index.html', function InitTest() {
    this.log('Testing for title, form, and setting up init pliant.', 'info');
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
                    chain: emailaddress,
                    rules: {
                        required: {
                            valid: false
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function() {
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username is invalid on init.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error is showing.');

    this.fill('form', {
        username: '123'
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has been fixed and is missing error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'Required error is hidden.');
});

casper.run(function() {
    this.test.done();
});