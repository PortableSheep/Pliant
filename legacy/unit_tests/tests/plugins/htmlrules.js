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
            appendRulesToFieldClass: true,
            plugins: {
                htmlrules: {
                    parseOnInit: true
                }
            },
            rules: {},
            fields: []
        });
    });
});

casper.then(function InitFields() {
    this.echo('>> Testing html rules init parsing. <<', 'info');
    this.test.assertEvalEquals(function() {
        return password.hasClass('required');
    }, true, 'Password has required rule class.');

    this.evaluate(function() {
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return password.hasClass('pl-input-error');
    }, true, 'Password has error class.');

    this.test.assertEvalEquals(function() {
        return password.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Password required error is visible.');
});

casper.then(function AddPostInit() {
    this.echo('>> Testing post init add. <<', 'info');
    this.evaluate(function() {
        $('<!-- { "field": "#confirmpassword", "rules": { "required":{}} } -->').insertAfter(confirmpassword);
        pliantInst.AddMarkupRules();
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return confirmpassword.hasClass('pl-input-error');
    }, true, 'confirmpassword has error class.');
    this.test.assertEvalEquals(function() {
        return confirmpassword.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message is visible.');
});

casper.run(function() {
    this.test.done();
});