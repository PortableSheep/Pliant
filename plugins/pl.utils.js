/*! v1.2 */
(function($) {
	$.pliantPlugin('utils', {
		onReady: function() {
			if (!this.instance.GetFieldRules) {
				var inst = this.instance;
				this.instance.GetFieldRules = function(includeHidden, includeDisabled, includeFunctions, includeObjects) {
					var out = [], _fields = inst._fields;
					for(var i in _fields) {
						var fobj = _fields[i];
						if (fobj.enabled && !(fobj.field.is(':hidden') && !includeHidden || fobj.field.is(':disabled') && !includeDisabled)) {
							var invRules = [];
							for(var r in fobj.rules) {
								var rule = fobj.rules[r];
								if (rule.enabled) {
									var props = [];
									for(var key in rule) {
										var val = rule[key];
										if (key == '_' || key == 'valid' || key == 'enabled' || key == 'message' || val === undefined ||  ($.isFunction(val) && !includeFunctions || $.isPlainObject(val) && !includeObjects)) {
											continue;
										} else if (val instanceof jQuery) {
											val = val.attr('id');
										}
										if (val !== undefined) {
											props.push({ key: key, value: val });
										}
									}
									invRules.push({ name: r, properties: props });
								}
							}
							out.push({ id: fobj.field.attr('id'), rules: invRules});
						}
					}
					return out;
				};
			}
		}
    });
})(jQuery);