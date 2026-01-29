/*! v1.0 */
(function($) {
    $.pliantPlugin('htmlrules', {
        options: {
        	parseOnInit: false
        },
        onReady: function() {
        	this.instance.AddMarkupRules = $.proxy(this.addMarkupRules, this);
        	if (this.options.parseOnInit) {
        		this.addMarkupRules(this.instance);
        	}
        },
        traverseComments: function(start) {
            var out = [];
            if (start.nodeType === 8 && /^\s*{.*}\s*$/.test(start.nodeValue)) {
                out.splice(0, 0, start.nodeValue);
            } else if (start.childNodes.length > 0) {
                for(var i = 0; i < start.childNodes.length; i++) {
                    out = out.concat(this.traverseComments(start.childNodes[i]));
                }
            }
            return out;
        },
        addMarkupRules: function(target) {
            var _target = target||this.instance, comments = this.traverseComments(_target[0]);
            for(var i in comments) {
                var obj = $.parseJSON(comments[i]);
                if (obj && obj instanceof Object && obj.hasOwnProperty('field') && obj.hasOwnProperty('rules')) {
                    obj.field = $(obj.field);
                    this.instance.add(obj);
                }
            }
        }
    });
})(jQuery);