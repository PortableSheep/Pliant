/*! v1.2 */
(function($) {
    $.pliantPlugins.inputmask = function(o, plInst) {
        var opt = $.extend(true, {
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
        }, o), fieldMap = [],
        getCaret = function(field) {
            var out = null;
            if (field.setSelectionRange) {
                out = { start: field.selectionStart, end: field.selectionEnd };
            } else if (document.selection && document.selection.createRange) {
                var range = document.selection.createRange();
                out = { start: (0 - range.duplicate().moveStart('character', -100000)), end: range.text.length };
            }
            out.count = (out.start == out.end ? 1 : out.end - out.start);
            return out;
        },
        setCaret = function(field, start, end) {
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
        parseRule = function(mask) {
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
                } else if (opt.definitions[chars[i]]) {
                    out.rule.push(new RegExp(opt.definitions[chars[i]]));
                    out.mask.push(mask.placeholder);
                } else {
                    out.rule.push(null);
                    out.mask.push(chars[i]);
                }
            }
            out.string = out.mask.join('');
            return out;
        },
        match = function(mObj, val, pos) {
            return (mObj.rule[pos] ? mObj.rule[pos].test(val) : false);
        },
        removeOptionalMask = function(mObj, val) {
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
                    val.splice(mObj.optionalIndex);
                }
                mObj.field.val(val.join(''));
            }
        },
        applyMask = function(mObj) {
            var val = mObj.field.val(), content = mObj.string.split('');
            if (!val) {
                mObj.field.addClass(opt.emptyMaskClass);
            } else if (!mObj.placeholder) {
                var i = -1;
                while(i++ < val.length && val.charAt(i) === content[i]);
                val = val.substring(i);
            }
            insert(mObj, content, val, {start: 0, end: 0}, false);
        },
        findPrev = function(mObj, start) {
            for(var i = start; i >= 0; i--) {
                if (mObj.rule[i]) {
                    return i;
                }
            }
            return -1;
        },
        findNext = function(mObj, value, start) {
            for(var i = start; i <= value.length; i++) {
                if (mObj.rule[i]) {
                    return i;
                }
            }
            return -1;
        },
        shiftRight = function(mObj, value, start) {
            for (var i = start, next = start, nChar = mObj.placeholder||''; i < mObj.mask.length && next > -1; i++) {
                if (mObj.rule[i]) {
                    next = findNext(mObj, value, i+1);
                    var curr = value[i];
                    value[i] = nChar;
                    if (curr === undefined || match(mObj, curr, next)) {
                        nChar = curr;
                    } else {
                        break;
                    }
                }
            }
        },
        shiftLeft = function(mObj, value, start, end) {
            for(var i = start, next = findNext(mObj, value, end); i < mObj.mask.length && next > -1; i++) {
                if (mObj.rule[i]) {
                    if (match(mObj, value[next], i)) {
                        value[i] = value[next];
                        value[next] = mObj.placeholder;
                    } else {
                        break;
                    }
                    next = findNext(mObj, value, next+1);
                }
            }
        },
        insert = function(mObj, content, value, atPos, setPos) {
            var pos = (atPos||getCaret(mObj.field[0])), aVal = value.split('');
            if (pos.start < mObj.rule.length) {
                if (pos.start !== pos.end) {
                    remove(mObj, content, pos.start, pos.end);
                    if (pos.count > 1) {
                        shiftLeft(mObj, content, pos.start+1, pos.end);
                    }
                }
                for(var i = 0, next = findNext(mObj, content, pos.start); i < aVal.length && next > -1; i++) {
                    if (match(mObj, aVal[i], next)) {
                        shiftRight(mObj, content, next);
                        content[next] = aVal[i];
                        next = findNext(mObj, content, next+1);
                    }
                }
                writeOut(mObj, content, (setPos ? (next > -1 ? next : pos.start+1) : null));
            }
        },
        remove = function(mObj, value, start, end) {
            for(var i = start; i < end && i < value.length; i++) {
                if (mObj.rule[i]) {
                    value[i] = mObj.placeholder;
                }
            }
        },
        writeOut = function(mObj, value, start, end) {
            mObj.field.val(value.join(''));
            if (start !== null) {
                setCaret(mObj.field[0], start, end);
                if (mObj.onMaskChange) {
                    mObj.onMaskChange.call(mObj.field);
                }
                if (mObj.onMaskComplete && start >= value.length) {
                    mObj.onMaskComplete.call(mObj.field);
                }
            }
        };
        plInst.Subscribe('onFieldAdded', function(fObj) {
            var mask = fObj.mask||fObj.field.attr('mask');
            if (mask && fObj.field.attr('type') !== 'password' && opt.masks[mask]) {
                var mObj = parseRule(opt.masks[mask]);
                mObj.field = fObj.field;
                fObj.field.on('keypress.mvinputmask', function(e) {
                    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.which >= 32) {
                        insert(mObj, $(this).val().split(''), String.fromCharCode(e.which), null, true);
                        return false;
                    } else if (e.which === 13) {
                        $(this).blur();
                    }
                }).on('keydown.mvinputmask', function(e) {
                    var pos = getCaret(this), value = $(this).val().split('');
                    if (e.which == 8 && pos.start === pos.end && pos.start-1 >= 0) {
                        pos.start = findPrev(mObj, pos.start-1);
                        if (pos.start > -1) {
                            remove(mObj, value, pos.start, pos.end);
                            shiftLeft(mObj, value, pos.start, pos.end);
                            writeOut(mObj, value, pos.start);
                        }
                        return false;
                    } else if (e.which == 46 && pos.start <= mObj.mask.length-1 || (e.which == 8 && pos.start !== pos.end)) {
                        pos.start = findNext(mObj, value, pos.start);
                        if (pos.start > pos.end) {
                            pos.end += (pos.start - pos.end) + 1;
                        }
                        pos.end = (pos.start === pos.end ? pos.end+1 : pos.end);
                        remove(mObj, value, pos.start, pos.end);
                        shiftLeft(mObj, value, pos.start, pos.end);
                        writeOut(mObj, value, pos.start);
                        return false;
                    }
                }).on('paste.mvinputmask', function(e) {
                    var $this = $(this), currVal = $this.val().split(''), pos = getCaret(this);
                    if (pos.start < mObj.mask.length) {
                        $this.val('');
                        setTimeout(function() {
                            insert(mObj, currVal, $this.val(), pos, true);
                            mObj.lastAction = 'p';
                        }, 0);
                    } else {
                        return false;
                    }
                }).on('cut.mvinputmask', function(e) {
                    return false;
                }).on('focus.mvinputmask', function() {
                    applyMask(mObj);
                    var $this = $(this).removeClass(opt.emptyMaskClass), val = mObj.prevVal = $this.val(), i = (mObj.placeholder ? findNext(mObj, val.split(''), 0) : val.length);
                    if (i > -1) {
                        setTimeout(function() {
                            setCaret($this[0], i);
                        }, 0);
                    }
                }).on('blur.mvinputmask', function() {
                    var $this = $(this), val = $this.val(), phIndex = (val ? val.indexOf(mObj.placeholder) : -1);
                    if (val) {
                        if (mObj.maskOnFocus && (val === mObj.string || mObj.placeholder && phIndex > -1)) {
                            $this.val('');
                        } else if (mObj.placeholder && opt.resetIncompleteMasks && phIndex > -1 && (mObj.optionalIndex == -1 || phIndex < mObj.optionalIndex)) {
                            $this.val(mObj.string);
                        }
                    }
                    val = $this.val();
                    if (mObj.optionalIndex > -1 && phIndex > mObj.optionalIndex)  {
                        removeOptionalMask(mObj, val);
                    }
                    if (!mObj.lastAction || mObj.lastAction !== 'p') {
                        mObj.lastAction = null;
                        if ((mObj.maskOnFocus && ((val && val !== mObj.prevVal) || !val && mObj.prevVal !== mObj.string)) || (!mObj.maskOnFocus && (val !== mObj.prevVal||val !== mObj.string))) {
                            $this.removeClass(opt.emptyMaskClass).trigger('change');
                        }
                    }
                    if (val === mObj.string) {
                        $this.addClass(opt.emptyMaskClass);
                    }
                }).on('change.mvinputmask', function() {
                    var val = $(this).val();
                    if (val === mObj.string) {
                        fObj.field.addClass(opt.emptyMaskClass);
                    } else {
                        fObj.field.removeClass(opt.emptyMaskClass);
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            removeOptionalMask(mObj, fObj.field.val());
                        }
                    }
                });
                //Check if we need to apply the mask, and remove the optional masking if needed.
                var val = fObj.field.val().trim();
                if (!mObj.maskOnFocus || val.length > 0) {
                    applyMask(mObj);
                    if (val.length > 0) {
                        if (val === mObj.string) {
                            fObj.field.addClass(opt.emptyMaskClass);
                        }
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            removeOptionalMask(mObj, fObj.field.val());
                        }
                    }
                }
                fieldMap.push(mObj);
            }
        }).Subscribe('onPreFieldValidate', function(fObj) {
            for(var i = 0; i < fieldMap.length; i++) {
                if (fieldMap[i].mask && fieldMap[i].field[0] === fObj.field[0]) {
                    if (fObj.field.val() === fieldMap[i].string) {
                        fObj.field.val('').removeClass(opt.emptyMaskClass);
                    } else if (fieldMap[i].optionalIndex > -1) {
                        removeOptionalMask(fieldMap[i], fObj.field.val());
                    }
                }
            }
        }).Subscribe('onPostFieldValidate', function(fObj) {
            for(var i = 0; i < fieldMap.length; i++) {
                if (fieldMap[i].mask && fieldMap[i].field[0] === fObj.field[0] && fObj.field.val().length === 0 && !fieldMap[i].maskOnFocus) {
                    fObj.field.val(fieldMap[i].string).addClass(opt.emptyMaskClass);
                }
            }
        });
        //Public function to clear all visible masks... useful for for submissions.
        plInst.ClearMasks = function() {
            for(var i = 0; i < fieldMap.length; i++) {
                if (fieldMap[i].field.val().trim() === fieldMap[i].string) {
                    fieldMap[i].field.val('');
                }
            }
        };
    };
})(jQuery);