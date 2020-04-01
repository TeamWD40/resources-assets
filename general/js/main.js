// SupportPal global namespace, we use App because the help widget uses SupportPal.
var App = (function () {

    'use strict';

    // Create a public methods object
    var modules = {
        env: $('meta[name="environment"]').prop('content') || "production",
        userAgent: {
            isIe: function () {
                return window.navigator.userAgent.indexOf('MSIE') !== -1
                    || window.navigator.appVersion.indexOf('Trident/') !== -1;
            },
        }
    };

    /**
     * Add a module or function to the namespace.
     *
     * @param  {String}   name The name of the module.
     * @param  {Object}   obj  The module object.
     */
    modules.extend = function (name, obj) {
        if (typeof modules[name] !== "undefined") {
            throw new Error("A module with name '" + name + "' already exists.");
        }

        modules[name] = obj;
    };

    // Return public methods object
    return modules;

})();

// Disable jQuery migrate in production.
if (App.env === "production") {
    $.migrateMute = true;
}

// Convert Date objects to unix time.
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };

// flatpickr.
if (typeof Lang !== 'undefined') {
    flatpickr.localize({
        weekdays: {
            shorthand: [
                Lang.get('general.sun'),
                Lang.get('general.mon'),
                Lang.get('general.tue'),
                Lang.get('general.wed'),
                Lang.get('general.thu'),
                Lang.get('general.fri'),
                Lang.get('general.sat')

            ],
            longhand: [
                Lang.get('general.sunday'),
                Lang.get('general.monday'),
                Lang.get('general.tuesday'),
                Lang.get('general.wednesday'),
                Lang.get('general.thursday'),
                Lang.get('general.friday'),
                Lang.get('general.saturday'),
            ]
        },
        months: {
            shorthand: [
                Lang.get('general.jan'),
                Lang.get('general.feb'),
                Lang.get('general.mar'),
                Lang.get('general.apr'),
                Lang.get('general.may'),
                Lang.get('general.jun'),
                Lang.get('general.jul'),
                Lang.get('general.aug'),
                Lang.get('general.sep'),
                Lang.get('general.oct'),
                Lang.get('general.nov'),
                Lang.get('general.dec'),
            ],
            longhand: [
                Lang.get('general.january'),
                Lang.get('general.february'),
                Lang.get('general.march'),
                Lang.get('general.april'),
                Lang.get('general.may'),
                Lang.get('general.june'),
                Lang.get('general.july'),
                Lang.get('general.august'),
                Lang.get('general.september'),
                Lang.get('general.october'),
                Lang.get('general.november'),
                Lang.get('general.december')
            ]
        },
        firstDayOfWeek: 1,
        ordinal: function (nth) {
            var s = nth % 100;
            if (s > 3 && s < 21)
                return Lang.get('general.ordinal_th');
            switch (s % 10) {
                case 1:
                    return Lang.get('general.ordinal_st');
                case 2:
                    return Lang.get('general.ordinal_nd');
                case 3:
                    return Lang.get('general.ordinal_rd');
                default:
                    return Lang.get('general.ordinal_th');
            }
        },
        rangeSeparator: Lang.get('general.range_separator'),
        weekAbbreviation: Lang.get('general.week_abbr'),
        scrollTitle: Lang.get('general.scroll_to_increment'),
        toggleTitle: Lang.get('general.click_to_toggle'),
        amPM: [Lang.get('general.am'), Lang.get('general.pm')],
        yearAriaLabel: Lang.choice('general.year', 1),
        hourAriaLabel: Lang.choice('general.hour', 1),
        minuteAriaLabel: Lang.choice('general.min', 1),
        time_24hr: true
    });
}

// Date picker.
$.fn.datepicker = function (options) {
    var defaults = {
        // Convert from PHP date format to flatpickr format.
        dateFormat: $('meta[name=date_format]').prop('content')
            .replace('jS', 'J')
            .replace(/([^a-zA-Z])/g, "\\\\$1")
    };

    return $(this).each(function () {
        // Quick fix to stop flatpickr being loaded twice on an input
        if (! $(this).hasClass('flatpickr-input')) {
            $(this).flatpickr(
                $.extend(true, defaults, options)
            )
        }
    });
};

// Time picker.
$.fn.timepicker = function (options) {
    var defaults = {
        // Convert from PHP date format to flatpickr format.
        dateFormat: $('meta[name=time_format]').prop('content').replace('g', 'h')
            .replace('a', 'K')
            .replace('A', 'K')
            .replace(/([^a-zA-Z])/g, "\\\\$1"),
        enableTime: true,
        noCalendar: true,
        time_24hr: ! ($('meta[name=time_format]').prop('content').indexOf('g') > -1),
    };

    return $(this).each(function () {
        // Quick fix to stop flatpickr being loaded twice on an input
        if (! $(this).hasClass('flatpickr-input')) {
            $(this).flatpickr(
                $.extend(true, defaults, options)
            )
        }
    });
};

// Polyfill for matches and closest (IE11), needed for tippy.js
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}
if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;

        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

// Wait for DOM to load before running the below.
$(function () {
    // IE 11 css --var support.
    cssVars({
        include: '[data-include]',
        preserveStatic: false,
        variables: spCssVarThemes[$('body').hasClass('sp-theme-dark') ? 'dark' : 'light'],
        silent: App.env === "production"
    });

    // Tooltip - tippy.js
    tippy.delegate(document.body, {
        allowHTML: false,
        content: function (reference) {
            var title = reference.getAttribute('title');
            reference.removeAttribute('title');
            return title;
        },
        target: '[title]',
        touch: ['hold', 500],
        zIndex: 10003
    });

    // Global event events.
    // Avoid polluting the $(document) space with too many event listeners, try to place as close to element as possible
    // otherwise performance will be affected (https://api.jquery.com/on/).
    $(document.body)
        // For dropdowns
        .on('click', '.sp-dropdown-container .sp-button, .sp-dropdown-container .sp-action, .sp-dropdown-container .sp-dropdown li', function () {
            $(this).parents('.sp-dropdown-container').find('.sp-dropdown').toggle();
        })
        // Hide dropdown if clicking outside the dropdown div
        .on('click', function (event) {
            $('.sp-dropdown-container').not($(event.target).closest('.sp-dropdown-container'))
                .find('.sp-dropdown:visible')
                .hide();
        })
        // For opening/collapsing collapsible boxes
        .on('click', '.sp-collapsible', function () {
            $(this).find('.fas').toggleClass('fa-chevron-down fa-chevron-up');
            $(this).next().toggle(500);
        })
        // Smooth scrolling for anchors
        .on('click', 'a[href^="#"]', function (event) {
            event.preventDefault();

            // Check if we have a name with an underscore (used in comments)
            var href = $.attr(this, 'href').substr(1),
                $elem = $('[name="_' + $.attr(this, 'href').substr(1) + '"]');

            // If not, check if it's an ID first or a name without an underscore
            // (normal usage)
            if ($elem.length === 0) {
                $elem = $('[id="' + $.attr(this, 'href').substr(1) + '"]');
                if ($elem.length === 0) {
                    $elem = $('[name="' + $.attr(this, 'href').substr(1) + '"]');
                }
            }

            // Only handle it if we have an element
            if (href.length !== 0 && $elem.length !== 0) {
                $('html, body, #content').animate({
                    scrollTop: $elem.position().top - 24
                }, 500);
            }
        })
        // Close alerts
        .on('click', '.sp-alert .sp-alert-close', function () {
            $(this).parent().slideToggle(300);
        });

    // Tabs toggling
    $('ul.sp-tabs li').on('click', function () {
        // Get name of tab
        var name = $(this).attr('id');

        // Hide current div
        $(this).parent().siblings('div.sp-tab-content').hide();
        // Show new div
        $('#tab' + name).show();

        // Remove active from old tab
        $(this).parent().find('li.sp-active').removeClass('sp-active');
        // Set to active
        $(this).addClass('sp-active');
    });

    // Handle anchors on page load
    if (window.location.hash) {
        var elem = $('[name="_' + window.location.hash.replace('#', '') + '"]');
        if (elem.length) {
            // Scroll to top just in case
            scroll(0, 0);
            // Now scroll to anchor
            $('html, body, #content').animate({
                scrollTop: elem.position().top - 24
            }, 1000);
        }
    }

    // Global AJAX setup handler to add the CSRF token to ALL POST requests.
    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (options.type.toLowerCase() === "post"
            || options.type.toLowerCase() === "put"
            || options.type.toLowerCase() === "delete"
        ) {
            jqXHR.setRequestHeader('X-CSRF-Token', $('meta[name=csrf_token]').prop('content'));
        }
    });

    // Register localisation settings.
    if (typeof Lang !== 'undefined') {
        // Timeago
        timeago.register('supportpal', function (number, index, total_sec) {
            // Convert weeks to days.
            if ([8,9].indexOf(index) !== -1) {
                total_sec = parseInt(total_sec / 86400);
            }

            return [
                [Lang.get('general.just_now'), Lang.get('general.shortly')],
                [Lang.choice('general.minutes_ago', 1, {'number': 1}), Lang.choice('general.in_minutes', 1, {'number': 1})],
                [Lang.choice('general.minutes_ago', 1, {'number': 1}), Lang.choice('general.in_minutes', 1, {'number': 1})],
                [Lang.choice('general.minutes_ago', 2, {'number': '%s'}), Lang.choice('general.in_minutes', 2, {'number': '%s'})],
                [Lang.choice('general.hours_ago', 1, {'number': 1}), Lang.choice('general.in_hours', 1, {'number': 1})],
                [Lang.choice('general.hours_ago', 2, {'number': '%s'}), Lang.choice('general.in_hours', 2, {'number': '%s'})],
                [Lang.choice('general.days_ago', 1, {'number': 1}), Lang.choice('general.in_days', 1, {'number': 1})],
                [Lang.choice('general.days_ago', 2, {'number': '%s'}), Lang.choice('general.in_days', 2, {'number': '%s'})],
                [Lang.choice('general.days_ago', 2, {'number': total_sec}), Lang.choice('general.in_days', 2, {'number': total_sec})],
                [Lang.choice('general.days_ago', 2, {'number': total_sec}), Lang.choice('general.in_days', 2, {'number': total_sec})],
                [Lang.choice('general.months_ago', 1, {'number': 1}), Lang.choice('general.in_months', 1, {'number': 1})],
                [Lang.choice('general.months_ago', 2, {'number': '%s'}), Lang.choice('general.in_months', 2, {'number': '%s'})],
                [Lang.choice('general.years_ago', 1, {'number': 1}), Lang.choice('general.in_years', 1, {'number': 1})],
                [Lang.choice('general.years_ago', 2, {'number': '%s'}), Lang.choice('general.in_years', 2, {'number': '%s'})]
            ][index];
        });

        // Initialise global timeAgo variable (used in several other files).
        window.timeAgo = new timeago();
        timeAgo.setLocale("supportpal");
    }

    // jQuery validate.
    $.validator.setDefaults({
        ignore: ':hidden:not(.redactor):not(input[type=hidden]), [contenteditable=\'true\']',

        errorElement: 'span',
        errorClass: 'sp-input-error',
        wrapper: 'div',

        errorPlacement: function(error, element) {
            var position = element;

            // If it's redactor, codemirror, show/hide button, recaptcha, a checkbox or radio, add after parent
            if (element.parent('.redactor-box').length || element.parent('.merge-field_container').length
                || element.parent('.hideShowPassword-wrapper').length || element.parent('.sp-input-group').length
                || element.parent().parent('.g-recaptcha').length || element.prop('type') === 'checkbox'
                || element.prop('type') === 'radio'
            ) {
                position = element.parent();
            }

            // If it's selectize, add after sibling.
            if (element.next().hasClass('selectize-control')) {
                position = element.next();
            }

            // If it's got a translatable model, add afterwards.
            if (element.next().hasClass('fa-language')) {
                position = element.next().next();
            }

            // If it's a checkbox or radio, make sure we put the error after the last element.
            if (position.is('label') && (element.prop('type') === 'checkbox' || element.prop('type') === 'radio')) {
                position = position.siblings().last('label');
            }

            // Show error
            error.insertAfter(position);
        },

        highlight: function(element, errorClass, validClass) {
            // If there's multiple inputs in the row, add the class to the input instead of the row
            // Excluding If it's redactor, codemirror, show/hide button, a checkbox or radio
            var $row = $(element).closest('.sp-form-row'),
                $elm = $row.find(':input:not(:button)').length > 1 &&
                (! $(element).parent('.redactor-box').length && ! $(element).parent('.merge-field_container').length
                    && ! $(element).parent('.hideShowPassword-wrapper').length
                    && ! $(element).parent('.sp-input-group').length && $(element).prop('type') !== 'checkbox'
                    && $(element).prop('type') !== 'radio'
                ) ? $(element) : $row;

            // Add the Bootstrap error class to the control group
            $elm.addClass('sp-input-has-error');
        },

        unhighlight: function(element, errorClass, validClass) {
            // If there's multiple inputs in the row, add the class to the input instead of the row
            // Excluding If it's redactor, codemirror, show/hide button, a checkbox or radio
            var $row = $(element).closest('.sp-form-row'),
                $elm = $row.find(':input').length > 1 &&
                (! $(element).parent('.redactor-box').length && ! $(element).parent('.merge-field_container').length
                    && ! $(element).parent('.hideShowPassword-wrapper').length
                    && ! $(element).parent('.sp-input-group').length && $(element).prop('type') !== 'checkbox'
                    && $(element).prop('type') !== 'radio'
                ) ? $(element) : $row;

            // Remove the Bootstrap error class from the control group
            $elm.removeClass('sp-input-has-error');

            // Hide error if it's "pending" (remote validation).
            var describer = $(element).attr("aria-describedby");
            if (describer) {
                $row.find('#' + this.escapeCssMeta(describer)).hide();
            }
        },

        success: function (label, element) {
            //
        },

        // Custom submit handler.
        submitHandler: function (form) {
            $(form).find('input[type="submit"], button[type="submit"]').prop('disabled', true);

            // Validate the form.
            if (this.form()) {
                // Handle remote validation rules.
                if (this.pendingRequest) {
                    this.formSubmitted = true;

                    return false;
                }

                // Form is valid, trigger form submission event.
                $(form).trigger('form:submit');

                // If the form is marked as using AJAX, then return false to prevent the page refreshing.
                if (typeof $(form).data('ajax') !== "undefined") {
                    return false;
                }

                // Submit the form (will cause the page to refresh etc).
                form.submit();
            } else {
                $(form).find('input[type="submit"], button[type="submit"]').prop('disabled', false);
                this.focusInvalid();
                return false;
            }
        },

        focusInvalid: true,

        invalidHandler: function(event, validator) {
            // Enable submit button again (necessary for invalid remote validation).
            $(this).find(':submit').prop('disabled', false);

            if (!validator.numberOfInvalids())
                return;

            // If the error is on another tab, switch to it.
            if ($(validator.errorList[0].element).parents('.sp-tab-content').length) {
                // Get tab ID
                var id = $(validator.errorList[0].element).parents('.sp-tab-content').attr('id');

                // Get name from ID and click on the tab
                if (typeof id !== 'undefined' && id.substring(0, 3) == 'tab') {
                    $('.sp-tabs li#' + id.substring(3)).trigger('click');
                }
            }

            // Move towards the first error (only if visible).
            if ($(validator.errorList[0].element).is(':visible')) {
                $('html, body, #content').animate({
                    scrollTop: $(validator.errorList[0].element).position().top - 44
                }, 1000);
            }

        },
    });
});

// Adds a button to show/hide passwords
function callHideShowPassword()
{
    $('input[type=password]').hideShowPassword(false, 'focus', {
        states: {
            shown: { toggle: { attr: { title: null } } },
            hidden: { toggle: { attr: { title: null } } }
        },
        toggle: {
            className: 'sp-button-sm'
        }
    });
}
