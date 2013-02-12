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
        ready = true;
        fieldCol = [];
        toggledFields = [];
        toggledRules = [];
        validated = {};
        fullValidate = {};
        focused = null;
        container = $('<div></div>').insertAfter('form');
        pliantInst = $('form').pliant({
            focusFirstInvalidField: true,
            onReady: function() {
                ready = this;
            },
            onMessagePlacement: function(f, m) {
                f.before(m);
            },
            onFieldAdded: function(obj) {
                fieldCol.push(obj);
            },
            onFieldRemoved: function(obj) {
                var index;
                for(var i in fieldCol) {
                    if (fieldCol[i].field[0] == obj.field[0] || fieldCol[i].field.attr('id') === obj.field.attr('id')) {
                        index = i;
                        break;
                    }
                }
                if (index) {
                    fieldCol.splice(i, 1);
                }
            },
            onFieldToggle: function(field) {
                toggledFields.push(field);
            },
            onRuleToggle: function(name, field, rule) {
                toggledRules.push({
                    name: name,
                    field: field,
                    rule: rule
                });
            },
            onPreFieldValidate: function(field) {
                validated.pre = field;
            },
            onPostFieldValidate: function(field) {
                validated.post = field;
            },
            onFieldValidate: function(field) {
                validated.curr = field;
            },
            onFormValidate: function(fields, valid) {
                fullValidate.fields = fields;
                fullValidate.valid = valid;
            },
            onInvalidFieldFocus: function(field) {
                focused = field;
            }
        });
    });
});

casper.then(function CheckReady(){
    this.echo('>> Testing onReady. <<', 'info');
    this.test.assertEvalEquals(function() {
        return ready.hasOwnProperty('validate');
    }, true, 'Ready event triggered.');
});

casper.then(function CheckMessagePlacement() {
    this.echo('>> Testing onMessagePlacement. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });

    this.test.assertEvalEquals(function() {
        return username.prev().text();
    }, 'Required', 'Required message placed correctly.');
});

casper.then(function CheckFieldAdded() {
    this.echo('>> Testing onFieldAdded. <<', 'info');
    this.test.assertEvalEquals(function() {
        return fieldCol.length == 1 && fieldCol[0].field[0] == username[0];
    }, true, 'One field found.');
});

casper.then(function CheckFieldRemoved() {
    this.echo('>> Testing onFieldRemoved. <<', 'info');
    this.evaluate(function() {
        pliantInst.remove(username);
    });
    this.test.assertEvalEquals(function() {
        return fieldCol.length;
    }, 0, 'No fields found in collection.');

  this.test.assertEvalEquals(function() {
        return username.prev('.pl-element-error').length;
    }, 0, 'Required message removed');
});

casper.then(function OnFieldToggle() {
    this.echo('>> Testing onFieldToggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.add({
            field: username,
            rules: {
                required: {},
                length: {}
            }
        });
        pliantInst.toggle(false, username);
    });
    this.test.assertEvalEquals(function() {
        var field = toggledFields[toggledFields.length-1].field;
        return field[0] == username[0] && !field.enabled;
    }, true, 'Last toggled field is username.');
});

casper.then(function OnRuleToggle() {
    this.echo('>> Testing onRuleToggle. <<', 'info');
    this.evaluate(function() {
        pliantInst.toggle(false, username, 'length');
    });
    this.test.assertEvalEquals(function() {
        var obj = toggledRules[toggledRules.length-1];
        return obj.field[0] == username[0] && obj.name == 'length' && !obj.rule.enabled;
    }, true, 'Last toggle rule is length for username.');
});

casper.then(function OnPreCurrPostValidate() {
    this.echo('>> Testing field validation events. <<', 'info');
    this.evaluate(function() {
        pliantInst.clear();
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return validated.pre.field[0] == username[0] && validated.post.field[0] == username[0] && validated.curr.field[0] == username[0];
    }, true, 'Validated var is set properly.');
});

casper.then(function OnFormValidate() {
    this.echo('>> Testing onFormValidate. <<', 'info');
    this.evaluate(function() {
        pliantInst.reset();
        pliantInst.validate();
    });

    this.test.assertEvalEquals(function() {
        return fullValidate.fields.length == 1 && !fullValidate.valid;
    }, true, 'Full validate populated.');
});

casper.then(function OnInvalidFieldFocus() {
    this.echo('>> Testing onInvalidFieldFocus. <<', 'info');
    this.test.assertEvalEquals(function() {
        return focused != null;
    }, true, 'Focused populated.');
});

casper.then(function Destroy() {
    this.echo('>> Testing destroy. <<', 'info');
    this.evaluate(function() {
        pliantInst.destroy();
    });
});

casper.then(function PostInitMessagePlacement() {
    this.echo('>> Testing onMessagePlacement (post init). <<', 'info');
    this.evaluate(function() {
        pliantInst.on('onMessagePlacement', function(field, msg){
            field.parent().before(msg);
        });
        pliantInst.add({
            field: username,
            rules: {
                required: {}
            }
        });
    });
    this.test.assertEvalEquals(function() {
        return username.parent().prev().text();
    }, 'Required', 'Required message placed correctly.');
});

casper.run(function() {
    this.test.done();
});