(function($) {
	$.pliantPlugins.utils = function(o, plInst) {
		if (!plInst.GetFieldRules) {
			plInst.GetFieldRules = function(includeHidden, includeDisabled, includeFunctions, includeObjects) {
				var out = [], _fields = plInst.fields;
				for(var i in _fields) {
					if (_fields[i].isEnabled && !(_fields[i].field.is(':hidden') && !includeHidden || _fields[i].field.is(':disabled') && !includeDisabled)) {
						var invRules = [];
						for(var r in _fields[i].rules) {
							if (_fields[i].rules[r].isEnabled !== false) {
								var props = [];
								for(var key in _fields[i].rules[r]) {
									var val = _fields[i].rules[r][key];
									if (key == 'isValid' || key == 'isEnabled' || key == 'message' || val === undefined) {
										continue;
									} else if (val instanceof jQuery) {
										val = val.attr('id');
									} else if (val instanceof Function && !includeFunctions || val instanceof Object && !includeObjects) {
										continue;
									}
									if (val !== undefined) {
										props.push({ key: key, value: val });
									}
								}
								invRules.push({ name: r, properties: props });
							}
						}
						out.push({ id: _fields[i].field.attr('id'), rules: invRules});
					}
				}
				return out;
			};
		}
    };
})(jQuery);