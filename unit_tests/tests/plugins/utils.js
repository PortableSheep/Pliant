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
                utils: {}
            },
            fields: [{
                field: username,
                rules: {
                    required:{
                        testfunc: function(){
                        },
                        testobj: {
                            test: 'derp'
                        }
                    }
                }
            }]
        });
    });
});

casper.then(function GetDefaults() {
    this.echo('>> Testing GetFieldRules output, with various options. <<', 'info');
    this.evaluate(function() {
        temp = pliantInst.GetFieldRules();
    });
    this.test.assertEvalEquals(function() {
        return temp.length;
    }, 1, 'One field found.');
    this.test.assertEvalEquals(function() {
        return temp[0].id == username.attr('id');
    }, true, 'Field is username.');
    this.test.assertEvalEquals(function() {
        return temp[0].rules.length;
    }, 1, 'One rule returned');
    this.test.assertEvalEquals(function() {
        return temp[0].rules[0].name;
    }, 'required', 'Rule is required.');
    this.test.assertEvalEquals(function() {
        return temp[0].rules[0].properties.length;
    }, 5, 'Rule has 5 properties.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testfunc") {
                ret = true;
                break;
            }
        }
        return ret;
    }, false, 'testfunc missing.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testobj") {
                ret = true;
                break;
            }
        }
        return ret;
    }, false, 'testobj missing.');

    this.evaluate(function() {
        temp = pliantInst.GetFieldRules(false, false, true, false);
    });
    this.test.assertEvalEquals(function() {
        return temp[0].rules[0].properties.length;
    }, 16, 'Rule has 16 properties.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testfunc") {
                ret = true;
                break;
            }
        }
        return ret;
    }, true, 'testfunc found.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testobj") {
                ret = true;
                break;
            }
        }
        return ret;
    }, false, 'testobj NOT found.');

    this.evaluate(function() {
        temp = pliantInst.GetFieldRules(false, false, true, true);
    });
    this.test.assertEvalEquals(function() {
        return temp[0].rules[0].properties.length;
    }, 17, 'Rule has 17 properties.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testfunc") {
                ret = true;
                break;
            }
        }
        return ret;
    }, true, 'testfunc found.');
    this.test.assertEvalEquals(function() {
        var ret = false;
        for(var i in temp[0].rules[0].properties) {
            var tmp = temp[0].rules[0].properties[i];
            if (tmp.key == "testobj") {
                ret = true;
                break;
            }
        }
        return ret;
    }, true, 'testobj found.');

    this.evaluate(function() {
        username.hide();
    });

    this.evaluate(function() {
        temp = pliantInst.GetFieldRules(false, false, true, true);
    });
    this.test.assertEvalEquals(function() {
        return temp.length;
    }, 0, 'No fields found.');

    this.evaluate(function() {
        temp = pliantInst.GetFieldRules(true, false, true, true);
    });
    this.test.assertEvalEquals(function() {
        return temp.length;
    }, 1, 'One fields found.');

    this.evaluate(function() {
        username.attr('disabled', true);
    });
    this.evaluate(function() {
        temp = pliantInst.GetFieldRules(true, true, true, true);
    });
    this.test.assertEvalEquals(function() {
        return temp.length;
    }, 1, 'One fields found.');
});

casper.run(function() {
    this.test.done();
});