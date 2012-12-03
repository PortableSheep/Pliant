/*! v1.2 */
(function($) {
	$.pliantPlugins.decorator = function(options, plInst) {
        var opt = $.extend({}, options),
            _handleHide = function(obj) {
                for(var i in obj.rules) {
                    if (obj.rules[i].decorate && obj.rules[i].decorate.sync) {
                        obj.rules[i].decorate.content.hide();
                    }
                }
            },
            _handleShow = function(obj) {
                for(var i in obj.rules) {
                    if (obj.rules[i].decorate && obj.rules[i].decorate.sync) {
                        obj.rules[i].decorate.content.show();
                    }
                }
            };
        plInst.Subscribe('onFieldAdded', function(fieldObj) {
            if (fieldObj.decorate !== false) {
                for(var i in fieldObj.rules) {
                    if (fieldObj.rules[i].decorate === false) {
                        continue;
                    }
                    if (opt.hasOwnProperty(i)) {
                        fieldObj.rules[i].decorate = $.extend({}, opt[i]);
                        if (!(fieldObj.rules[i].decorate.content instanceof jQuery)) {
                            fieldObj.rules[i].decorate.content = $(fieldObj.rules[i].decorate.content);
                        }
                        var what = ($.isFunction(fieldObj.rules[i].decorate.what) ? fieldObj.rules[i].decorate.what.call(this) : fieldObj.rules[i].decorate.what);
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
                            fieldObj.field.hide = function() {
                                this._origHide.call(this);
                                _handleHide(fieldObj);
                            };
                            fieldObj.field.show = function() {
                                this._origShow.call(this);
                                _handleShow(fieldObj);
                            };
                        }
                        if (!fieldObj.field.is(':visible')) {
                            fieldObj.rules[i].decorate.content.hide();
                        }
                    }
                }
            }
        }).Subscribe('onFieldRemoved', function() {
            for(var i in this.rules) {
                if (this.rules[i].decorate) {
                    this.rules[i].decorate.content.remove();
                }
            }
        }).Subscribe('onFieldToggle', function(isEnabled) {
            for(var i in this.rules) {
                if (this.rules[i].decorate && this.rules[i].decorate.sync) {
                    this.rules[i].decorate.content.toggle(isEnabled);
                }
            }
        }).Subscribe('onFieldRuleToggle', function(isEnabled, name) {
            for(var i in this.rules) {
                if (name == i && this.rules[i].decorate && this.rules[i].decorate.sync) {
                    this.rules[i].decorate.content.toggle(isEnabled);
                }
            }
        });
    };
})(jQuery);