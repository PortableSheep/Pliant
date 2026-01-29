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
        pliantInst = $('form').pliant({
            rules: {
                custom: {
                    validate: function(o) {
                        return o == 'test';
                    }
                }
            },
            fields: [
            ]
        });
    });
});

casper.then(function add() {
    this.echo('>> Testing add. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        pliantInst.add([{
            field: emailaddress,
            rules: {
                required: {}
            }
        }, {
            field: birthdate,
            rules: {
                required: {}
            }
        }]);
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.totalFields();
    }, 3, 'totalFields returns 3.');
});

casper.then(function validate() {
    this.echo('>> Testing validate. <<', 'info');
    this.evaluate(function() {
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error is showing.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error is showing.');
    this.test.assertEvalEquals(function() {
        return birthdate.hasClass('pl-input-error');
    }, true, 'Birthdate has error class.');
    this.test.assertEvalEquals(function() {
        return birthdate.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error is showing.');
    this.test.assertEvalEquals(function() {
        return pliantInst.invalidCount();
    }, 3, 'invalidCount returns 3.');
});

casper.then(function reset() {
    this.echo('>> Testing reset. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset(username);
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');

    this.evaluate(function() {
        pliantInst.reset();
    });
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'Emailaddress has no error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
    this.test.assertEvalEquals(function() {
        return birthdate.hasClass('pl-input-error');
    }, false, 'Birthdate has no error class.');
    this.test.assertEvalEquals(function() {
        return birthdate.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
    this.test.assertEvalEquals(function() {
        return pliantInst.invalidCount();
    }, 0, 'invalidCount returns 0.');
});

casper.then(function clear() {
    this.echo('>> Testing clear. <<', 'info');
    this.evaluate(function() {
        pliantInst.clear();
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'Emailaddress has no error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
    this.test.assertEvalEquals(function() {
        return birthdate.hasClass('pl-input-error');
    }, false, 'Birthdate has no error class.');
    this.test.assertEvalEquals(function() {
        return birthdate.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');
    this.test.assertEvalEquals(function() {
        return pliantInst.totalFields();
    }, 0, 'totalFields returns 0.');
});

casper.then(function validateField() {
    this.echo('>> Testing validateField. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {},
                length: {
                    min: 2, max: 4, message: 'length'
                }
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.totalFields();
    }, 1, 'totalFields returns 1.');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No errors showing.');

    this.evaluate(function() {
        pliantInst.validateField(username);
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'Required', 'Required error showing.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.validateField({
            field: username,
            rules: ['length']
        });
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error showing.');
});

casper.then(function remove() {
    this.echo('>> Testing remove. <<', 'info');
    this.evaluate(function() {
        pliantInst.remove(username);
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.totalFields();
    }, 0, 'totalFields returned 0.');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No visible error messages.');
});

casper.then(function validateRule() {
    this.echo('>> Testing validateRule. <<', 'info');
    this.test.assertEvalEquals(function() {
        return pliantInst.validateRule('custom', '123');
    }, false, 'Custom rule returned false.');
    this.test.assertEvalEquals(function() {
        return pliantInst.validateRule('custom', 'test');
    }, true, 'Custom rule returned true.');
});

casper.then(function toggle_field() {
    this.echo('>> Testing field toggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.add([{
            field: username,
            rules: {
                required: {}
            }
        }, {
            field: emailaddress,
            enabled: false,
            rules: {
                required: {}
            }
        }]);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.invalidCount();
    }, 1, 'One invalid field found.');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'Emailaddress has no error class.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.toggle(true, emailaddress);
        pliantInst.toggle(false, username);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.invalidCount();
    }, 1, 'One invalid field found.');
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');
});

casper.then(function toggle_field_rule() {
    this.echo('>> Testing field rule toggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.clear();
        pliantInst.add({
            field: username,
            rules: {
                required: {},
                length: { enabled: false, min: 2, max: 4, message: 'length' }
            }
        });
    });
    this.fill('form', {
        username: '1'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No visible error messages.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.toggle(true, username, 'length');
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error is visible.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.toggle(false, username, 'required');
        pliantInst.toggle(false, username, 'length');
    });
    this.fill('form', {
        username: ''
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error message shown.');
});

casper.then(function state() {
    this.echo('>> Testing state. <<', 'info');
    this.evaluate(function() {
        pliantInst.clear();
        pliantInst.add({
            field: username,
            rules: {
                required: {},
                length: { min: 2, max: 4, message: 'length' }
            }
        });
        pliantInst.state({
            field: username,
            rules: {
                length: false
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'Length error message is showing.');

    this.evaluate(function() {
        pliantInst.state([{
            field: username,
            rules: {
                length: true,
                required: false
            }
        }]);
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
                length: true,
                required: true
            }
        }]);
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error message are showing.');
});

casper.then(function option() {
    this.echo('>> Testing option. <<', 'info');
    this.test.assertEvalEquals(function() {
        return pliantInst.option('test');
    }, null, 'Option not found.');
    this.evaluate(function() {
        pliantInst.option('test', 'val');
    });
    this.test.assertEvalEquals(function() {
        return pliantInst.option('test');
    }, 'val', 'Option found.');
});

casper.then(function destroy() {
    this.echo('>> Testing destroy. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'No error message are showing.');
});

casper.run(function() {
    this.test.done();
});