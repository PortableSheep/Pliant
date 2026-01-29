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
                mylength: {
                    inherit: 'length',
                    min: 10, max: 20,
                    message: 'length inherited'
                }
            },
            fields: [
                {
                    field: username,
                    rules: {
                        mylength: {}
                    }
                }
            ]
        });
    });
});

casper.then(function UseInheritedRule() {
    this.echo('>> Testing inherited rules. <<', 'info');
    this.fill('form', {
        username: '1'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length inherited', 'Inherited error showing.');

    this.fill('form', {
        username: '12345678901'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username error class removed.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
});

casper.run(function() {
    this.test.done();
});