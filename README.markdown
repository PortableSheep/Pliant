Pliant - jQuery Validation Plugin
================================

Pliant is a jQuery plugin for form validation, that tries to be very flexible as far as validation rules are concerned. It also allows defining rules via HTML comments.

Check out http://portablesheep.github.com/Pliant/ for some demos, and the WIKI for documentation.

- - -

Pliant Change Log
---------------------
* **3.4.1**
    * Added new "expectedResult" option for rules. This allows rules to control the validation result for the rule in custom scenarios.
* **3.4.0**
    * Extended chain feature to allow specific rules for the chained field(s).
    * Fixed some lint errors.
* **3.3.0**
    * Added the ability to pass arguments to Validate, which will be passed to all rules executed.
* **3.2.5**
    * Changed comment rule processing to require the normal format used on plugin init. Allowing comments to be placed anywhere, instead of above the field.
* **3.2.4**
    * Added a missing return to ValidateField function.
* **3.2.3**
    * Modified input change validation to not rely on depricated arguments.callee.caller.name, which was breaking IE in some scenarios.
* **3.2.2**
    * Changed the init fields add function to merge existing fields, in case fields are defines twice, their rules are combined.
* **3.2.1**
    * Fixed a potential bug with processing rule messages that might be blank.
* **3.2**
    * Added plugin support, and two example plugins for textbox hinting, and corrected input styling.
* **3.15**
    * Modified the rule processing during field add to allow adding of rules without a validate function, as long as they have a message. This allows the user do things such as pass the fields/rules back to a server, do some server validation, and still be able to mark it as invalid on the client side on post back.
    * Modified field option 'validateOnChange' to allow you to assign it an anonymous function to determine if validation of rules should happen. If the function returns false, validation of the rules for that field is skipped.
    * Added 'validateOnChange' option for individual rules, which offers the same functionality as the field option.
* **3.14**
    * Modified chaining feature to accept an array, allowing multiple fields to be validated.
* **3.13**
    * Added field validation chaining. Adding a 'chain' option to a field definition with selector to another field will cause one to kick off validation of the other.
    * Cleaned up some hide/show usings that could be toggle.
    * Exposed a public ValidateField function that forces validation of a field you specify by selector.
    * Changed public AddField function to accept an array of field objects.
* **3.12**
    * Added validateSubmitScope option that lets you specify the DOM scope when binding to the validateSubmitSelector.
* **3.11**
    * Added detection of malformed field rules, and init rules. Any malformed rules will throw an error with the rule name that's invalid.
* **3.10**
    * Fixed a bug with event triggering not using well formed arguments, causing errors with onMessagePlacement is used.
* **3.9**
    * Fixed a bug in field message container support, where the container dom would be lost.
    * Fixed a bug in the AddField method where it would error on an array of field objects being passed in.
* **3.8**
    * Fixed a bug in the messageContainer visibility logic that caused the container to never be shown since the visibility of the error message was checked when the parent was hidden.
* **3.7**
    * Added "inherit" property support for rules; this allows you to inherit an existing rules object, esentially aliasing it and allowing you to override its properties.
    * Changed Subscribe to throw an exception when the handler isn't a valid function, or when the event name doesn't exist.
    * Changed execution order of onFieldValidate event so the GetInvalidCount method returns accurate results.
    * Changed AddMarkupRules method to take a object for a parameter which allow you to set "target" and "inputSelector". By default the target is the DOM pliant was instantiated against, and inputSelector is what is set on init. This allows for some custom selectors when parsing HTML rules against ASP.NET radio groups for example, since they're rendered as a table.
    * Added message container support for fields, by setting the "container" property on a field.
* **3.6**
    * Fixed bug with validateSubmitSelector option where passing in a jQuery object would result in all fields triggering validate on click. Added a check for jQuery object, and pull the selector from it before wiring up to prevent this issue.
* **3.5**
    * Changed GetFieldRules to filter out any rule properties that are objects unless its fourth param is True. This and 3.4 changes are added to make the results easier to consume by other languages when stringified since the internal objects are non-standard and don't play well with ASP.NET for example.
* **3.4**
    * Changed GetFieldRules to filter out any rule properties that are functions unless its third param is True.
* **3.3**
    * Changed focusFirstInvalidField to only apply when Validate is called, or form validation occurs. Having it on field change validation was jarring for the user if they wanted to fix another field before fixing the first invalid field.
* **3.2**
    * Fixed bug where some method parameters were named a reserved JS keyword, which busted IE.
* **3.1**
    * Fixed bug in custom propertly merging that made properties with false properties never carry over.
* **3.0**
    * Changed HTML comment parsing to parse serialized/well formed JSON instead of my custom contricting format.
    * Updated the example to use JSON in the HTML comments.
* **2.9**
    * Fixed custom properties of defined shared rules not passing to the validate function.
* **2.8**
    * Fixed bug where user could call define a field that would be undefined or an empty array. Resulting in validation always failing.
    * Changed the code to only add a field if it's not undefined, and if the field object has an attribute ID. Otherwise it returns an error.
* **2.7**
    * Added ignoreDisabled option with a default of true.
    * Added includeDisabled parameter to GetFieldRules function.
* **2.6**
    * Added ability to define submit selector (option: validateSubmitSelector) and event (option: validateSubmitOn) to listen on for auto validation.
    * Refactored the built in length rule a bit.
* **2.5**
    * Added appendRulesToFieldClass option that appends all field rules to the fields class, and keeps them in sync through rule enable/disable.
* **2.4**
    * Fixed possible circular ref exception when stringifying output from GetFieldRules method due to top level properties being a jQuery object. If it's a jQuery object, we just pull the ID attribute for the value outputted. This doesn't solve for values that are arrays of jQuery objects.
* **2.3**
    * Added the Subscribe public method to allow more than one event handler after init. Note that using this for onFieldAdded will not work for fields defined in the init fields option since the binding occures after init.
    * Fixed the UI refreshing on AddField from happening too often.
    * Added GetFieldRules function that returns all enabled field ids, all enabled roles names, and all the roles properties as key/value pairs... excluding message, validate, isValid, and isEnabled.
* **2.2**
    * Refactored code to remove redundant calls to internal methods, and reduce size a bit.
    * Rmoved fieldIndicator feature, and replaced it with the onFieldAdded event since it can be used to acheive the same, and is more flexible.
* **2.1**
    * Added ability to disable/enable validation on field change via 'validateOnChange' option in the field definition.

- - -

InputMask Change Log
---------------------
* **1.2**
    * Added a handler for the change event that removes the mask CSS class if the value of the field isn't the mask string.