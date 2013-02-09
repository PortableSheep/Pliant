/*! v1.1.0 */
(function($) {
    $.pliantPlugin('inputhint', {
        options: {
            hintClass: 'plHint'
        },
        showHint: function(e, field) {
            if (e && e.target || field) {
                var $this = field||$(e.target);
                if ($this.attr('hintText') && !$this.val()) {
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'text';
                    }
                    $this.addClass(this.options.hintClass).val($this.attr('hintText'));
                } else if ($this.val() === $this.attr('hintText')) {
                    $this.addClass(this.options.hintClass);
                }
            }
        },
        hideHint: function(e, field) {
            if (e && e.target || field) {
                var $this = field||$(e.target);
                if ($this.attr('hintText') && ($this.val() === $this.attr('hintText'))) {
                    $this.val('').removeClass(this.options.hintClass);
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'password';
                    }
                }
            }
        },
        onPreFieldValidate: function(fieldObj) {
            this.hideHint(null, fieldObj.field);
        },
        onPostFieldValidate: function(fieldObj) {
            this.showHint(null, fieldObj.field);
        },
        onFieldAdded: function(fieldObj) {
            var field = fieldObj.field, hint = fieldObj.hintText||fieldObj.field.attr('hintText');
            if (hint) {
                if (field.attr('type') == 'password') {
                    field.data('isPassword', true).get(0).type = 'text';
                }
                field.attr('hintText', hint).addClass(this.options.hintClass).val(hint).on('change.inputhint', $.proxy(function() {
                    $(this).removeClass(this.options.hintClass);
                }, this)).on('click.inputhint', $.proxy(this.hideHint, this)).on('blur.inputhint', $.proxy(this.showHint, this)).on('focus.inputhint', $.proxy(this.hideHint, this));
            }
        },
        onFieldRemoved: function(fieldObj) {
            if (fieldObj.field.hasClass(this.options.hintClass)) {
                fieldObj.field.removeClass(this.options.hintClass).val('').off('.inputhint');
                if (fieldObj.field.data('isPassword')) {
                    fieldObj.field.get(0).type = 'password';
                    fieldObj.field.removeData('isPassword');
                }
            }
        }
    });
})(jQuery);