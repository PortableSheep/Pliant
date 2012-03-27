(function($) {
	$.microvalPlugins.inputhint = function(options, mvInst) {
        var opt = $.extend({ hintClass: 'mvHint' }, options),
            showHint = function(e, field) {
                var $this = (field ? field : $(this));
                if ($this.attr('hint') && !$this.val()) {
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'text';
                    }
                    $this.addClass(opt.hintClass).val($this.attr('hint'));
                }
            },
            hideHint = function(e, field) {
                var $this = (field ? field : $(this));
                if ($this.attr('hint') && ($this.val() === $this.attr('hint'))) {
                    $this.val('').removeClass(opt.hintClass);
                    if ($this.data('isPassword')) {
                        $this.get(0).type = 'password';
                    }
                }
            };
        mvInst.Subscribe('onPreFieldValidate', function(fieldObj) {
            hideHint(null, fieldObj.field);
        }).Subscribe('onPostFieldValidate', function(fieldObj) {
            showHint(null, fieldObj.field);
        }).Subscribe('onFieldAdded', function(fieldObj) {
            var field = fieldObj.field, hint = field.attr('hint');
            if (hint) {
                if (field.attr('type') == 'password') {
                    field.data('isPassword', true).get(0).type = 'text';
                }
                field.addClass(opt.hintClass).val(hint).change(function() {
                    $(this).removeClass(opt.hintClass);
                }).click(hideHint).blur(showHint).focus(hideHint);
            }
        });
    };
})(jQuery);