(function($) {
	$.pliantPlugins.inputhint = function(options, plInst) {
        var opt = $.extend({ hintClass: 'plHint' }, options),
            showHint = function(e, field) {
                var $this = (field ? field : $(this));
                if ($this.attr('hintText') && !$this.val()) {
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'text';
                    }
                    $this.addClass(opt.hintClass).val($this.attr('hintText'));
                } else if ($this.val() === $this.attr('hintText')) {
                    $this.addClass(opt.hintClass);
                }
            },
            hideHint = function(e, field) {
                var $this = (field ? field : $(this));
                if ($this.attr('hintText') && ($this.val() === $this.attr('hintText'))) {
                    $this.val('').removeClass(opt.hintClass);
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'password';
                    }
                }
            };
        plInst.Subscribe('onPreFieldValidate', function(fieldObj) {
            hideHint(null, fieldObj.field);
        }).Subscribe('onPostFieldValidate', function(fieldObj) {
            showHint(null, fieldObj.field);
        }).Subscribe('onFieldAdded', function(fieldObj) {
            var field = fieldObj.field, hint = fieldObj.hintText||fieldObj.field.attr('hintText');
            if (hint) {
                if (field.attr('type') == 'password') {
                    field.data('isPassword', true).get(0).type = 'text';
                }
                field.attr('hintText', hint).addClass(opt.hintClass).val(hint).change(function() {
                    $(this).removeClass(opt.hintClass);
                }).click(hideHint).blur(showHint).focus(hideHint);
            }
        });
    };
})(jQuery);