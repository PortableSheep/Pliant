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
            plugins: {
                inputsuccess: {}
            },
            fields: [{
                field: username,
                successMessage: 'success',
                rules: {
                    required: {}
                }
            }]
        });
    });
});

casper.then(function() {
    this.echo('>> Testing init, and success state after fixed error. <<', 'info');
    this.click('#submit');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-success');
    }, false, 'Success class missing.');

    this.fill('form', {
        username: '1'
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-success');
    }, true, 'Success class showing.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-success:visible').text();
    }, 'success', 'Success message showing.');

    this.fill('form', {
        username: '12'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-success');
    }, false, 'Success class missing.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-success:visible').length;
    }, 0, 'Success message hiding.');
});

casper.run(function() {
    this.test.done();
});