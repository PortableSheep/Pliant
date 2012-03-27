/*!
 * MicroVal jQuery plugin v3.2.1 - http://bitbucket.org/rushtheweb/microval/
 * Copyright 2011-2012, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses. Same as jQuery.
 */
(function($) {
    $.microvalPlugins = {};
    $.fn.microval = function(o) {
        var opt = this.options = $.extend(true, {
            rules: {
                required: { validate: function() { return (this.is('[type=checkbox],[type=radio]') ? this.is(':checked') : ($.trim(this.val()).length > 0)); }, message: 'Required' },
                length: {
                    min: 0, max: 256, message: 'Invalid length',
                    validate: function(obj) {
                        var len = (this.val()).length, result = true;
                        result &= (obj.max ? (len <= obj.max) : true);
                        result &= (obj.min ? (len >= obj.min) : true);
                        return result;
                    }
                },
                numeric: { validate: function() { return /^\d+$/i.test(this.val()); }, message: 'Numeric only' }
            },
            fields: [], //Collection of field objects to add for validation on load.
            appendRulesToFieldClass: false, //If true, the fields class attribute will have rule names appended to it.
            reconcileFieldOrder: false, //If true, fields are added in the position they appear in the form, instead of the order they're added.
            haltOnFirstInvalidRule: true, //If true, validation is halted on the first invalid rule for the field.
            hideMessageContainerOnLoad: true, //If true, the message container is hidden on load, as long as the messageContainer option is supplied.
            validateOnFieldChange: true, //If true, fields are validated on their "change" event.
            focusFirstInvalidField: false, //If true, the first invalid field gains focus after validation of the form. Note: This can be out of order if you're not using the reconcileFiledOrder option and have added fields out of order.
            parseMarkup: false, //If true, comments above fields returned by the inputSelector, will be parsed for rules.
            ignoreHidden: true, //If true, fields that are hidden during validation are ignored.
            ignoreDisabled: true, //If true, fields that are disabled during validation are ignored.
            validateSubmit: true, //If true, validation will be attempted on form submission, as long as the container microval was envoked against is a form.
            validateSubmitSelector: null, //Defining a selector here causes submit validation to only occur for elements matching the selector. If unset, validation occures for any submit on the form.
            validateSubmitOn: 'click', //Determines the event to watch for on the validateSubmitSelector.
            validateSubmitScope: null, //A jQuery selector to use for the scope of the validate submit selector.
            inputSelector: ':input[type!=button]', //The input selector used when parsing HTML validation comments, or reconciling the field order.
            messageElement: '<label />', //The DOM element to use for the validation message.
            messageWrap: null, //The DOM element to wrap the validation message with.
            messageContainer: null, //The DOM element to place all validation messages in.
            messageElementClass: 'mv-element-error', //The CSS class to apply to the validation message DOM element.
            messageWrapClass: 'mv-wrap-error', //The CSS class to apply to the validation message wrapper DOM element.
            inputClass: 'mv-input-error' //The CSS class to apply to the invalid field element.
        }, o), _$this = $(this), _self = this, _invalidCount = 0, _fields = this.fields = [], _plugins = {}, _events = {},
        _trigger = function(e, context, data) {
            if (_events[e]) {
                if (_events[e] instanceof Array) {
                    for(var i in _events[e]) {
                        _events[e][i].apply(context, data||[]);
                    }
                } else {
                    _events[e].apply(context, data||[]);
                }
            }
        },
        _refreshState = function() {
            _invalidCount = 0;
            var msgSel = '.'+opt.messageElementClass;
            for(var i in _fields) {
                var curField = _fields[i];
                if (curField.isEnabled) {
                    var isValid = true;
                    for(var r in curField.rules) {
                        var rule = curField.rules[r];
                        if (rule.isEnabled === false || (opt.haltOnFirstInvalidRule && !Boolean(isValid))) {
                            rule.message.hide();
                            continue;
                        }
                        isValid &= (rule.isValid !== false);
                        rule.message.toggle((rule.isValid === false));
                    }
                    if ((curField.isValid = Boolean(isValid)) === false) {
                        _invalidCount++;
                        if (curField.field.is(':input')) {
                            curField.field.addClass(opt.inputClass);
                        }
                    } else if (curField.field.is(':input')) {
                        curField.field.removeClass(opt.inputClass);
                    }
                    if (curField.container) {
                        curField.container.toggle((curField.container.find(msgSel).filter(':mvVisible').length > 0));
                    }
                }
            }
            if (opt.messageContainer) {
                opt.messageContainer.toggle((opt.messageContainer.find(msgSel).filter(':mvVisible').length > 0));
            }
        },
        _extendRule = function(rule, extendFrom) {
            if (extendFrom) {
                for(var prop in extendFrom) {
                    if (!rule.hasOwnProperty(prop) && prop != 'inherit') {
                        rule[prop] = extendFrom[prop];
                    }
                }
            }
        },
        _prepRules = function(obj) {
            for(var i in obj.rules) {
                var rule = obj.rules[i], parentRule = opt.rules[i], inheritedRule = (parentRule && parentRule.inherit && opt.rules[parentRule.inherit] ? opt.rules[parentRule.inherit] : null);
                if ((rule.message === undefined || (rule.validate !== undefined && !(rule.validate instanceof Function))) && !parentRule) {
                    throw 'Rule `' + i + '` is invalid.';
                }
                if (parentRule || rule.hasOwnProperty('message')) {
                    _extendRule(rule, parentRule);
                    _extendRule(rule, inheritedRule);
                    rule.message = $(opt.messageElement).addClass(opt.messageElementClass).append(rule.message);
                    if (opt.messageWrap) {
                        rule.message = $(opt.messageWrap).addClass(opt.messageWrapClass).append(rule.message);
                    }
                    rule.message.hide();
                    if (opt.onMessagePlacement) {
                        _trigger('onMessagePlacement', obj.field, [rule.message]);
                    } else if (rule.container) {
                        $(rule.container).append(rule.message);
                    } else if (obj.container) {
                        $(obj.container).append(rule.message);
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
            this.isValid = true, this.isEnabled = true, this.isValidPrev = true;
            for(var i in obj) {
                this[i] = obj[i];
            }
            if (obj.validateOnChange || opt.validateOnFieldChange && obj.validateOnChange !== false) {
                this.field.bind('change', function changeVal(){
                    fInst.Validate(true);
                });
            }
            if (this.container) {
                this.container.hide();
            }
            _prepRules(obj);
            _trigger('onFieldAdded', this.field, [this]);
        },
        _addField = function(fieldObj) {
            if (fieldObj instanceof Array) {
                for(var i in fieldObj) {
                    _addField(fieldObj[i]);
                }
            } else if (fieldObj.field !== undefined && fieldObj.field.attr('id')) {
                if (opt.reconcileFieldOrder) {
                    var fieldDomIndex = _$this.find(opt.inputSelector).index(fieldObj.field);
                    _fields.splice((fieldDomIndex > -1 ? fieldDomIndex : _fields.length), 0, new _fieldObject(fieldObj));
                } else {
                    _fields.push(new _fieldObject(fieldObj));
                }
            }
        },
        _getFieldObjectIndex = function(fieldObj) {
            fieldObj = (!(fieldObj instanceof _fieldObject) && fieldObj.field === undefined) ? { field: fieldObj } : fieldObj;
            for(var i in _fields) {
                if (_fields[i].field.get(0) == fieldObj.field.get(0) || (_fields[i].field.attr('id') && (_fields[i].field.attr('id') == fieldObj.field.attr('id')))) {
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
                            _fields[i].field.toggleClass(name, enabled);
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
        _addMarkupRules = this.AddMarkupRules = function(o) {
            var selOptions = $.extend({ target: _$this, inputSelector: opt.inputSelector }, o);
            $(selOptions.inputSelector, selOptions.target).each(function() {
                var $this = $(this), prev = this.previousSibling, comments = [], fObj = { field: $this, rules: null};
                while(prev) {
                    if (prev.nodeType === 8 && /^\s*{.*}\s*$/.test(prev.nodeValue)) {
                        comments.splice(0, 0, prev.nodeValue);
                    } else if (prev.nodeType === 1) {
                        break;
                    }
                    prev = prev.previousSibling;
                }
                for(var i in comments) {
                    var obj = $.parseJSON(comments[i]), tmpRules = null;
                    if (obj && obj instanceof Object) {
                        tmpRules = obj;
                        if (obj.hasOwnProperty('field') && obj.field instanceof Object) {
                            for(var x in obj.field) {
                                fObj[x] = obj.field[x];
                            }
                            if (obj.hasOwnProperty('rules')) {
                                tmpRules = obj.rules;
                            } else { 
                               continue;
                            }
                        }
                        fObj.rules = (fObj.rules ? $.extend(true, fObj.rules, tmpRules) : tmpRules);
                    }
                }
                if (fObj.rules) {
                    _self.AddField(fObj);
                }
            });
        },
        _validateField = this.ValidateField = function(field) {
            if (field instanceof Array) {
                for(var i in field) {
                    _validateField(field[i]);
                }
            } else {
                if (!(field instanceof jQuery)) {
                    field = $(field);
                }
                var i = _getFieldObjectIndex(field);
                if (i == -1) {
                    throw 'Field `' + field.selector + '` cannot be found.';
                }                
                _fields[i].Validate(true, true);
            }
        };
        _fieldObject.prototype.Validate = function(refreshState, fromChain) {
            this.isValidPrev = this.isValid;
            this.isValid = true;
            if (this.isEnabled && !((this.field.is(':disabled') && opt.ignoreDisabled || this.field.is(':hidden') && opt.ignoreHidden)) && !(arguments.callee.caller.name == 'changeVal' && this.validateOnChange instanceof Function && this.validateOnChange.call(_self, this) === false)) {
                _trigger('onPreFieldValidate', _self, [this]);
                for(var i in this.rules) {
                    var rule = this.rules[i];
                    if (rule.isEnabled !== false) {
                        if (rule.validateOnChange !== undefined && rule.validateOnChange !== true && arguments.callee.caller.name == 'changeVal') {
                            if (rule.validateOnChange instanceof Function && rule.validateOnChange.call(_self, this) === false || rule.validateOnChange === false) {
                                rule.isValid = true;
                                continue;
                            }
                        }
                        if (opt.haltOnFirstInvalidRule && !this.isValid) {
                            break;
                        }
                        this.isValid &= rule.isValid = Boolean(rule.validate ? rule.validate.call(this.field, rule) : true);
                    }
                }
                if (refreshState) {
                    _refreshState();
                }
                _trigger('onPostFieldValidate', _self, [this, this.isValid]);
                if (opt.validateOnFieldChange) {
                    _trigger('onFieldValidate', _self, [this, this.isValid]);
                }
                if (this.chain && !fromChain && arguments.callee.caller.name == 'changeVal') {
                    if (this.chain instanceof Array) {
                        for(var c in this.chain) {
                            _validateField(this.chain[c]);
                        }
                    } else {
                        _validateField(this.chain);
                    }
                }
            }
            return this.isValid;
        };
        this.GetFieldRules = function(includeHidden, includeDisabled, includeFunctions, includeObjects) {
            var invalid = [];
            for(var i in _fields) {
                if (_fields[i].isEnabled && !(_fields[i].field.is(':hidden') && !includeHidden || _fields[i].field.is(':disabled') && !includeDisabled)) {
                    var invRules = [];
                    for(var r in _fields[i].rules) {
                        if (_fields[i].rules[r].isEnabled !== false) {
                            var props = [];
                            for(var key in _fields[i].rules[r]) {
                                var val = _fields[i].rules[r][key];
                                if (key == 'isValid' || key == 'isEnabled' || key == 'message' || val === undefined) {
                                    continue;
                                } else if (val instanceof jQuery) {
                                    val = val.attr('id');
                                } else if (val instanceof Function && !includeFunctions || val instanceof Object && !includeObjects) {
                                    continue;
                                }
                                if (val != undefined) {
                                    props.push({ key: key, value: val });
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
        this.Subscribe = function(e, handler) {
            if (_events[e]) {
                _events[e].push(handler);
            } else {
                _events[e] = [handler];
            }
            return this;
        },
        this.AddField = function(fieldObj) {
            if (fieldObj) {
                if (fieldObj instanceof Array) {
                    for(var i in fieldObj) {
                        this.AddField(fieldObj[i]);
                    }
                } else {
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
                _refreshState();
            }
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
            var isValid = true, invalidFocused = false;
            for(var i in _fields) {
                isValid &= _fields[i].Validate();
                if (opt.focusFirstInvalidField && !isValid && !invalidFocused) {
                    _trigger('onInvalidFieldFocus', _fields[i].field);
                    _fields[i].field.focus();
                    invalidFocused = true;
                }
            }
            _refreshState();
            isValid = Boolean(isValid);
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
                (opt.validateSubmitScope||_$this).on(opt.validateSubmitOn||'click', (opt.validateSubmitSelector instanceof jQuery ? opt.validateSubmitSelector.selector : opt.validateSubmitSelector), submitHandler);
            } else if (_$this.is('form')) {
                _$this.submit(submitHandler);
            }
        }
        if (!$.expr[':'].mvVisible) {
            $.expr[':'].mvVisible = function(a) { return ($(a).css('display') != 'none'); };
        }
        for(var rname in opt.rules) {
            if ((opt.rules[rname].message === undefined || (opt.rules[rname].validate !== undefined && !(opt.rules[rname].validate instanceof Function))) && opt.rules[rname].inherit === undefined) {
                throw 'Rule `' + rname + '` is invalid.';
            }
        }
        if (opt.hideMessageContainerOnLoad && opt.messageContainer) {
            opt.messageContainer.hide();
        }
        for(var oname in opt) {
            if (oname.slice(0, 2) == 'on' && (opt[oname] instanceof Function || opt[oname] instanceof Array)) {
                this.Subscribe(oname, opt[oname]);
            }
        }
        if ($.microvalPlugins && opt.plugins) {
            for(var pName in opt.plugins) {
                if ($.microvalPlugins.hasOwnProperty(pName)) {
                    _plugins[pName] = new $.microvalPlugins[pName](opt.plugins[pName], this);
                }
            }
        }
        _addField(opt.fields);
        _refreshState();
        if (opt.parseMarkup) {
            _addMarkupRules();
        }
        _trigger('onLoadComplete', [this]);
        return this;
    };
})(jQuery);