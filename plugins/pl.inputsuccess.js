(function($) {
	$.pliantPlugins.inputsuccess = function(options, plInst) {
        var opt = $.extend({
            successInputClass: 'pl-input-success',
            successMessageClass: 'pl-element-success'
        }, options);
        plInst.Subscribe('onFieldAdded', function(f) {
            if (f.successMessage) {
                f.successMessage = $('<label></label>').append(f.successMessage).addClass(opt.successMessageClass).hide();
                f.field.after(f.successMessage);
            }
        }).Subscribe('onFieldValidate', function(f, isValid) {
            if (f.successMessage) {
                if (isValid && !f.isValidPrev) {
                    f.field.addClass(opt.successInputClass);
                    f.successMessage.show();
                } else {
                    f.field.removeClass(opt.successInputClass);
                    f.successMessage.hide();
                }
            }
        });
    };
})(jQuery);