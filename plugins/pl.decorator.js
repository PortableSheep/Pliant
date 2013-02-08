/*! v1.3 */
(function($) {
    $.pliantPlugin('decorator', {
        options: {},
        _handleHide: function(obj) {
            for(var i in obj.rules) {
                if (obj.rules[i].decorate && obj.rules[i].decorate.sync) {
                    obj.rules[i].decorate.content.hide();
                }
            }
        },
        _handleShow: function(obj) {
            for(var i in obj.rules) {
                if (obj.rules[i].decorate && obj.rules[i].decorate.sync) {
                    obj.rules[i].decorate.content.show();
                }
            }
        },
        onFieldAdded: function(fieldObj) {
            if (fieldObj.decorate !== false) {
                for(var i in fieldObj.rules) {
                    if (fieldObj.rules[i].decorate === false) {
                        continue;
                    }
                    if (this.options.hasOwnProperty(i)) {
                        fieldObj.rules[i].decorate = $.extend({}, this.options[i]);
                        if (!(fieldObj.rules[i].decorate.content instanceof jQuery)) {
                            fieldObj.rules[i].decorate.content = $(fieldObj.rules[i].decorate.content);
                        }
                        var what = ($.isFunction(fieldObj.rules[i].decorate.what) ? fieldObj.rules[i].decorate.what.call(fieldObj.field) : fieldObj.rules[i].decorate.what);
                        switch(fieldObj.rules[i].decorate.how.toLowerCase()) {
                            case 'prepend':
                                what.prepend(fieldObj.rules[i].decorate.content);
                            break;
                            case 'append':
                                what.append(fieldObj.rules[i].decorate.content);
                            break;
                            case 'before':
                                what.before(fieldObj.rules[i].decorate.content);
                            break;
                            case 'after':
                                what.after(fieldObj.rules[i].decorate.content);
                            break;
                            default:
                            break;
                        }
                        if (fieldObj.rules[i].decorate.sync && !fieldObj.field._origHide && !fieldObj.field._origShow) {
                            fieldObj.field._origHide = fieldObj.field.hide;
                            fieldObj.field._origShow = fieldObj.field.show;
                            fieldObj.field.hide = $.proxy(function() {
                                fieldObj.field._origHide.call(fieldObj.field);
                                this._handleHide(fieldObj);
                            }, this);
                            fieldObj.field.show = $.proxy(function() {
                                fieldObj.field._origShow.call(fieldObj.field);
                                this._handleShow(fieldObj);
                            }, this);
                        }
                        if (!fieldObj.field.is(':visible')) {
                            fieldObj.rules[i].decorate.content.hide();
                        }
                    }
                }
            }
        },
        onFieldRemoved: function(fieldObj) {
            for(var i in fieldObj.rules) {
                if (fieldObj.rules[i].decorate) {
                    fieldObj.rules[i].decorate.content.remove();
                }
            }
        },
        onFieldToggle: function(fieldObj) {
            for(var i in fieldObj.rules) {
                if (fieldObj.rules[i].decorate && fieldObj.rules[i].decorate.sync) {
                    fieldObj.rules[i].decorate.content.toggle(fieldObj.enabled);
                }
            }
        },
        onRuleToggle: function(name, fieldObj, ruleObj) {
            if (ruleObj.decorate && ruleObj.decorate.sync) {
                ruleObj.decorate.content.toggle(ruleObj.enabled);
            }
        }
    });
})(jQuery);