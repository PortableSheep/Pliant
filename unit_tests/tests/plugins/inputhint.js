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
                inputhint: {}
            },
            rules: {},
            fields: [{
                field: password,
                rules: {
                    required: {}
                }
            }, {
                field: workphone,
                hintText: 'Work Phone',
                rules: {
                    required: {}
                }
            }]
        });
    });
});

casper.then(function InitFields() {
    this.echo('>> Testing init hint add. <<', 'info');
    this.test.assertEvalEquals(function() {
        return password.val();
    }, 'Enter Password', 'Password hint found.');
    this.test.assertEvalEquals(function() {
        return password.hasClass('plHint');
    }, true, 'Password hint class found.');
    this.test.assertEvalEquals(function() {
        return password[0].type;
    }, 'text', 'Password transformed to text.');

    this.click('#password');
    this.test.assertEvalEquals(function() {
        return password[0].type;
    }, 'password', 'Password transformed back to password type.');
    this.test.assertEvalEquals(function() {
        return password.hasClass('plHint');
    }, false, 'Password missing hint class.');

    this.click('#username');
    this.test.assertEvalEquals(function() {
        return password[0].type;
    }, 'text', 'Password transformed back to text type due to no content.');
    this.test.assertEvalEquals(function() {
        return password.hasClass('plHint');
    }, true, 'Password has hint class.');

    this.test.assertEvalEquals(function() {
        return workphone.val();
    }, 'Work Phone', 'Workphone has hint text.');
    this.test.assertEvalEquals(function() {
        return workphone.hasClass('plHint');
    }, true, 'Workphone has hint class.');

    this.click('#workphone');
    this.test.assertEvalEquals(function() {
        return workphone.val();
    }, '', 'Workphone hint text missing.');
    this.test.assertEvalEquals(function() {
        return workphone.hasClass('plHint');
    }, false, 'Workphone hint class missing.');

    this.click('#submit');
});

casper.then(function CheckValidate() {
    this.echo('>> Testing no conflict on validate. <<', 'info');
    this.test.assertEvalEquals(function() {
        return password.hasClass('pl-input-error');
    }, true, 'Password has error class.');
    this.test.assertEvalEquals(function() {
        return password.val();
    }, 'Enter Password', 'Password has hint text.');
    this.test.assertEvalEquals(function() {
        return workphone.hasClass('pl-input-error');
    }, true, 'Workphone has error class.');
    this.test.assertEvalEquals(function() {
        return workphone.val();
    }, 'Work Phone', 'Workphone hint text found.');
});

casper.then(function RemoveField() {
    this.echo('>> Testing remove cleanup. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.remove(password);
        pliantInst.remove(workphone);
    });

    this.test.assertEvalEquals(function() {
        return password.val();
    }, '', 'Hint text removed from password.');
    this.test.assertEvalEquals(function() {
        return password[0].type;
    }, 'password', 'Password type reset to password.');
    this.test.assertEvalEquals(function() {
        return password.hasClass('plHint');
    }, false, 'Password missing hint class.');
    this.test.assertEvalEquals(function() {
        return workphone.val();
    }, '', 'Hint text removed from workphone.');
    this.test.assertEvalEquals(function() {
        return workphone.hasClass('plHint');
    }, false, 'Workphone missing hint class.');
});

casper.run(function() {
    this.test.done();
});