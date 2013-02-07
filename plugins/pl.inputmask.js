/*! v1.5 */
(function($) {
    $.pliantPlugin('inputmask', {
        options: {
            masks: {
                date: { rule: '9{2}/9{2}/9{4}', placeholder: '_', maskOnFocus: true },
                url: { rule: 'http://*{512}', placeholder: '', maskOnFocus: false },
                phone: { rule: '(9{3}) 9{3}-9{4}', placeholder: '_', maskOnFocus: false },
                phoneWithExt: { rule: '(9{3}) 9{3}-9{4}? x9{5}', placeholder: '_', maskOnFocus: false }
            },
            definitions: {
                '9': '[0-9]',
                'a': '[A-Za-z]',
                'A': '[A-Za-z0-9]',
                '*': '[A-Za-z0-9_\/-]'
            },
            resetIncompleteMasks: true,
            emptyMaskClass: 'plinputmask'
        },
        fieldMap: [],
        getCaret: function(field) {
            var out = null;
            if (field.setSelectionRange) {
                out = { start: field.selectionStart, end: field.selectionEnd };
            } else if (document.selection && document.selection.createRange) {
                var range = document.selection.createRange();
                out = { start: (0 - range.duplicate().moveStart('character', -100000)), end: (0 - range.moveEnd('character', -100000)) };
            }
            out.count = (out.start == out.end ? 1 : out.end - out.start);
            return out;
        },
        setCaret: function(field, start, end) {
            if (typeof start == 'number') {
                end = end||start;
                if (field.setSelectionRange) {
                    field.setSelectionRange(start, end);
                    field.focus();
                } else if (field.createTextRange) {
                    var r = field.createTextRange();
                    r.collapse(true);
                    r.moveEnd('character', end);
                    r.moveStart('character', start);
                    r.select();
                }
            }
        },
        parseRule: function(mask) {
            var out = { rule: [], mask: [], string: '', placeholder: mask.placeholder, maskOnFocus: mask.maskOnFocus, optionalIndex: -1, lastAction: null, onMaskComplete: mask.onMaskComplete, onMaskChange: mask.onMaskChange }, chars = mask.rule.split('');
            for(var i = 0; i < chars.length; i++) {
                if (chars[i] === '{') {
                    var matchIndex = mask.rule.indexOf('}', i);
                    if (matchIndex > -1) {
                        var rep = parseInt(mask.rule.substring(i+1, matchIndex)||1, 10);
                        for(var r = 0; r < rep-1; r++) {
                            out.rule.push(new RegExp(out.rule[out.rule.length-1]));
                            out.mask.push(mask.placeholder);
                        }
                        i = matchIndex;
                    }
                } else if (chars[i] == '?') {
                    out.optionalIndex = i-1;
                } else if (this.options.definitions[chars[i]]) {
                    out.rule.push(new RegExp(this.options.definitions[chars[i]]));
                    out.mask.push(mask.placeholder);
                } else {
                    out.rule.push(null);
                    out.mask.push(chars[i]);
                }
            }
            out.string = out.mask.join('');
            return out;
        },
        match: function(mObj, val, pos) {
            return (mObj.rule[pos] ? mObj.rule[pos].test(val) : false);
        },
        removeOptionalMask: function(mObj, val) {
            if (mObj.optionalIndex > -1) {
                val = val.split('');
                var i = mObj.optionalIndex, rem = false;
                while(++i < val.length) {
                    if (val[i] && val[i] === mObj.placeholder) {
                        val.splice(i--, 1);
                    }
                    rem = (mObj.rule[i] === null);
                }
                if (rem) {
                    val.splice(mObj.optionalIndex, (val.length - mObj.optionalIndex));
                }
                mObj.field.val(val.join(''));
            }
        },
        applyMask: function(mObj) {
            var val = mObj.field.val(), content = mObj.string.split('');
            if (!val) {
                mObj.field.addClass(this.options.emptyMaskClass);
            } else if (!mObj.placeholder) {
                var i = -1;
                while(i++ < val.length && val.charAt(i) === content[i]);
                val = val.substring(i);
            }
            this.insert(mObj, content, val, {start: 0, end: 0}, false);
        },
        findPrev: function(mObj, start) {
            for(var i = start; i >= 0; i--) {
                if (mObj.rule[i]) {
                    return i;
                }
            }
            return -1;
        },
        findNext: function(mObj, value, start) {
            for(var i = start; i <= value.length; i++) {
                if (mObj.rule[i]) {
                    return i;
                }
            }
            return -1;
        },
        shiftRight: function(mObj, value, start) {
            for (var i = start, next = start, nChar = mObj.placeholder||''; i < mObj.mask.length && next > -1; i++) {
                if (mObj.rule[i]) {
                    next = this.findNext(mObj, value, i+1);
                    var curr = value[i];
                    value[i] = nChar;
                    if (curr === undefined || this.match(mObj, curr, next)) {
                        nChar = curr;
                    } else {
                        break;
                    }
                }
            }
        },
        shiftLeft: function(mObj, value, start, end) {
            for(var i = start, next = this.findNext(mObj, value, end); i < mObj.mask.length && next > -1; i++) {
                if (mObj.rule[i]) {
                    if (this.match(mObj, value[next], i)) {
                        value[i] = value[next];
                        value[next] = mObj.placeholder;
                    } else {
                        break;
                    }
                    next = this.findNext(mObj, value, next+1);
                }
            }
        },
        insert: function(mObj, content, value, atPos, setPos) {
            var pos = (atPos||this.getCaret(mObj.field[0])), aVal = value.split('');
            if (pos.start < mObj.rule.length) {
                if (pos.start !== pos.end) {
                    this.remove(mObj, content, pos.start, pos.end);
                    if (pos.count > 1) {
                        this.shiftLeft(mObj, content, pos.start+1, pos.end);
                    }
                }
                for(var i = 0, next = this.findNext(mObj, content, pos.start); i < aVal.length && next > -1; i++) {
                    if (this.match(mObj, aVal[i], next)) {
                        this.shiftRight(mObj, content, next);
                        content[next] = aVal[i];
                        next = this.findNext(mObj, content, next+1);
                    }
                }
                this.writeOut(mObj, content, (setPos ? (next > -1 ? next : pos.start+1) : null));
            }
        },
        remove: function(mObj, value, start, end) {
            for(var i = start; i < end && i < value.length; i++) {
                if (mObj.rule[i]) {
                    value[i] = mObj.placeholder;
                }
            }
        },
        writeOut: function(mObj, value, start, end) {
            mObj.field.val(value.join(''));
            if (start !== null) {
                this.setCaret(mObj.field[0], start, end);
                if (mObj.onMaskChange) {
                    mObj.onMaskChange.call(mObj.field);
                }
                if (mObj.onMaskComplete && start >= value.length) {
                    mObj.onMaskComplete.call(mObj.field);
                }
            }
        },
        findEndInputIndex: function(mObj, value) {
            var valSplit = value.split(''), len = mObj.mask.length;
            for(var i = len-1; i > 0; i--) {
                if (mObj.mask[i] !== valSplit[i] && mObj.rule[i]) {
                    return (i+1 < len ? i+1 : mObj.mask.length);
                }
            }
            return 0;
        },
        onFieldAdded: function(fObj) {
            var mask = fObj.mask||fObj.field.attr('mask');
            if (mask && fObj.field.attr('type') !== 'password' && this.options.masks[mask]) {
                var mObj = this.parseRule(this.options.masks[mask]);
                mObj.field = fObj.field;
                fObj.field.on('keypress.mvinputmask', $.proxy(function(e) {
                    var $this = $(e.target);
                    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.which >= 32) {
                        this.insert(mObj, $this.val().split(''), String.fromCharCode(e.which), null, true);
                        return false;
                    } else if (e.which === 13) {
                        $this.blur();
                    }
                }, this)).on('keydown.mvinputmask', $.proxy(function(e) {
                    var field = e.target;
                    var pos = this.getCaret(field), value = $(field).val().split('');
                    if (e.which == 8 && pos.start === pos.end && pos.start-1 >= 0) {
                        pos.start = this.findPrev(mObj, pos.start-1);
                        if (pos.start > -1) {
                            this.remove(mObj, value, pos.start, pos.end);
                            this.shiftLeft(mObj, value, pos.start, pos.end);
                            this.writeOut(mObj, value, pos.start);
                        }
                        return false;
                    } else if (e.which == 46 && pos.start <= mObj.mask.length-1 || (e.which == 8 && pos.start !== pos.end)) {
                        pos.start = this.findNext(mObj, value, pos.start);
                        if (pos.start > pos.end) {
                            pos.end += (pos.start - pos.end) + 1;
                        }
                        pos.end = (pos.start === pos.end ? pos.end+1 : pos.end);
                        this.remove(mObj, value, pos.start, pos.end);
                        this.shiftLeft(mObj, value, pos.start, pos.end);
                        this.writeOut(mObj, value, pos.start);
                        return false;
                    }
                }, this)).on('paste.mvinputmask', $.proxy(function(e) {
                    var $this = $(e.target), currVal = $this.val().split(''), pos = this.getCaret($this[0]);
                    if (pos.start < mObj.mask.length) {
                        $this.val('');
                        setTimeout($.proxy(function() {
                            this.insert(mObj, currVal, $this.val(), pos, true);
                            mObj.lastAction = 'p';
                        }, this), 0);
                    } else {
                        return false;
                    }
                }, this)).on('cut.mvinputmask', function() {
                    return false;
                }).on('focus.mvinputmask', $.proxy(function(e) {
                    this.applyMask(mObj);
                    var $this = $(e.target).removeClass(this.options.emptyMaskClass), val = mObj.prevVal = $this.val(), i = (mObj.placeholder ? this.findEndInputIndex(mObj, val) : val.length);
                    if (i > -1) {
                        setTimeout($.proxy(function() {
                            this.setCaret($this[0], i);
                        }, this), 0);
                    }
                }, this)).on('blur.mvinputmask', $.proxy(function(e) {
                    var $this = $(e.target), val = $this.val(), phIndex = (val ? val.indexOf(mObj.placeholder) : -1);
                    if (val) {
                        if (mObj.maskOnFocus && (val === mObj.string || mObj.placeholder && phIndex > -1)) {
                            $this.val('');
                        } else if (mObj.placeholder && this.options.resetIncompleteMasks && phIndex > -1 && (mObj.optionalIndex == -1 || phIndex < mObj.optionalIndex)) {
                            $this.val(mObj.string);
                        }
                    }
                    val = $this.val();
                    if (mObj.optionalIndex > -1 && phIndex > mObj.optionalIndex)  {
                        this.removeOptionalMask(mObj, val);
                    }
                    if (!mObj.lastAction || mObj.lastAction !== 'p') {
                        mObj.lastAction = null;
                        if ((mObj.maskOnFocus && ((val && val !== mObj.prevVal) || !val && mObj.prevVal !== mObj.string)) || (!mObj.maskOnFocus && (val !== mObj.prevVal||val !== mObj.string))) {
                            $this.removeClass(this.options.emptyMaskClass).trigger('change');
                        }
                    }
                    if (val === mObj.string) {
                        $this.addClass(this.options.emptyMaskClass);
                    }
                }, this)).on('change.mvinputmask', $.proxy(function(e) {
                    var val = $(e.target).val();
                    if (val === mObj.string) {
                        fObj.field.addClass(this.options.emptyMaskClass);
                    } else {
                        fObj.field.removeClass(this.options.emptyMaskClass);
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            this.removeOptionalMask(mObj, fObj.field.val());
                        }
                    }
                }, this)).on('mouseup.mvinputmask', $.proxy(function(e) {
                    setTimeout($.proxy(function() {
                        var $this = $(e.target);
                        if ($this.val().length == 0) {
                            $this.focus();
                        }
                    }, this), 0);
                }, this));
                //Check if we need to apply the mask, and remove the optional masking if needed.
                var val = $.trim(fObj.field.val());
                if (!mObj.maskOnFocus || val.length > 0) {
                    this.applyMask(mObj);
                    if (val.length > 0) {
                        if (val === mObj.string) {
                            fObj.field.addClass(this.options.emptyMaskClass);
                        }
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            this.removeOptionalMask(mObj, fObj.field.val());
                        }
                    }
                }
                this.fieldMap.push(mObj);
            }
        },
        onPreFieldValidate: function(fObj) {
            for(var i = 0; i < this.fieldMap.length; i++) {
                if (this.fieldMap[i].mask && this.fieldMap[i].field[0] === fObj.field[0]) {
                    if (fObj.field.val() === this.fieldMap[i].string) {
                        fObj.field.val('').removeClass(this.options.emptyMaskClass);
                    } else if (this.fieldMap[i].optionalIndex > -1) {
                        this.removeOptionalMask(this.fieldMap[i], fObj.field.val());
                    }
                }
            }
        },
        onPostFieldValidate: function(fObj) {
            for(var i = 0; i < this.fieldMap.length; i++) {
                if (this.fieldMap[i].mask && this.fieldMap[i].field[0] === fObj.field[0] && fObj.field.val().length === 0 && !this.fieldMap[i].maskOnFocus) {
                    fObj.field.val(this.fieldMap[i].string).addClass(this.options.emptyMaskClass);
                }
            }
        },
        onFieldRemoved: function(fObj) {
            if (fObj.field.hasClass(this.options.emptyMaskClass)) {
                fObj.field.removeClass(this.options.emptyMaskClass).off('.mvinputmask').val('');
                var index;
                for(var i = 0; i < this.fieldMap.length; i++) {
                    if (this.fieldMap[i].field[0] === fObj.field[0]) {
                        index = i;
                        break;
                    }
                }
                if (index) {
                    this.fieldMap.splice(index, 1);
                }
            }
        },
        ClearMasks: function() {
            for(var i = 0; i < this.fieldMap.length; i++) {
                if ($.trim(this.fieldMap[i].field.val()) === this.fieldMap[i].string) {
                    this.fieldMap[i].field.val('');
                }
            }
        },
        onReady: function() {
            this.instance.ClearMasks = $.proxy(this.ClearMasks, this);
        }
    });
})(jQuery);