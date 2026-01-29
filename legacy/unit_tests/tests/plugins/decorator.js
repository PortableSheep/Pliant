casper.start('unit_tests/index.html', function InitTest() {
    this.echo('Testing for title, form, and setting up init pliant.', 'info');
    this.test.assertTitle('Pliant Test Suite', 'Title is found.');
    this.test.assertExists('form[action="#"]', 'Form found.');
    this.evaluate(function() {
        $('.pl-decorator').remove();
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
        container = $('<div></div>').appendTo($('form'));
        pliantInst = $('form').pliant({
            plugins: {
                decorator: {
                    required: {
                        content: '<span class="pl-decorator">*</span>',
                        how: 'before',
                        sync: true,
                        what: function() {
                            return this;
                        }
                    },
                    after: {
                        content: '<span class="pl-decorator">*</span>',
                        how: 'after',
                        what: function() {
                            return this;
                        }
                    },
                    append: {
                        content: '<span class="pl-decorator-append">*</span>',
                        how: 'append',
                        what: function() {
                            return container;
                        }
                    },
                    prepend: {
                        content: '<span class="pl-decorator-prepend">*</span>',
                        how: 'prepend',
                        what: function() {
                            return container;
                        }
                    }
                }
            },
            rules: {},
            fields: [
                {
                    field: username,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: emailaddress,
                    decorate: false,
                    rules: {
                        required: {}
                    }
                },
                {
                    field: birthdate,
                    rules: {
                        required: {
                            decorate: false
                        }
                    }
                },
                {
                    field: address1,
                    rules: {
                        after: {
                            message: 'after',
                            validate: function() {
                                return false;
                            }
                        },
                        append: {
                            message: 'append',
                            validate: function() {
                                return false;
                            }
                        },
                        prepend: {
                            message: 'prepend',
                            validate: function() {
                                return false;
                            }
                        }
                    }
                }
            ]
        });
    });
});

casper.then(function InitAndSync() {
    this.echo('>> Testing decorator init, and sync. <<', 'info');
    this.test.assertEvalEquals(function() {
        return username.prev().is('span') && username.prev().hasClass('pl-decorator') && username.prev().text() == '*';
    }, true, 'Astrisk found before username.');
    this.test.assertEvalEquals(function() {
        return emailaddress.prev().is('span') && emailaddress.prev().hasClass('pl-decorator') && emailaddress.prev().text() == '*';
    }, false, 'Astrisk not found before emailaddress.');
    this.test.assertEvalEquals(function() {
        return birthdate.prev().is('span') && birthdate.prev().hasClass('pl-decorator') && birthdate.prev().text() == '*';
    }, false, 'Astrisk found before birthdate.');

    this.test.assertEvalEquals(function() {
        return address1.next().is('span') && address1.next().hasClass('pl-decorator') && address1.next().text() == '*';
    }, true, 'Astrisk found after address1.');
    this.test.assertEvalEquals(function() {
        return container.find(':first').is('span') && container.find(':first').hasClass('pl-decorator-prepend');
    }, true, 'Astrisk found prepended to container.');
    this.test.assertEvalEquals(function() {
        return container.find(':last').is('span') && container.find(':last').hasClass('pl-decorator-append');
    }, true, 'Astrisk found appended to container.');

    this.evaluate(function() {
        username.hide();
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, false, 'Astrisk is hidden due to field being hidden.');

    this.evaluate(function() {
        username.show();
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, true, 'Astrisk is shown due to field being visible.');
});

casper.then(function Remove() {
    this.echo('>> Testing removal. <<', 'info');
    this.evaluate(function() {
        pliantInst.remove(username);
    });

    this.test.assertEvalEquals(function() {
        return username.prev().is('span') && username.prev().hasClass('pl-decorator') && username.prev().text() == '*';
    }, false, 'Astrisk has been removed.');
});

casper.then(function Add() {
    this.echo('>> Testing post init add. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.prev().is('span') && username.prev().hasClass('pl-decorator') && username.prev().text() == '*';
    }, true, 'Astrisk found before username.');
});

casper.then(function Toggle() {
    this.echo('>> Testing toggle sync. <<', 'info');
    this.evaluate(function() {
        pliantInst.toggle(false, username);
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, false, 'Astrisk is hidden due to field being hidden.');

    this.evaluate(function() {
        pliantInst.toggle(true, username);
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, true, 'Astrisk is shown due to field being visible.');

    this.evaluate(function() {
        pliantInst.toggle(false, username, 'required');
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, false, 'Astrisk is hidden due to field being hidden.');

    this.evaluate(function() {
        pliantInst.toggle(true, username, 'required');
    });
    this.test.assertEvalEquals(function() {
        return username.prev('span.pl-decorator').is(':visible');
    }, true, 'Astrisk is shown due to field being visible.');
});

casper.run(function() {
    this.test.done();
});