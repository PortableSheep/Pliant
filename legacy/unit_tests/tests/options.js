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
        //Ignoring messageContainer because it's getting hit elsewhere.
        //Ignoring validateOnSubmit as it's tested elsewhere.
        //Ignoring inputSelector
        pliantInst = $('form').pliant({
            appendRulesToFieldClass: false,
            reconcileFieldOrder: false,
            haltOnFirstInvalidRule: true,
            hideMessageContainerOnLoad: false,
            validateOnChange: true,
            focusFirstInvalidField: false,
            ignoreHidden: true,
            ignoreDisabled: true,
            messageElement: '<label />',
            messageWrap: null,
            messageElementClass: 'pl-element-error',
            messageWrapClass: 'pl-wrap-error',
            inputClass: 'pl-input-error'
        });
    });
});

casper.then(function AppendRulesToFieldClass() {
    this.echo('>> Testing appendRulesToFieldClass. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('required');
    }, false, 'Rule name missing from class.');

    this.evaluate(function() {
        pliantInst.clear();
        pliantInst.option('appendRulesToFieldClass', true);
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    })

    this.test.assertEvalEquals(function() {
        return username.hasClass('required');
    }, true, 'Rule name found in class.');
});

casper.then(function ignoreHidden() {
    this.echo('>> Testing ignoreHidden. <<', 'info');
    this.echo('Testing hidden field skipping.');
    this.evaluate(function() {
        username.hide();
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username missing error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'Username errors are not showing.');

    this.evaluate(function() {
        pliantInst.option('ignoreHidden', false);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 1, 'Username errors are showing.');
    this.evaluate(function() {
        pliantInst.option('ignoreHidden', true);
        pliantInst.reset();
        username.show();
    });
});

casper.then(function ignoreDisabled() {
    this.echo('>> Testing ignoreDisabled. <<', 'info');
    this.evaluate(function() {
        username.attr('disabled', true);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username skipped because its disabled.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 0, 'Username errors missing because its disabled.');
    this.evaluate(function() {
        pliantInst.option('ignoreDisabled', false);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 1, 'Username errors shown.');
    this.evaluate(function() {
        username.attr('disabled', false);
        pliantInst.option('ignoreDisabled', true);
        pliantInst.reset();
    });
});

casper.then(function reconcileFieldOrder() {
    this.echo('>> Testing reconcileFieldOrder. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.clear();
        pliantInst.add([{
            field: emailaddress,
            rules: {
                required: {}
            }
        }, {
            field: username,
            rules: {
                required: {}
            }
        }]);
    });

    this.test.assertEvalEquals(function() {
        return pliantInst.fields()[0].field[0] == emailaddress[0];
    }, true, 'Fields in order added');

    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.option('reconcileFieldOrder', true);
        pliantInst.add([{
            field: emailaddress,
            rules: {
                required: {}
            }
        }, {
            field: username,
            rules: {
                required: {}
            }
        }]);
    });

    this.test.assertEvalEquals(function() {
        return pliantInst.fields()[0].field[0] == username[0];
    }, true, 'Fields re-ordered.');
});

casper.then(function haltOnFirstInvalidRule() {
    this.echo('>> Testing haltOnFirstInvalidRule. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.add({
            field: username,
            rules: {
                required: {},
                length: {
                    min: 2, max: 10, message: 'length'
                }
            }
        });
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 1, 'One error showing.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.option('haltOnFirstInvalidRule', false);
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').length;
    }, 2, 'Both errors showing.');
});

casper.then(function validateOnChange() {
    this.echo('>> Testing validateOnChange. <<', 'info');
    this.evaluate(function() {
        pliantInst.option('haltOnFirstInvalidRule', true);
        pliantInst.destroy();
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');

    this.fill('form', {
        username: '1'
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');

    this.evaluate(function() {
        pliantInst.destroy();
        username.val('');
        pliantInst.option('validateOnChange', false);
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        pliantInst.validate();
    });

    this.fill('form', {
        username: '1'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.fill('form', {
        username: ''
    });
});

casper.then(function focusFirstInvalidField() {
    this.echo('>> Testing focusFirstInvalidField. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        username.on('focus.test', function() {
            $(this).addClass('focused');
        }).on('blur.test', function() {
            $(this).removeClass('focused');
        });
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        submit.click();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('focused');
    }, false, 'Username is NOT focused.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.option('focusFirstInvalidField', true);
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('focused');
    }, true, 'Username is focused.');

    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.option('focusFirstInvalidField', false);
        username.off('.test');
    });
});

casper.then(function Field_validateOnChange() {
    this.echo('>> Testing field validateOnChange. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.option('validateOnChange', true);
        pliantInst.add([{
            field: username,
            rules: {
                required: {},
                length: {
                    min: 2, max: 10, message: 'length', validateOnChange: false
                }
            }
        }, {
            field: emailaddress,
            validateOnChange: false,
            rules: {
                required: {}
            }
        }]);
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');

    this.fill('form', {
        username: '1',
        emailaddress: '1'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has NO error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'Emailaddress has error class.');

    this.fill('form', {
        username: '12'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has no error class.');

    this.fill('form', {
        username: '1'
    });
    this.evaluate(function() {
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error:visible').text();
    }, 'length', 'length error is showing.');

    this.evaluate(function() {
        username.val('');
        emailaddress.val('');
        pliantInst.destroy();
        pliantInst.add([{
            field: username,
            rules: {
                required: {},
                length: {
                    min: 2, max: 10, message: 'length', validateOnChange: function() {
                        return ($(this).val() == 'z' || $(this).val() == 'zz');
                    }
                }
            }
        }, {
            field: emailaddress,
            validateOnChange: function() {
                return (birthdate.val() == 'true');
            },
            rules: {
                required: {}
            }
        }]);
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'emailaddress has error class.');

    this.fill('form', {
        username: '1',
        emailaddress: '1'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has NO error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, true, 'emailaddress has error class.');

    this.fill('form', {
        username: 'z',
        birthdate: 'true',
        emailaddress: '2'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, true, 'Username has error class.');
    this.test.assertEvalEquals(function() {
        return emailaddress.hasClass('pl-input-error');
    }, false, 'emailaddress has NO error class.');

    this.fill('form', {
        username: 'zz'
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('pl-input-error');
    }, false, 'Username has NO error class.');

    this.evaluate(function() {
        pliantInst.destroy();
        username.val('');
        emailaddress.val('');
        birthdate.val('');
    });
});

casper.then(function messageElement() {
    this.echo('>> Testing messageElement and messageElementClass. <<', 'info');
    this.evaluate(function() {
        pliantInst.option('messageElement', '<div />');
        pliantInst.option('messageElementClass', 'pl-element-error-custom');
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error-custom').is('div');
    }, true, 'Username error is div.');
    this.evaluate(function() {
        pliantInst.option('messageElement', '<label />');
        pliantInst.option('messageElementClass', 'pl-element-error');
        pliantInst.destroy();
    });
});

casper.then(function messageWrap() {
    this.echo('>> Testing messageWrap. <<', 'info');
    this.evaluate(function() {
        $('form').find('.pl-element-error, .pl-element-error-custom').remove();
        pliantInst.option('messageWrap', '<span />');
        pliantInst.option('messageWrapClass', 'pl-wrap-error-custom');
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error').parent().is('span');
    }, true, 'Username error wrap is span.');
    this.test.assertEvalEquals(function() {
        return username.parent().find('.pl-element-error').parent().hasClass('pl-wrap-error-custom');
    }, true, 'Username error wrap has custom class.');
    this.evaluate(function() {
        pliantInst.option('messageWrap', null);
        pliantInst.destroy();
    });
});

casper.then(function inputClass() {
    this.echo('>> Testing inputClass. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
        pliantInst.option('inputClass', 'invalid-class');
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        pliantInst.validate();
    });
    this.test.assertEvalEquals(function() {
        return username.hasClass('invalid-class');
    }, true, 'Input class successfully changed and applied.');
});

casper.run(function() {
    this.test.done();
});