/*! v1.3.0 */
(function($) {
    $.pliantPlugin('inputmask', {
        options: {
            emptyMaskClass: 'pliantmask'
        }, _maskPlugin: null,
        _create: function() {
            if (!$.fn.pliantmask) {
                throw 'PliantMask must be loaded before pl.inputmask can be used.'
            }
            this._maskPlugin = $(this.instance).pliantmask(this.options);
        },
        onReady: function() {
            this.instance.ClearMasks = $.proxy(function() {
                this._maskPlugin.Clear();
            }, this);
        },
        onFieldAdded: function(fObj) {
            var mask = fObj.mask||fObj.field.attr('mask');
            if (mask) {
                this._maskPlugin.Mask(fObj.field, mask);
            }
        },
        onFieldRemoved: function(fObj) {
            this._maskPlugin.RemoveMask(fObj.field);
        },
        onPreFieldValidate: function(fObj) {
            this._maskPlugin.UnMask(fObj.field);
        },
        onPostFieldValidate: function(fObj) {
            this._maskPlugin.Mask(fObj.field);
        }
    })
})(jQuery);