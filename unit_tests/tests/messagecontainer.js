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
        global = $('<div id="global"></div>').prependTo('form');
        funcContainer = $('<div id="function"></div>').insertBefore(username);
        ruleContainer = $('<div id="rule"></div>').insertAfter('#submit');
        pliantInst = $('form').pliant({
            rules: {},
            messageContainer: global,
            fields: [
                {
                    field: username,
                    container: funcContainer,
                    rules: {
                        required: {},
                        length: {
                            container: ruleContainer,
                            min: 2, max: 10, message: 'length'
                        }
                    }
                },
                {
                    field: emailaddress,
                    rules: {
                        required: {
                            message: 'emailaddress'
                        }
                    }
                },
                {
                    field: birthdate,
                    rules: {
                        required: {
                            message: 'birthdate'
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function Global() {
    this.echo('>> Testing global message container. <<', 'info');
    this.test.assertEvalEquals(function() {
        return global.find('.pl-element-error').length;
    }, 2, 'One error message found in global.');
    this.test.assertEvalEquals(function() {
        return global.is(':visible');
    }, false, 'Global is hidden.');

    this.evaluate(function() {
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return global.is(':visible');
    }, true, 'Global is visible.');
    this.test.assertEvalEquals(function() {
        return global.find('.pl-element-error:visible').length;
    }, 2, 'Both errors are shown.');

    this.fill('form', {
        emailaddress: '1'
    });

    this.test.assertEvalEquals(function() {
        return global.is(':visible');
    }, true, 'Global is visible.');
    this.test.assertEvalEquals(function() {
        return global.find('.pl-element-error:visible').length;
    }, 1, 'One error are shown.');
    this.test.assertEvalEquals(function() {
        return global.find('.pl-element-error:visible').text();
    }, 'birthdate', 'Birthdate error is visible.');

    this.fill('form', {
        birthdate: '1'
    });
    this.test.assertEvalEquals(function() {
        return global.is(':visible');
    }, false, 'Global is hidden.');
    this.test.assertEvalEquals(function() {
        return global.find('.pl-element-error:visible').length;
    }, 0, 'No errors are shown.');
});

casper.then(function Field() {
    this.echo('>> Testing field message container. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset();
    });
    this.test.assertEvalEquals(function() {
        return funcContainer.is(':visible');
    }, false, 'Function container is hidden.');
    this.test.assertEvalEquals(function() {
        return funcContainer.find('.pl-element-error').length;
    }, 1, 'One error message found in field.');

    this.evaluate(function() {
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return funcContainer.is(':visible');
    }, true, 'Function container is showing.');
    this.test.assertEvalEquals(function() {
        return funcContainer.find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message is showing.');

    this.fill('form', {
        username: '1'
    });
    this.test.assertEvalEquals(function() {
        return funcContainer.is(':visible');
    }, false, 'Function container is hidden.');
    this.test.assertEvalEquals(function() {
        return funcContainer.find('.pl-element-error:visible').length;
    }, 0, 'No errors are showing.');
});

casper.then(function Rule() {
    this.echo('>> Testing rule message container. <<', 'info');
    this.evaluate(function() {
        username.val('');
        pliantInst.reset();
    });

    this.test.assertEvalEquals(function() {
        return ruleContainer.is(':visible');
    }, false, 'Rule container is hidden.');
    this.test.assertEvalEquals(function() {
        return ruleContainer.find('.pl-element-error').length;
    }, 1, 'One error message found in rule.');

    this.fill('form', {
        username: '1'
    });

    this.test.assertEvalEquals(function() {
        return ruleContainer.is(':visible');
    }, true, 'Rule container is showing.');
    this.test.assertEvalEquals(function() {
        return ruleContainer.find('.pl-element-error:visible').length;
    }, 1, 'One error message showing in rule.');
    this.test.assertEvalEquals(function() {
        return ruleContainer.find('.pl-element-error:visible').text();
    }, 'length', 'Length error message is showing.');

    this.fill('form', {
        username: '12'
    });
    this.test.assertEvalEquals(function() {
        return ruleContainer.is(':visible');
    }, false, 'Rule container is hidden.');
    this.test.assertEvalEquals(function() {
        return ruleContainer.find('.pl-element-error:visible').length;
    }, 0, 'No error messages showing in rule.');
});

casper.run(function() {
    this.test.done();
});