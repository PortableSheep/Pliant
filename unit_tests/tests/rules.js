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
                        required: {},
                        length: {
                            min: 2, max: 10, message: 'length'
                        },
                        numeric: {
                            message: 'numeric'
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function BuiltInRules() {
    this.echo('>> Testing built in rules. <<', 'info');
    this.click('#submit');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error showing.');

    this.fill('form', {
        username: 'q'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error showing.');

    this.fill('form', {
        username: 'qqqqqqqqqqq'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error showing.');

    this.fill('form', {
        username: 'qq'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'numeric', 'Numeric error showing.');

    this.fill('form', {
        username: '12'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error messages showing.');
});

casper.run(function() {
    this.test.done();
});