(function($) {
    'use strict';

    //Custom selector for checking if items are visible, even if their parent is hidden.
    if (!$.expr[':'].plVisible) {
        $.expr[':'].plVisible = function(a) { return ($(a).css('display') != 'none'); };
    }

    //Create the global pliantPlugin API if it's mising.
    if (!$.pliantPlugin) {
        $.pliantPlugin = function(name, base) {
            pliantPlugins[name] = base;
        };
    }

    //Create a local scoped store for the loaded plugins, and create the base object for a plugin.
    var pliantPlugins = {},
        pliantBasePlugin = function(name, opt, inst) {
            //Store the plugins main instance, and loop the properties of the base plugin object, cloning them to this instance.
            this.instance = inst;
            for(var prop in pliantPlugins[name]) {
                var curr = pliantPlugins[name][prop];
                if ($.isArray(curr)) {
                    this[prop] = (this[prop]) ? this[prop].concat(curr) : curr;
                } else if ($.isPlainObject(curr)) {
                    this[prop] = (this[prop]) ? $.extend(true, {}, this[prop], curr) : curr;
                } else {
                    this[prop] = curr;
                }
            }
            this.options = $.extend(true, {}, pliantPlugins[name].options, opt);
            this._create.call(this);
        };

    //Define the properties each plugin should have.
    pliantBasePlugin.prototype = {
        instance: null, options: {}, _create: $.noop, _ready: $.noop
    };

    //Main plugin.
    $.fn.pliant = function(opt) {
        var o = $.extend(true, {
            fields: [],
            appendRulesToFieldClass: false,
            reconcileFieldOrder: false,
            haltOnFirstInvalidRule: true,
            hideMessageContainerOnLoad: true,
            validateOnChange: true,
            focusFirstInvalidField: false,
            ignoreHidden: true,
            ignoreDisabled: true,
            validateOnSubmit: true,
            validateOnSubmitSelector: null,
            validateOnSubmitEvent: 'click',
            validateOnSubmitScope: null,
            inputSelector: ':input[type!=button]',
            messageElement: '<label />',
            messageWrapElement: null,
            messageContainer: null,
            messageElementClass: 'pl-element-error',
            messageWrapClass: 'pl-wrap-error',
            inputClass: 'pl-input-error',
            rules: {
                required: {
                    validate: function() {
                        return (this.is('[type=checkbox],[type=radio]') ? this.is(':checked') : ($.trim(this.val()).length > 0));
                    },
                    message: 'Required'
                },
                length: {
                    min: 0, max: 256, message: 'Invalid length',
                    validate: function(obj) {
                        var len = (this.val().replace(/\n/g, '\r\n')).length, result = true;
                        result &= (obj.max ? (len <= obj.max) : true);
                        result &= (obj.min ? (len >= obj.min) : true);
                        return result;
                    }
                }
            }
        }, opt), inst = this, $this = $(this), _plugins = {}, _events = {}, _fields = [], _invalid = 0,
        //Field object.
        _pliantField = function(obj) {
            this._ = { valid: true };
            this.valid = this.enabled = true;
            this.validateOnChange = this.container = this.field = null;
            this.rules = {};
            //Pull in the object properties from the defined field.
            for(var i in obj) {
                if (i !== 'rules' && i !== '_') {
                    this[i] = obj[i];
                }
            }
            //Hook up the change validation if needed.
            if (this.validateOnChange || o.validateOnChange && this.validateOnChange !== false) {
                this.field.on('change.pliant', $.proxy(function() {
                    this.validate(null, true, false, true);
                }, this));
            }
            //Hide the field level error container if available.
            if (this.container) {
                this.container.hide();
            }
            //Add all the rules.
            for(var i in obj.rules) {
                this.rules[i] = new _pliantRule(i, this, obj.rules[i]);
            }
        },
        //Rule object.
        _pliantRule = function(name, fobj, rule) {
            this.message = this.validate = this.inherit = this.messageWrap = this.container = this.validateOnChange = this.expectedResult = null;
            this._ = { message: null, field: null, name: null };
            this.valid = this.enabled = true;
            //Pull in the object properties from the defined rule.
            for(var i in rule) {
                if (i !== '_') {
                    this[i] = rule[i];
                }
            }
            //Get the parent/base rule, and it's inherited rule if available.
            var parent = o.rules[name], inherit = (parent && parent.inherit && o.rules[parent.inherit] ? o.rules[parent.inherit] : null);
            //If there is no message, or validate, and no parent... error.
            if ((this.message === undefined || (this.validate !== undefined && !($.isFunction(this.validate)))) && !parent) {
                throw 'Rule `' + name + '` is invalid.';
            }
            //If there is a parent, or a message.
            if (parent || this.message) {
                //Extend our base with the parent and inherited object props.
                this._extend(parent);
                this._extend(inherit);
                //Store the original message for later.
                this._.message = this.message;
                //Style the message, and wrap it in the required element.
                this.message = $(o.messageElement).addClass(o.messageElementClass).append(this.message);
                //If a message wrap element is defined, wrap the message in it, and add the class.
                if (o.messageWrap) {
                    this.message = $(o.messageWrap).addClass(o.messageWrapClass).append(this.message);
                }
                //Hide the message, and the container if available.
                this.message.hide();
                if (this.container) {
                    this.container.hide();
                }
                if (o.onMessagePlacement) {
                    //Hand off the message placement to the event handler.
                    _trigger('onMessagePlacement', fobj.field, [this.message]);
                } else if (this.container) {
                    //Append to the rules container.
                    $(this.container).append(this.message);
                } else if (fobj.container) {
                    //Append to the fields rule container.
                    $(fobj.container).append(this.message);
                } else if (o.messageContainer) {
                    //Append to the global rules container.
                    o.messageContainer.append(this.message);
                } else {
                    //Place it after the field.
                    fobj.field.after(this.message);
                }
                //Add the rule name as a css class on the field if able.
                if (o.appendRulesToFieldClass) {
                    fobj.field.addClass(name);
                }
            }
            this._.field = fobj.field;
            this._.name = name;
        },
        _loadPlugins = function() {
            if (pliantPlugins && o.plugins) {
                for(var plugin in o.plugins) {
                    if (pliantPlugins[plugin]) {
                        _plugins[plugin] = new pliantBasePlugin(plugin, o.plugins[plugin], inst);
                    }
                }
            }
        },
        _trigger = function(e, data) {
            if (!$.isArray(data)) {
                data = [data];
            } else if (!data) {
                data = [];
            }
            if (_events[e]) {
                if ($.isArray(_events[e])) {
                    for(var i in _events[e]) {
                        _events[e][i].apply(inst, data);
                    }
                } else {
                    _events[e].apply(inst, data);
                }
            }
            for(var i in _plugins) {
                if (_plugins[i][e] && $.isFunction(_plugins[i][e])) {
                    _plugins[i][e].apply(_plugins[i], data);
                }
            }
        },
        _subscribe = function(e, hndlr) {
            //If handlers for the event already exist, push this one into the collection. Otherwise, make a new collection.
            if (_events[e]) {
                _events[i].push(hndlr);
            } else {
                _events[i] = [hndlr];
            }
            return this;
        },
        _parseEvents = function() {
            //Loop the options, find any starting with 'on' that are functions or arrays. Subscribe them.
            for(var i in o) {
                if (i.slice(0,2) === 'on' && ($.isFunction(o[i]) || $.isArray(o[i]))) {
                    _subscribe(i, o[i]);
                }
            }
        },
        _getFieldObjectIndex = function(obj) {
            //Make sure we have an object in the expected format.
            obj = (!(obj instanceof _pliantField) && obj.field === undefined) ? { field: obj } : obj;
            //If it's a selector string, wrap it.
            if (obj.field instanceof String) {
                obj.field = $(obj.field);
            }
            //Loop the fields, and if the fields DOM is the same, or their IDs are the same... return the index.
            for(var i in _fields) {
                var field = _fields[i].field;
                if (field[0] == obj.field[0] || (field.attr('id') && (field.attr('id') == obj.field.attr('id')))) {
                    return i;
                }
            }
            return -1;
        },
        _addField = function(obj, refresh) {
            if (obj) {
                if ($.isArray(obj)) {
                    //We're adding a collection of fields... loop them and add each one.
                    for(var i in obj) {
                        _addField(obj[i]);
                    }
                } else if (obj.field instanceof String || (obj.field !== undefined && obj.field.attr('id'))) {
                    //Find the index for the field, if it already exists.
                    var i = _getFieldObjectIndex(obj);
                    if (i > -1 && obj.rules !== undefined) {
                        //The field was added already, so lets just destroy any rules we're re-defining, and add them back or add new ones to the field.
                        for(var name in obj.rules) {
                            if (_fields[i].rules[name]) {
                                _fields[i].rules[name]._destroy();
                            }
                            _fields[i].rules[name] = new _pliantRule(name, (_fields[i].rules[name] ? _fields[i] : obj), obj.rules[name]);
                        }
                    } else if (i == -1) {
                        var field = new _pliantField(obj, o);
                        //If reconcile is on, make sure the fields are added in the order they're listed on the form.
                        if (o.reconcileFieldOrder) {
                            var index = $this.find(o.inputSelector).index(obj.field);
                            _fields.splice((index > -1 ? index : _fields.length), 0, field);
                        } else {
                            _fields.push(field);
                        }
                        _trigger('onFieldAdded', field);
                    }
                    //Only refresh the UI if needed, since you might not want to when adding an array of fields.
                    if (refresh) {
                        _refreshState();
                    }
                }
            }
        },
        _clearFields = function() {
            //Destroy all the fields, reset the collection, reset the invalid count, and refresh the UI.
            for(var i in _fields) {
                _fields[i]._destroy();
            }
            _fields = [];
            _invalid = 0;
            _refreshState();
        },
        _removeField = function(field) {
            //Find the field if possible, and destroy it.
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                _trigger('onFieldRemoved', _fields[i]);
                _fields[i]._destroy();
                _refreshState();
            }
        },
        _toggleField = function(field, enabled) {
            //Find the field if possible, and toggle its enabled state.
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                _fields[i]._toggle(enabled);
            }
        },
        _toggleRule = function(field, rule, state) {
            //Find the field if possible, and tell it to toggle a rule if possible.
            var i = _getFieldObjectIndex(field);
            if (i > -1) {
                _fields[i]._toggleRule(rule, state);
            }
        },
        _resetState = function(field) {
            if (field) {
                var i = _getFieldObjectIndex(field);
                if (i > -1) {
                    _fields[i].valid = true;
                    for(var r in _fields[i].rules) {
                        _fields[i].rules[r].valid = true;
                    }
                }
            } else {
                for(var i in _fields) {
                    _fields[i].valid = true;
                    for(var r in _fields[i].rules) {
                        _fields[i].rules[r].valid = true;
                    }
                }
            }
            _refreshState();
        },
        _refreshState = function() {
            _invalid = 0;
            for(var i in _fields) {
                var field = _fields[i];
                if (field.enabled) {
                    if (field.valid == false) {
                        _invalid++;
                    }
                    field._refresh();
                }
            }
            if (o.messageContainer) {
                o.messageContainer.toggle(o.messageContainer.find('.' + o.messageElementClass).filter(':plVisible').length > 0);
            }
        },
        _validate = function() {
            var valid = true, invalidFocus = false;
            //Loop the fields, check validation, and store result.
            for(var i in _fields) {
                valid &= _fields[i].validate(arguments, false, false, false);
                if (o.focusFirstInvalidField && !valid && !invalidFocus) {
                    //Focus first invalid field if possible.
                    _trigger('onInvalidFieldFocus', _fields[i]);
                    _fields[i].field.focus();
                    invalidFocus = true;
                }
            }
            //Refresh the state for the user, ensure the return is a bool, trigger the validate event, and return the result.
            _refreshState();
            valid = Boolean(valid);
            _trigger('onFormValidate', [_fields, valid]);
            return valid;
        },
        _validateField = function(field) {
            //If we're validating multiple fields... loop it.
            if (field instanceof Array) {
                for(var i in field) {
                    _validateField(field[i]);
                }
            } else {
                var i = -1, rules = null;
                if ($.isPlainObject(field) && field.field && (field.rules && ($.isArray(field.rules) || typeof(field.rules) === 'string'))) {
                    //They provided specific rules to validate for the field, so pull them out for validation.
                    i = _getFieldObjectIndex(field.field);
                    rules = (field.rule ? [field.rule] : field.rules);
                } else {
                    i = _getFieldObjectIndex(field);
                }
                if (i == -1) {
                    throw 'Field `' + (field instanceof jQuery ? field.selector : field) + '` cannot be found.';
                }
                return _fields[i].validate(null, true, true, false, rules);
            }
        },
        _validateRule = function(rule, obj) {
            return (o.rules[rule] ? o.rules[rule].validate(obj) : false);
        };

        //Field prototype.
        _pliantField.prototype = {
            _destroy: function() {
                //Remove the namespaced events.
                this.field.off('.pliant');
                //Loop the rules, and destroy them.
                for(var i in this.rules) {
                    this.rules[i]._destroy();
                }
                //Remove it from the collection.
                _fields.splice(i, 1);
            },
            _refresh: function() {
                this.field.toggleClass(o.inputClass, !this.valid);
                if (!this.valid) {
                    for(var i in this.rules) {
                        this.rules[i]._refresh();
                    }
                }
                if (this.container) {
                    this.container.toggle(this.container.find('.' + o.messageElementClass).filter(':plVisible').length > 0);
                }
            },
            _toggle: function(state) {
                this.enabled = state;
                _trigger('onFieldToggle', this);
            },
            _toggleRule: function(rule, state) {
                for(var i in this.rules) {
                    if (i === rule) {
                        this.rules[i]._toggle(state);
                        break;
                    }
                }
            },
            validate: function(data, refreshState, fromChain, fromChange, ruleFilter) {
                this._.valid = this.valid;
                this.valid = true;
                if (this.enabled && !((this.field.is(':disabled') && o.ignoreDisabled || this.field.is(':hidden') && o.ignoreHidden)) && !(fromChange && $.isFunction(this.validateOnChange) && this.validateOnChange.call(this.field, this) === false)) {
                    _trigger('onPreFieldValidate', this);
                    for(var i in this.rules) {
                        var rule = this.rules[i];
                        if (ruleFilter && ruleFilter.length > 0 && ruleFilter.indexOf(i) === -1) {
                            rule.valid = true;
                            continue;
                        }
                        if (rule.enabled === false || (o.haltOnFirstInvalidRule && !Boolean(this.valid))) {
                            rule.valid = true;
                            continue;
                        }
                        this.valid &= rule._validate(fromChange, data);
                        if (o.haltOnFirstInvalidRule & !rule.valid) {
                            break;
                        }
                    }
                    if (refreshState) {
                        _refreshState();
                    }
                    _trigger('onPostFieldValidate', this);
                    if (o.validateOnChange) {
                        _trigger('onFieldValidate', this);
                    }
                    if (this.chain && !fromChain && fromChange) {
                        _validateField(this.chain);
                    }
                }
                return this.valid;
            }
        };
        //Rule prototype.
        _pliantRule.prototype = {
            _validate: function(fromChange, args) {
                if (this.enabled) {
                    if ((this.validateOnChange && this.validateOnChange !== true && fromChange) && ($.isFunction(this.validateOnChange) && this.validateOnChange.call(this._.field, this) === false || this.validateOnChange === false)) {
                        this.valid = true;
                        this._refresh();
                        return this.valid;
                    }
                    var res = this.validate ? this.validate.apply(this._.field, (args ? $.merge([this], args) : [this])) : true;
                    this.valid = Boolean(this.expectedResult ? (res === this.expectedResult) : res);
                    this._refresh();
                    return this.valid;
                }
            },
            _refreshContainer: function() {
                if (this.container) {
                    this.container.toggle(this.container.find('.' + o.messageElementClass).filter(':plVisible').length > 0);
                }
            },
            _refresh: function() {
                this.message.toggle(!this.valid);
                this.ResetMessage();
                this._refreshContainer();
            },
            _extend: function(from) {
                if (from) {
                    for(var i in from) {
                        if (!this[i] && i !== 'inherit') {
                            this[i] = from[i];
                        }
                    }
                }
            },
            _destroy: function() {
                //Remove the message, and the rule name from the field class.
                this.message.remove();
                if (o.appendRulesToFieldClass) {
                    this._.field.removeClass(this._.name);
                }
            },
            _toggle: function(state) {
                this.enabled = state;
                if (o.appendRulesToFieldClass) {
                    this._.field.toggleClass(this._.name, state);
                }
                _trigger('onRuleToggle', [this._.name, this._.field, this]);
            },
            ResetMessage: function() {
                if  (this._.message && this.message[0].innerHTML !== this._.message) {
                    this.message.html(this._.message);
                }
            },
            SetMessage: function(msg) {
                if (msg.length > 0) {
                    this.message.html(msg);
                }
            }
        };

        //Hide the message container if possible.
        if (o.hideMessageContainerOnLoad && o.messageContainer) {
            o.messageContainer.hide();
        }

        //Bind submit event.
        if (o.validateOnSubmit) {
            //Create a submit handler.
            var subHndlr = function(e) {
                if (!_validate()) {
                    e.preventDefault();
                }
            };
            if (o.validateOnSubmitSelector) {
                //If a custom selector is defined...
                var scope = $this;
                if (o.validateOnSubmitScope) {
                    //Get the custom scope.
                    scope = (o.validateOnSubmitScope instanceof jQuery ? o.validateOnSubmitScope : $(o.validateOnSubmitScope));
                }
                //Bind to the custom submit event, and selector if possible.
                scope.on(o.validateOnSubmitEvent||'click', (o.validateOnSubmitSelector instanceof jQuery ? o.validateOnSubmitSelector.selector : o.validateOnSubmitSelector), subHndlr);
            } else if ($this.is('form')) {
                //Validate of the form submit.
                $this.on('submit', subHndlr);
            }
        }

        //Load all the plugins.
        _loadPlugins();
        //Auto subscribe to events.
        _parseEvents();
        //Add field passed on init.
        _addField(o.fields);
        //Refresh validation state.
        _refreshState();

        //Public functions
        this.Subscribe = _subscribe;
        this.Validate = _validate;
        this.ResetState = _resetState;
        this.ClearFields = _clearFields;
        this.ValidateField = _validateField;
        this.ValidateRule = _validateRule;
        this.TotalFields = function() { return _fields.length; };
        this.GetInvalidCount = function() { return _invalid; };
        this.AddField = function(field) { return _addField(field, true); };
        this.Destroy = function() {
            _resetState();
            _clearFields();
            _events = [];
        };

        //Trigger ready event.
        _trigger('onReady');
        return this;
    };
})(jQuery);