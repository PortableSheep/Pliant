/*! v1.0 */
(function($) {
	$.pliantPlugins.decorator = function(options, plInst) {
        var opt = $.extend({}, options);
        plInst.Subscribe('onFieldAdded', function(fieldObj) {
            if (fieldObj.decorate) {
                if (fieldObj.decorate.rule && !fieldObj.rules[fieldObj.decorate.rule]) {
                    return;
                }
                if (typeof(fieldObj.decorate) === 'string' && opt.items[fieldObj.decorate]) {
                    fieldObj.decorate = $.extend({}, opt.items[fieldObj.decorate]);
                }
                fieldObj.decorate.content = (fieldObj.decorate.content instanceof jQuery ? fieldObj.decorate.content.clone() : $(fieldObj.decorate.content));
                var what = (fieldObj.decorate.what instanceof Function ? fieldObj.decorate.what.call(this) : fieldObj.decorate.what);

                switch(fieldObj.decorate.how.toLowerCase()) {
                    case 'prepend':
                        what.prepend(fieldObj.decorate.content);
                    break;
                    case 'append':
                        what.append(fieldObj.decorate.content);
                    break;
                    case 'before':
                        what.before(fieldObj.decorate.content);
                    break;
                    case 'after':
                        what.after(fieldObj.decorate.content);
                    break;
                    default:
                    break;
                }
            }
        }).Subscribe('onFieldRemoved', function() {
            if (this.decorate) {
                this.decorate.content.remove();
            }
        }).Subscribe('onFieldToggle', function(isEnabled) {
            if (this.decorate && this.decorate.sync) {
                this.decorate.content.toggle(isEnabled);
            }
        }).Subscribe('onFieldRuleToggle', function() {
            if (this.decorate && this.decorate.sync) {
                var hasEnabled = false;
                for(var i in this.rules) {
                    if (this.rules[i].isEnabled === undefined || this.rules[i].isEnabled === true) {
                        if (this.decorate.rule && this.decorate.rule !== i) {
                            continue;
                        }
                        hasEnabled = true;
                        break;
                    }
                }
                this.decorate.content.toggle(hasEnabled);
            }
        });
    };
})(jQuery);