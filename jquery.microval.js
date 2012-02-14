/*!
 * MicroVal jQuery plugin v1.8
 * http://bitbucket.org/rushtheweb/microval/
 * Copyright 2011-2012, Michael Gunderson - RushTheWeb.com
 * Dual licensed under the MIT or GPL Version 2 licenses. Same as jQuery.
 */
(function($) {
    $.fn.microval = function(o) {
        var opt = $.extend(true, {
            rules: {
                required: {
                    validate: function() { return (this.is('[type=checkbox],[type=radio]') ? this.is(':checked') : ($.trim(this.val()).length > 0)); },
                    message: 'Required'
                },
                length: {
                    validate: function(obj) {
                        var result = true, len = (this.val()).length;
                        if (obj.max) {
                            result &= (len <= obj.max);
                        }
                        if (obj.min) {
                            result &= (len >= obj.min);
                        }
                        return result;
                    },
                    message: 'Invalid length'
                },
                numeric: {
                    validate: function() { return /^\d+$/i.test(this.val()); },
                    message: 'Numeric only'
                },
                email: {
                    validate: function() { return /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/i.test(this.val()); },
                    message: 'Invalid email'
                }
            },
            fields: [], //Collection of field objects to add for validation on load.
            reconcileFieldOrder: false, //If true, fields are added in the position they appear in the form, instead of the order they're added.
            haltOnFirstInvalidRule: true, //If true, validation is halted on the first invalid rule for the field.
            hideMessageContainerOnLoad: true, //If true, the message container is hidden on load, as long as the messageContainer option is supplied.
            validateOnFieldChange: true, //If true, fields are validated on their "change" event.
            focusFirstInvalidField: false, //If true, the first invalid field gains focus after validation of the form. Note: This can be out of order if you're not using the reconcileFiledOrder option and have added fields out of order.
            ignoreHidden: true, //If true, fields that are hidden during validation are ignored.
            validateSubmit: true, //If true, validation will be attempted on form submission, as long as the container microval was envoked against is a form.
            inputSelector: ':input[type!=button]', //The input selector used when parsing HTML validation comments, or reconciling the field order.
            parseMarkup: false, //If true, the containers fields will be scraped for HTML comments containing validation rules, and add whatever is valid and found.
            messageElement: '<label />', //The DOM element to use for the validation message.
            messageWrap: null, //The DOM element to wrap the validation message with.
            messageContainer: null, //The DOM element to place all validation messages in.
            messageElementClass: 'mv-element-error', //The CSS class to apply to the validation message DOM element.
            messageWrapClass: 'mv-wrap-error', //The CSS class to apply to the validation message wrapper DOM element.
            inputClass: 'mv-input-error', //The CSS class to apply to the invalid field element.
            onFieldValidate: null, //The field validate event. Listeners will receive the microval instance as the "this" context, with the first param being the field being validated, and the second being a bool indicating the validity.
            onFormValidate: null, //The form validate event. Listeners will receive the microval instance as the "this" context, with the first param being a collection of the fields validated, and the second being a bool indicating the overall validity of the form.
            onMessagePlacement: null, //The message placement event. Listeners will receive the message being placed in the DOM, and are responsible for inserting it wherever they require.
            onInvalidFieldFocus: null //The invalid field focus event. Listerns will receive the field in question as the "this" context. This only fires if focusFirstInvalidField is true.
        }, o), _$this = $(this), _self = this, _invalidCount = 0, _fields = [],
        _prepRules = function(obj) {
            for(var i in obj.rules) {
                var rule = obj.rules[i];
                if (opt.rules[i] || rule.validate) {
                    rule.message = $(opt.messageElement).append(rule.message||(opt.rules[i] && opt.rules[i].message ? opt.rules[i].message : '')).addClass(opt.messageElementClass);
                    if (opt.messageWrap) {
                        rule.message = $(opt.messageWrap).append(rule.message).addClass(opt.messageWrapClass);
                    }
                    rule.message.hide();
                    if (opt.onMessagePlacement) {
                        opt.onMessagePlacement.call(obj.field, rule.message);
                    } else if (rule.container) {
                        $(rule.container).append(rule.message);
                    } else if (opt.messageContainer) {
                        opt.messageContainer.append(rule.message);
                    } else {
                        obj.field.after(rule.message);
                    }
                }
            }
        },
        _fieldObject = function(obj) {
            var fInst = this;
            this.field = obj.field, this.rules = obj.rules, this.isValid = true, this.isEnabled = true;
            _prepRules(obj);
            if (opt.validateOnFieldChange) {
                this.field.bind('change', function(){ fInst.Validate(); });
            }
        },
        _addField = function(fieldObj) {
            if (fieldObj instanceof Array) {
                for(var i in fieldObj) {
                    _addField(fieldObj[i]);
                }
            } else {
                if (opt.reconcileFieldOrder) {
                    var fieldDomIndex = _$this.find(opt.inputSelector).index(fieldObj.field);
                    _fields.splice((fieldDomIndex > -1 ? fieldDomIndex : _fields.length), 0, new _fieldObject(fieldObj));
                } else {
                    _fields.push(new _fieldObject(fieldObj));
                }
            }
        },
        _getFieldObjectIndex = function(fieldObj) {
            if (!(fieldObj instanceof _fieldObject) && fieldObj.field === undefined) {
                fieldObj = { field: fieldObj };
            }
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
                        break;
                    }
                }
            }
        },
        _validateRule = this.ValidateRule = function(rule, obj) {
            return (opt.rules[rule]) ? opt.rules[rule].validate(obj) : false;
        },
        _resetState = this.ResetState = function() {
            for (var i in _fields) {
                if (!_fields[i].isValid) {
                    for(var m in _fields[i].rules) {
                        _fields[i].rules[m].message.hide();
                    }
                    _fields[i].field.removeClass(opt.inputClass);
                }
                _fields[i].isValid = true;
            }
            _invalidCount = 0;
            if (opt.messageContainer) {
                opt.messageContainer.hide();
            }
        },
        _focusInvalidField = function() {
            if (opt.focusFirstInvalidField) {
                for (var i in _fields) {
                    if (!_fields[i].isValid) {
                        if (opt.onInvalidFieldFocus) {
                            opt.onInvalidFieldFocus.call(_fields[i].field);
                        } else {
                            _fields[i].field.focus();
                        }
                        break;
                    }
                }
            }
        },
        _addMarkupRules = this.AddMarkupRules = function(target) {
            $(opt.inputSelector, target||_$this).each(function() {
                var $this = $(this), prev = this.previousSibling, rules = {}, hasRules = false, comments = [];
                while(prev) {
                    if (prev.nodeType === 8) {
                        comments.splice(0, 0, prev.nodeValue);
                    } else if (prev.nodeType === 1) {
                        break;
                    }
                    prev = prev.previousSibling;
                }
                for(var i = 0; i < comments.length; i++) {
                    var match = /\s*validate:(\w+)(?:\[\s*(.*)\s*\]\s*)*/i.exec(comments[i]);
                    if (match) {
                        var name = match[1], options = (match[2]) ? match[2].split(/\s*\|\s*/) : null;
                        if (opt.rules[name]) {
                            hasRules = true;
                            var ruleObj = { };
                            for(var index in options) {
                                var parsed = options[index].split(':', 2);
                                if (parsed) {
                                    var key = parsed[0], val = parsed[1].replace(/^['"]|['"]$/ig, '');
                                    switch(key) {
                                        case 'container':
                                            var tmp = $(val);
                                            if (tmp.length) {
                                                ruleObj[key] = tmp;
                                            }
                                        break;
                                        default:
                                            ruleObj[key] = val;
                                        break;
                                    }
                                }
                            }
                            rules[name] = ruleObj;
                        }
                    }
                }
                if (hasRules) {
                    _self.AddField({field: $this, rules: rules});
                }
            });
        };
        _fieldObject.prototype.Validate = function() {
            if (this.isEnabled) {
                var prevValid = this.isValid;
                this.isValid = true;
                for(var i in this.rules) {
                    var rule = this.rules[i];
                    if (rule.isEnabled || rule.isEnabled == undefined) {
                        if (opt.haltOnFirstInvalidRule && this.isValid) {
                            var ret = (rule.validate) ? Boolean(rule.validate.call(this.field, rule)) : Boolean(opt.rules[i].validate.call(this.field, rule));
                            if (ret) {
                                rule.message.hide();
                            } else {
                                rule.message.show();
                            }
                            this.isValid &= ret;
                        } else {
                            rule.message.hide();
                        }
                    }
                }
                if (this.isValid) {
                    this.field.removeClass(opt.inputClass);
                } else {
                    this.field.addClass(opt.inputClass);
                }
                if (this.isValid && !prevValid && _invalidCount > 0) {
                    _invalidCount--;
                } else if (prevValid && !this.isValid) {
                    _invalidCount++;
                }
                if (opt.validateOnFieldChange && opt.onFieldValidate) {
                    opt.onFieldValidate.call(_self, this, this.isValid);
                }
                if (opt.messageContainer && _invalidCount > 0) {
                    opt.messageContainer.show();
                } else if (opt.messageContainer && _invalidCount <= 0) {
                    opt.messageContainer.hide();
                }
                return this.isValid;
            }
            return true;
        };
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
            }
        },
        this.GetInvalidCount = function() { return _invalidCount; },
        this.TotalFields = function() { return _fields.length; },
        this.ClearFields = function() {
            for(var i in _fields) {
                for(var x in _fields[i].rules) {
                    _fields[i].rules[x].message.remove();
                }
            }
            _fields = [];
            _invalidCount = 0;
        },
        this.Validate = function() {
            var isValid = true;
            for(var i in _fields) {
                if (opt.ignoreHidden && !_fields[i].field.is(':visible')) { _fields[i].isValid = true; continue; }
                isValid &= _fields[i].Validate();
            }
            isValid = Boolean(isValid);
            if (!isValid) {
                _focusInvalidField();
                if (opt.messageContainer) {
                    opt.messageContainer.show();
                }
            }
            if (opt.onFormValidate) {
                opt.onFormValidate.call(this, _fields, isValid);
            }
            return isValid;
        };
        if (opt.validateSubmit && _$this.is('form')) {
            _$this.submit(function(e) {
                if (!_self.Validate()) {
                    e.preventDefault();
                }
            });
        }
        _addField(opt.fields);
        if (opt.parseMarkup) {
            _addMarkupRules();
        }
        if (opt.hideMessageContainerOnLoad && opt.messageContainer) {
            opt.messageContainer.hide();
        }
        return this;
    };
})(jQuery);