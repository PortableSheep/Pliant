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
                        required: {}
                    }
                },
                {
                    field: emailaddress,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: birthdate,
                    chain: [address1, address2],
                    rules: {
                        required: {}
                    }
                },
                {
                    field: address1,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: address2,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: state,
                    rules: {
                        required: {},
                        length: {
                            min: 10, max: 20,
                            message: 'length'
                        }
                    }
                },
                {
                    field: city,
                    chain: { field: state, rules: ['length'] },
                    rules: {
                        required: {}
                    }
                },
                {
                    field: zip,
                    chain: [{
                        field: homephone,
                        rules: 'length'
                    }, {
                        field: workphone
                    }, {
                        field: password,
                        rules: ['length']
                    }]
                },
                {
                    field: homephone,
                    rules: {
                        required: {},
                        length: {
                            min: 10, max: 20,
                            message: 'length'
                        }
                    }
                },
                {
                    field: workphone,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: password,
                    rules: {
                        required: {},
                        length: {
                            min: 10, max: 20,
                            message: 'length'
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function SingleChain() {
    this.echo('>> Testing single chain <<');
    this.fill('form', {
        username: 'test'
    });
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Email address has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message showing.');
});

casper.then(function MultipleChain() {
    this.echo('>> Testing multiple chain <<');
    this.fill('form', {
        birthdate: 'test'
    });
    this.test.assertEvalEquals(function() {
        return address1.hasClass('pl-input-error');
    }, true, 'Address1 has error class.');
    this.test.assertEvalEquals(function() {
        return address1.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message showing.');
    this.test.assertEvalEquals(function() {
        return address2.hasClass('pl-input-error');
    }, true, 'Address2 has error class.');
    this.test.assertEvalEquals(function() {
        return address2.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message showing.');
});

casper.then(function ChainSingleObject() {
    this.echo('>> Testing single chain object <<');
    this.fill('form', {
        city: 'test'
    });
    this.test.assertEvalEquals(function() {
        return state.hasClass('pl-input-error');
    }, true, 'State has error class.');
    this.test.assertEvalEquals(function() {
        return state.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error message showing.');
});

casper.then(function ChainMultipleObject() {
    this.echo('>> Testing multiple chain objects <<');
    this.fill('form', {
        zip: 'test'
    });
    this.test.assertEvalEquals(function() {
        return homephone.hasClass('pl-input-error');
    }, true, 'Homephone has error class.');
    this.test.assertEvalEquals(function() {
        return homephone.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error message showing.');
    this.test.assertEvalEquals(function() {
        return workphone.hasClass('pl-input-error');
    }, true, 'Workphone has error class.');
    this.test.assertEvalEquals(function() {
        return workphone.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error message showing.');
    this.test.assertEvalEquals(function() {
        return password.hasClass('pl-input-error');
    }, true, 'Password has error class.');
    this.test.assertEvalEquals(function() {
        return password.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error message showing.');
});

casper.run(function() {
    this.test.done();
});