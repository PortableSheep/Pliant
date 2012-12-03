/*! v1.1 */
(function($) {
	$.pliantPlugins.decorator = function(options, plInst) {
        var opt = $.extend({}, options);
        plInst.Subscribe('onFieldAdded', function(fieldObj) {
            for(var i in fieldObj.rules) {
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