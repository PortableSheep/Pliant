(function($) {
	$.pliantPlugin('inputsuccess', {
        options: {
            successInputClass: 'pl-input-success',
            successMessageClass: 'pl-element-success'
        },
        onFieldAdded: function(f) {
            if (f.successMessage) {
                f.successMessage = $('<label></label>').append(f.successMessage).addClass(this.options.successMessageClass).hide();
                f.field.after(f.successMessage);
            }
        },
        onFieldValidate: function(f) {
            if (f.successMessage) {
                if (f.valid && !f._.valid) {
                    f.field.addClass(this.options.successInputClass);
                    f.successMessage.show();
                } else {
                    f.field.removeClass(this.options.successInputClass);
                    f.successMessage.hide();
                }
            }
        }
    });
})(jQuery);