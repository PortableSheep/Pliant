/*!
 * MicroVal jQuery plugin v3.0 - http://bitbucket.org/rushtheweb/microval/
 * Copyright 2011-2012, Michael Gunderson - RushTheWeb.com
 * Dual licensed under the MIT or GPL Version 2 licenses. Same as jQuery.
 */
(function($) {
    $.fn.microval = function(o) {
        var opt = $.extend(true, {
            rules: {
                required: {
                    validate: function() {
                        return (this.is('[type=checkbox],[type=radio]') ? this.is(':checked') : ($.trim(this.val()).length > 0));
                    },
                    message: 'Required'
                },
                length: {
                    min: 0, max: 256,
                    validate: function(obj) {
                        var len = (this.val()).length, result = true;
                        result &= (obj.max ? (len <= obj.max) : true);
                        result &= (obj.min ? (len >= obj.min) : true);
                        return result;
                    },
                    message: 'Invalid length'
                },
                numeric: {
                    validate: function() {
                        return /^\d+$/i.test(this.val());
                    },
                    message: 'Numeric only'
                },
                email: {
                    validate: function() {
                        return /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/i.test(this.val());
                    },
                    message: 'Invalid email'
                }
            },
            fields: [], //Collection of field objects to add for validation on load.
            appendRulesToFieldClass: false, //If true, the fields class attribute will have rule names appended to it.
            reconcileFieldOrder: false, //If true, fields are added in the position they appear in the form, instead of the order they're added.
            haltOnFirstInvalidRule: true, //If true, validation is halted on the first invalid rule for the field.
            hideMessageContainerOnLoad: true, //If true, the message container is hidden on load, as long as the messageContainer option is supplied.
            validateOnFieldChange: true, //If true, fields are validated on their "change" event.
            focusFirstInvalidField: false, //If true, the first invalid field gains focus after validation of the form. Note: This can be out of order if you're not using the reconcileFiledOrder option and have added fields out of order.
            ignoreHidden: true, //If true, fields that are hidden during validation are ignored.
            ignoreDisabled: true, //If true, fields that are disabled during validation are ignored.
            validateSubmit: true, //If true, validation will be attempted on form submission, as long as the container microval was envoked against is a form.
            validateSubmitSelector: null, //Defining a selector here causes submit validation to only occur for elements matching the selector. If unset, validation occures for any submit on the form.
            validateSubmitOn: 'click', //Determines the event to watch for on the validateSubmitSelector.
            inputSelector: ':input[type!=button]', //The input selector used when parsing HTML validation comments, or reconciling the field order.
            parseMarkup: false, //If true, the containers fields will be scraped for HTML comments containing validation rules, and the rules will be registered.
            messageElement: '<label />', //The DOM element to use for the validation message.
            messageWrap: null, //The DOM element to wrap the validation message with.
            messageContainer: null, //The DOM element to place all validation messages in.
            messageElementClass: 'mv-element-error', //The CSS class to apply to the validation message DOM element.
            messageWrapClass: 'mv-wrap-error', //The CSS class to apply to the validation message wrapper DOM element.
            inputClass: 'mv-input-error', //The CSS class to apply to the invalid field element.
            onFieldAdded: null, //Fired when a field has been added. The 'this' context is the field, and the first param is the field object.
            onFieldValidate: null, //Fired when a field is validated on change. The 'this' context is the plugin instance, the first param is the field, and the second is a bool indicating the validity.
            onFormValidate: null, //Fired when the form is validated. The 'this' context is the plugin instance, the first param is the fields collection, and the second is a bool indicating the validity.
            onMessagePlacement: null, //Fired when rule messages are placed. The first param is the message being placed in the DOM, and you're responsible for inserting it.
            onInvalidFieldFocus: null //Fired when an invalid field is auto focused when focusFirstInvalidField is enabled. The 'this' context is the field being focused.
        }, o), _$this = $(this), _self = this, _invalidCount = 0, _fields = [],
        _trigger = function(event, context, data) {
            if (opt[event]) {
                if (opt[event] instanceof Array) {
                    for(var i in opt[event]) {
                        opt[event][i].apply(context, data||[]);
                    }
                } else {
                    opt[event].apply(context, data||[]);
                }
            }
        },
        _refreshState = function() {
            var invalidFocused = false;
            _invalidCount = 0;
            for(var i in _fields) {
                if (_fields[i].isEnabled) {
                    var isValid = true;
                    for(var r in _fields[i].rules) {
                        var rule = _fields[i].rules[r];
                        if (rule.isEnabled === false || (opt.haltOnFirstInvalidRule && !Boolean(isValid))) {
                            rule.message.hide();
                            continue;
                        }
                        isValid &= (rule.isValid !== false);
                        if (rule.isValid !== false) {
                            _fields[i].rules[r].message.hide();
                        } else {
                            _fields[i].rules[r].message.show();
                        }
                    }
                    if ((_fields[i].isValid = Boolean(isValid)) === false) {
                        _invalidCount++;
                        if (_fields[i].field.is(':input')) {
                            _fields[i].field.addClass(opt.inputClass);
                            if (opt.focusFirstInvalidField && !invalidFocused) {
                                _trigger('onInvalidFieldFocus', _fields[i].field);
                                _fields[i].field.focus();
                                invalidFocused = true;
                            }
                        }
                    } else {
                        if (_fields[i].field.is(':input')) {
                            _fields[i].field.removeClass(opt.inputClass);
                        }
                    }
                }
            }
            if (opt.messageContainer && _invalidCount > 0) {
                opt.messageContainer.show();
            } else if (opt.messageContainer && _invalidCount <= 0) {
                opt.messageContainer.hide();
            }
        },
        _prepRules = function(obj) {
            for(var i in obj.rules) {
                var rule = obj.rules[i];
                if (opt.rules[i] || rule.validate) {
                    if (opt.rules[i]) {
                        for(var prop in opt.rules[i]) {
                            if ((prop != 'message' || prop != 'validate') && !rule[prop]) {
                                rule[prop] = opt.rules[i][prop];
                            }
                        }
                    }
                    rule.message = $(opt.messageElement).append(rule.message||(opt.rules[i] && opt.rules[i].message ? opt.rules[i].message : '')).addClass(opt.messageElementClass);
                    if (opt.messageWrap) {
                        rule.message = $(opt.messageWrap).append(rule.message).addClass(opt.messageWrapClass);
                    }
                    rule.message.hide();
                    if (opt.onMessagePlacement) {
                        _trigger('onMessagePlacement', obj.field, rule.message);
                    } else if (rule.container) {
                        $(rule.container).append(rule.message);
                    } else if (opt.messageContainer) {
                        opt.messageContainer.append(rule.message);
                    } else {
                        obj.field.after(rule.message);
                    }
                    if (opt.appendRulesToFieldClass) {
                        obj.field.addClass(i);
                    }
                }
            }
        },
        _fieldObject = function(obj) {
            var fInst = this;
            this.field = obj.field, this.rules = obj.rules, this.isValid = true, this.isEnabled = true;
            if (obj.validateOnChange || opt.validateOnFieldChange && obj.validateOnChange !== false) {
                this.field.bind('change', function(){
                    fInst.Validate();
                    _refreshState();
                });
            }
            _prepRules(obj);
            _trigger('onFieldAdded', this.field, this);
        },
        _addField = function(fieldObj) {
            if (fieldObj instanceof Array) {
                for(var i in fieldObj) {
                    _addField(fieldObj[i]);
                }
            } else {
                if (fieldObj.field !== undefined && fieldObj.field.attr('id')) {
                    if (opt.reconcileFieldOrder) {
                        var fieldDomIndex = _$this.find(opt.inputSelector).index(fieldObj.field);
                        _fields.splice((fieldDomIndex > -1 ? fieldDomIndex : _fields.length), 0, new _fieldObject(fieldObj));
                    } else {
                        _fields.push(new _fieldObject(fieldObj));
                    }
                }
            }
        },
        _getFieldObjectIndex = function(fieldObj) {
            fieldObj = (!(fieldObj instanceof _fieldObject) && fieldObj.field === undefined) ? { field: fieldObj } : fieldObj;
            for(var i in _fields) {
                if (_fields[i].field == fieldObj.field || _fields[i].field.attr('id') == fieldObj.field.attr('id')) {
                    return i;
                }
            }
            return -1;
        },
        _removeField = this.RemoveField = function(field) {
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                for (var x in _fields[i].rules) {
                    _fields[i].rules[x].message.remove();
                    if (opt.appendRulesToFieldClass) {
                        _fields[i].field.removeClass(x);
                    }
                }
                _fields.splice(i, 1);
            }
        },
        _setFieldEnabled = this.SetFieldEnabled = function(field, enabled) {
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                _fields[i].isEnabled = enabled;
            }
        },
        _setFieldRuleEnabled = this.SetFieldRuleEnabled = function(field, rule, enabled) {
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                for(var name in _fields[i].rules) {
                    if (name == rule) {
                        _fields[i].rules[name].isEnabled = enabled;
                        if (opt.appendRulesToFieldClass) {
                            if (enabled) {
                                _fields[i].field.addClass(name);
                            } else {
                                _fields[i].field.removeClass(name);
                            }
                        }
                        break;
                    }
                }
            }
        },
        _validateRule = this.ValidateRule = function(rule, obj) {
            return (opt.rules[rule]) ? opt.rules[rule].validate(obj) : false;
        },
        _resetState = this.ResetState = function(field) {
            if (field == undefined) {
                for (var i in _fields) {
                    _fields[i].isValid = true;
                    for(var m in _fields[i].rules) {
                        _fields[i].rules[m].isValid = true;
                    }
                }
            } else {
                var index = _getFieldObjectIndex(field);
                if (index > -1) {
                    _fields[index].isValid = true;
                    for(var r in _fields[index].rules) {
                        _fields[index].rules[r].isValid = true;
                    }
                }
            }
            _refreshState();
        },
        _setState = this.SetState = function(obj) {
            if (obj instanceof Array) {
                for(var i in obj) {
                    _setState(obj[i]);
                }
            } else {
                var index = _getFieldObjectIndex(obj.field);
                if (index > -1) {
                    for(var rName in obj.rules) {
                        if (_fields[index].rules[rName]) {
                            _fields[index].rules[rName].isValid = obj.rules[rName];
                        }
                    }
                    _refreshState();
                }
            }
        },
        _addMarkupRules = this.AddMarkupRules = function(target) {
            $(opt.inputSelector, target||_$this).each(function() {
                var $this = $(this), prev = this.previousSibling, rules = null, comments = [];
                while(prev) {
                    if (prev.nodeType === 8 && /^\s*{.*}\s*$/.test(prev.nodeValue)) {
                        comments.splice(0, 0, prev.nodeValue);
                    } else if (prev.nodeType === 1) {
                        break;
                    }
                    prev = prev.previousSibling;
                }
                for(var i = 0; i < comments.length; i++) {
                    var obj = $.parseJSON(comments[i]);
                    if (obj && obj instanceof Object) {
                        rules = (rules ? $.extend(true, rules, obj) : obj);
                    }
                }
                if (rules) {
                    _self.AddField({ field: $this, rules: rules });
                }
            });
        };
        _fieldObject.prototype.Validate = function() {
            this.isValid = true;
            if (this.isEnabled && !((this.field.is(':disabled') && opt.ignoreDisabled || this.field.is(':hidden') && opt.ignoreHidden))) {
                for(var i in this.rules) {
                    var rule = this.rules[i];
                    if (rule.isEnabled !== false) {
                        if (opt.haltOnFirstInvalidRule && !this.isValid) {
                            break;
                        }
                        this.isValid &= rule.isValid = (rule.validate) ? Boolean(rule.validate.call(this.field, rule)) : Boolean(opt.rules[i].validate.call(this.field, rule));
                    }
                }
                if (opt.validateOnFieldChange && opt.onFieldValidate) {
                    _trigger('onFieldValidate', _self, [this, this.isValid]);
                }
            }
            return this.isValid;
        };
        this.Subscribe = function(event, handler) {
            if (handler instanceof Function){
                if (opt[event] instanceof Array) {
                    opt[event].push(handler);
                } else {
                    opt[event] = (opt[event] ? [opt[event], handler] : [handler]);
                }
                return this;
            }
            return false;
        },
        this.AddField = function(fieldObj) {
            if (fieldObj) {
                var i = _getFieldObjectIndex(fieldObj);
                if (i > -1 && fieldObj.rules !== undefined) {
                    for(var name in fieldObj.rules) {
                        if (_fields[i].rules[name]) {
                            _fields[i].rules[name].message.remove();
                        }
                    }
                    _prepRules(fieldObj);
                    _fields[i].rules = $.extend(true, _fields[i].rules, fieldObj.rules);
                } else if (i == -1) {
                    _addField(fieldObj);
                }
                _refreshState();
            }
        },
        this.GetFieldRules = function(includeHidden, includeDisabled) {
            var invalid = [];
            for(var i in _fields) {
                if (_fields[i].isEnabled && !(_fields[i].field.is(':hidden') && !includeHidden || _fields[i].field.is(':disabled') && !includeDisabled)) {
                    var invRules = [];
                    for(var r in _fields[i].rules) {
                        if (_fields[i].rules[r].isEnabled !== false) {
                            var props = [];
                            for(var p in _fields[i].rules[r]) {
                                if (p != 'validate' && p != 'message' && p != 'isValid' && p != 'isEnabled') {
                                    var val = _fields[i].rules[r][p];
                                    if (val instanceof jQuery) {
                                        val = val.attr('id');
                                    }
                                    props.push({ key: p, value: val });
                                }
                            }
                            invRules.push({ name: r, properties: props });
                        }
                    }
                    invalid.push({ id: _fields[i].field.attr('id'), rules: invRules});
                }
            }
            return invalid;
        },
        this.GetInvalidCount = function() { return _invalidCount; },
        this.TotalFields = function() { return _fields.length; },
        this.ClearFields = function() {
            for(var i in _fields) {
                for(var x in _fields[i].rules) {
                    _fields[i].rules[x].message.remove();
                    if (opt.appendRulesToFieldClass) {
                        _fields[i].field.removeClass(x);
                    }
                }
            }
            _fields = [];
            _invalidCount = 0;
            _refreshState();
        },
        this.Validate = function() {
            var isValid = true;
            for(var i in _fields) {
                isValid &= _fields[i].Validate();
            }
            _refreshState();
            isValid = Boolean(isValid);
            if (!isValid) {
                if (opt.messageContainer) {
                    opt.messageContainer.show();
                }
            }
            _trigger('onFormValidate', this, [_fields, isValid]);
            return isValid;
        };
        if (opt.validateSubmit) {
            var submitHandler = function(e) {
                if (!_self.Validate()) {
                    e.preventDefault();
                }
            };
            if (opt.validateSubmitSelector) {
                _$this.on(opt.validateSubmitOn||'click', opt.validateSubmitSelector, submitHandler);
            } else if (_$this.is('form')) {
                _$this.submit(submitHandler);
            }
        }
        _addField(opt.fields);
        if (opt.parseMarkup) {
            _addMarkupRules();
        }
        if (opt.hideMessageContainerOnLoad && opt.messageContainer) {
            opt.messageContainer.hide();
        }
        _refreshState();
        return this;
    };
})(jQuery);