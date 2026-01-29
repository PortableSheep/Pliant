/*!___  ___           __  __  ___         __
  / _ \/ (_)__ ____  / /_/  |/  /__ ____ / /__
 / ___/ / / _ `/ _ \/ __/ /|_/ / _ `(_-</  '_/
/_/  /_/_/\_,_/_//_/\__/_/  /_/\_,_/___/_/\_\
v1.0.0 - Input masking plugin for jQuery. - http://portablesheep.github.com/PliantMask/
Copyright 2011-2013, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function($) {
    $.fn.pliantmask = function(opt) {
        var o = $.extend(true, {
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
            emptyMaskClass: 'input-mask',
            fields: [],
            inputSelector: ':input[type="text"]'
        }, opt), fieldMap = [],
        /*     ____     __                    __  __  ___    __  __           __
              /  _/__  / /____ _______  ___ _/ / /  |/  /__ / /_/ /  ___  ___/ /__
             _/ // _ \/ __/ -_) __/ _ \/ _ `/ / / /|_/ / -_) __/ _ \/ _ \/ _  (_-<
            /___/_//_/\__/\__/_/ /_//_/\_,_/_/ /_/  /_/\__/\__/_//_/\___/\_,_/___/
         */
        getCaret = function(field) {
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
                } else if (o.definitions[chars[i]]) {
                    out.rule.push(new RegExp(o.definitions[chars[i]]));
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
                    val.splice(mObj.optionalIndex, (val.length - mObj.optionalIndex));
                }
                mObj.field.val(val.join(''));
            }
        },
        applyMask = function(mObj) {
            var val = mObj.field.val(), content = mObj.string.split('');
            if (!val) {
                mObj.field.addClass(o.emptyMaskClass);
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
        },
        findEndInputIndex = function(mObj, value) {
            var valSplit = value.split(''), len = mObj.mask.length;
            for(var i = len-1; i > 0; i--) {
                if (mObj.mask[i] !== valSplit[i] && mObj.rule[i]) {
                    return (i+1 < len ? i+1 : mObj.mask.length);
                }
            }
            return 0;
        },
        clearMasks = function() {
            for(var i in fieldMap) {
                if ($.trim(fieldMap[i].field.val()) === fieldMap[i].string) {
                    fieldMap[i].field.val('');
                }
            }
        },
        addFieldMask = function(field, mask) {
            mask = $.isPlainObject(mask) ? mask : o.masks[mask];
            if (!(field instanceof jQuery)) {
                field = $(field);
            }
            if (field.length == 1 && mask && field.attr('type') !== 'password') {
                var mObj = parseRule($.extend({
                    placeholder: '_',
                    maskOnFocus: false
                }, mask));
                mObj.field = field;
                field.on('keypress.plinputmask', $.proxy(function(e) {
                    var $this = $(e.target);
                    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.which >= 32) {
                        insert(mObj, $this.val().split(''), String.fromCharCode(e.which), null, true);
                        return false;
                    } else if (e.which === 13) {
                        $this.blur();
                    }
                }, this)).on('keydown.plinputmask', $.proxy(function(e) {
                    var field = e.target;
                    var pos = getCaret(field), value = $(field).val().split('');
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
                }, this)).on('paste.plinputmask', $.proxy(function(e) {
                    var $this = $(e.target), currVal = $this.val().split(''), pos = getCaret($this[0]);
                    if (pos.start < mObj.mask.length) {
                        $this.val('');
                        setTimeout(function() {
                            insert(mObj, currVal, $this.val(), pos, true);
                            mObj.lastAction = 'p';
                        }, 0);
                    } else {
                        return false;
                    }
                }, this)).on('cut.plinputmask', function() {
                    return false;
                }).on('focus.plinputmask', $.proxy(function(e) {
                    applyMask(mObj);
                    var $this = $(e.target).removeClass(o.emptyMaskClass), val = mObj.prevVal = $this.val(), i = (mObj.placeholder ? findEndInputIndex(mObj, val) : val.length);
                    if (i > -1) {
                        setTimeout(function() {
                            setCaret($this[0], i);
                        }, 10);
                    }
                }, this)).on('blur.plinputmask', $.proxy(function(e) {
                    var $this = $(e.target), val = $this.val(), phIndex = (val ? val.indexOf(mObj.placeholder) : -1);
                    if (val) {
                        if (mObj.maskOnFocus && (val === mObj.string || mObj.placeholder && phIndex > -1)) {
                            $this.val('');
                        } else if (mObj.placeholder && o.resetIncompleteMasks && phIndex > -1 && (mObj.optionalIndex == -1 || phIndex < mObj.optionalIndex)) {
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
                            $this.removeClass(o.emptyMaskClass).trigger('change');
                        }
                    }
                    if (val === mObj.string) {
                        $this.addClass(o.emptyMaskClass);
                    }
                }, this)).on('change.plinputmask', $.proxy(function(e) {
                    var val = $(e.target).val();
                    if (val === mObj.string) {
                        field.addClass(o.emptyMaskClass);
                    } else {
                        field.removeClass(o.emptyMaskClass);
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            removeOptionalMask(mObj, field.val());
                        }
                    }
                }, this)).on('mouseup.plinputmask', $.proxy(function(e) {
                    setTimeout($.proxy(function() {
                        var $this = $(e.target);
                        if ($this.val().length == 0) {
                            $this.focus();
                        }
                    }, this), 0);
                }, this));
                //Check if we need to apply the mask, and remove the optional masking if needed.
                var val = $.trim(field.val());
                if (!mObj.maskOnFocus || val.length > 0) {
                    applyMask(mObj);
                    if (val.length > 0) {
                        if (val === mObj.string) {
                            field.addClass(o.emptyMaskClass);
                        }
                        if (mObj.optionalIndex > -1 && val !== mObj.string) {
                            removeOptionalMask(mObj, field.val());
                        }
                    }
                }
                fieldMap.push(mObj);
            } else {
                for(var i = 0; i < fieldMap.length; i++) {
                    if (fieldMap[i].field[0] === field[0] && fieldMap[i].mask && !fieldMap[i].maskOnFocus) {
                        applyMask(fieldMap[i]);
                        break;
                    }
                }
            }
        },
        removeFieldMask = function(field) {
            if (field.hasClass(o.emptyMaskClass)) {
                field.removeClass(o.emptyMaskClass).off('.plinputmask').val('');
                var index;
                for(var i = 0; i < fieldMap.length; i++) {
                    if (fieldMap[i].field[0] === field[0]) {
                        index = i;
                        break;
                    }
                }
                if (index) {
                    fieldMap.splice(index, 1);
                }
            }
        },
        unmaskField = function(field) {
            for(var i = 0; i < fieldMap.length; i++) {
                if (fieldMap[i].mask && fieldMap[i].field[0] === field[0]) {
                    if (field.val() === fieldMap[i].string) {
                        field.val('').removeClass(o.emptyMaskClass);
                    } else if (fieldMap[i].optionalIndex > -1) {
                        removeOptionalMask(fieldMap[i], field.val());
                    }
                }
            }
        };

        /*     ____     __                    __  __  ___    __  __           __
              / __/_ __/ /____ _______  ___ _/ / /  |/  /__ / /_/ /  ___  ___/ /__
             / _/ \ \ / __/ -_) __/ _ \/ _ `/ / / /|_/ / -_) __/ _ \/ _ \/ _  (_-<
            /___//_\_\\__/\__/_/ /_//_/\_,_/_/ /_/  /_/\__/\__/_//_/\___/\_,_/___/
        */
        this.Clear = clearMasks;
        this.Mask = function(field, mask) {
            var mask = mask||field.attr('mask');
            addFieldMask(field, mask);
        };
        this.RemoveMask = removeFieldMask;
        this.UnMask = unmaskField;

        /*     ____     _ __    __             _
              /  _/__  (_) /_  / /  ___  ___ _(_)___
             _/ // _ \/ / __/ / /__/ _ \/ _ `/ / __/
            /___/_//_/_/\__/ /____/\___/\_, /_/\__/
                                       /___/
         */
        for(var i in o.fields) {
            addFieldMask(o.fields[i].field, o.fields[i].mask);
        }

        this.find(o.inputSelector).each(function() {
            if (mask = $(this).attr('mask')) {
                addFieldMask(this, mask);
            }
        });
        return this;
    };
})(jQuery);