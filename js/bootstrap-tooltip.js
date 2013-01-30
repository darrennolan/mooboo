/* ===========================================================
 * bootstrap-tooltip.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

Element.implement ({
    tooltip: function(options) {
        if ( this.retrieve('tooltip') === null ) {
            this.store('tooltip', new Tooltip (options, this));
        }
        return this.retrieve('tooltip');
    }
});

Tooltip = new Class({
    Implements: [Options],
    options: {
        animation: true,        // apply a css fade transition to the tooltip

        html: false,            // Insert html into the tooltip. If false, jquery's text method will be used to insert content into the dom. Use text if you're worried about XSS attacks.

        placement: 'top',       // string|function - top | bottom | left | right

        selector: false,        // If a selector is provided, tooltip objects will be delegated to the specified targets.

        title: '',              // default title value if `title` tag isn't present

        trigger: 'hover',       // how tooltip is triggered - click | hover | focus | manual

        delay: 0,               // delay showing and hiding the tooltip (ms) - does not apply to manual trigger type
                                // If a number is supplied, delay is applied to both hide/show
                                // Object structure is: delay: { show: 500, hide: 100 }

        document_placement: false,  // MOOBOO SPECIFIC OPTION
                                    //  false:  Tip inserts itself after selector/element
                                    //  true:   Tip inserts itself into the end of the $(document.body)
                                    //  string: ID Selector for Tip Placement, to be placed inside
                                    //  {Mootools Element}: Tip inserts inside given element
                                    //
                                    //  By default, bootstrap Tips will place themselves just after the selector/element - which can cause stupid css inheritance issues.

        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'

        // Heads up! Options for individual tooltips can alternatively be specified through the use of data attributes.
    },

    initialize: function (options, element) {
        var eventIn, eventOut;

        this.enabled    = true;
        this.tip        = false;
        this.hoverState = false;
        this.element    = element;

        this.setOptions(options);               // Merge passed options to this.options
        this.setOptions(this.getDataOptions()); // Merge Data- Options to this.options


        if (!this.options.selector) {

            // Default Tooltip appearance to this element.
            this.options.selector = this.element;

        } else if (!isElement(this.options.selector)) {

            // If options selector isn't already a HTML element, make it so.
            this.options.selector = $(this.options.selector);

        }


        if ( this.options.trigger == 'click' ) {

            this.element.addEvent('click', this.toggle.bind(this));

        } else if ( this.options.trigger != 'manual' ) {

            eventIn  = (this.options.trigger == 'hover' ? 'mouseenter' : 'focus');
            eventOut = (this.options.trigger == 'hover' ? 'mouseleave' : 'blur');

            this.element.addEvent(eventIn, this.enter.bind(this));
            this.element.addEvent(eventOut, this.leave.bind(this));
        }

        this.fixTitle();

        if (this.options.delay && typeof this.options.delay == 'number') {

            this.options.delay = {
                show: this.options.delay,
                hide: this.options.delay
            };

        }

    },

    enter: function () {
        var delay = this.options.delay.show;

        if (!delay) return this.show();

        clearTimeout(this.timeout);

        this.hoverState = 'in';

        this.timeout = setTimeout(function() {
            if (this.hoverState == 'in') {
                this.show();
            }
        }.bind(this), delay);
    },

    leave: function () {
        var delay = this.options.delay.hide;

        if (!delay) return this.hide();

        clearTimeout(this.timeout);

        this.hoverState = 'out';

        this.timeout = setTimeout(function() {
            if (this.hoverState == 'out') {
                this.hide();
            }
        }.bind(this), delay);
    },

    fixTitle: function () {
        var title = this.element.get('title');

        if (!this.options.title) {
            if (title) {
                this.options.title = title;
                this.element.set('data-original-title', title);
                this.element.set('title', null);
            }
        }

    },

    getTitle: function () {
        return this.options.title;
    },

    hasContent: function () {
        return this.getTitle();
    },

    setContent: function () {
        var tip           = this.getTip();
        var title         = this.getTitle();
        var insert_method = this.options.html ? 'html' : 'text';

        tip.getElement('.tooltip-inner').set(insert_method, title);

        tip.removeClass('fade in top bottom left right');

        return this;
    },

    /**
     * Show Tooltip
     * @return void
     */
    show: function () {
        var tip;
        var placement = this.options.placement;
        var selector  = this.options.selector;

        if (this.hasContent() && this.enabled) {
            tip = this.getTip();
            this.setContent();

            if (this.options.animation) {

                tip.addClass('fade');

            }

            tip = tip.dispose();
            tip.setStyle('display', 'block');

            if (this.options.document_placement) {
                if (this.options.document_placement === true) {
                    $(document.body).grab(tip);
                } else if (isElement(this.options.document_placement)) {
                    this.options.document_placement.grab(tip);
                } else {
                    $(this.options.document_placement).grab(tip);
                }
            } else {
                tip.inject(selector, 'after');
            }

            if (typeof placement == 'function') {

                // I'm expecting the function to take the tip and selector and return me back the tip
                tip = placement(tip, selector);

            } else {

                tip.addClass(placement);

                // Calculate Sizes for Selector and Tip
                var tip_size      = tip.getComputedSize();
                var offset_amount;

                /**
                 * Mootools edge positions were inconsistant in this situation,
                 * calculating offset from relativeToElement manually.
                 */
                switch (placement) {
                    case 'top':
                        offset_amount = {
                            x: -(tip_size.totalWidth / 2),
                            y: -(tip_size.totalHeight)
                        };

                        tip.position({
                            'relativeTo': selector,
                            'position': 'centerTop',
                            'offset': offset_amount
                        });
                        break;

                    case 'right':
                        offset_amount = {
                            x: 0,
                            y: -(tip_size.totalHeight / 2)
                        };
                        tip.position({
                            'relativeTo': selector,
                            'position': 'centerRight',
                            'offset': offset_amount
                        });
                        break;

                    case 'bottom':
                        offset_amount = {
                            x: -(tip_size.totalWidth / 2),
                            y: 0
                        };
                        tip.position({
                            'relativeTo': selector,
                            'position': 'centerBottom',
                            'offset': offset_amount
                        });
                        break;

                    case 'left':
                        offset_amount = {
                            x: -(tip_size.totalWidth),
                            y: -(tip_size.totalHeight / 2)
                        };
                        tip.position({
                            'relativeTo': selector,
                            'position': 'centerLeft',
                            'offset': offset_amount
                        });
                        break;
                }

            }

            tip.addClass('in');

        }
        return this;
    },

    getTip: function () {

        if (typeof this.tip == 'undefined' || this.tip === false) {

            this.tip = new Elements.from(this.options.template);

        }

        return this.tip[0];
    },

    /**
     * Hide Tooltip
     * @return void
     */
    hide: function () {
        var tip       = this.getTip();
        var animation = this.options.animation;

        tip.removeClass('in');

        if (animation) {
            var timeout = setTimeout(function () {
                tip.dispose();
                clearTimeout(timeout);
            }, 500);
        } else {
            tip.dispose();
        }

        return this;
    },

    /**
     * Toggle Tooltip Visibility
     * @return void
     */
    toggle: function () {
        if (this.hoverState == 'in') {
            this.hoverState = 'out';
            this.hide();
        } else {
            this.hoverState = 'in';
            this.show();
        }
    },

    isShown: function () {
        return this.isShown;
    },

    disable: function () {
        this.enabled = false;
        return this;
    },

    enable: function () {
        this.enabled = true;
        return this;
    },

    toggleEnabled: function () {
        this.enabled = !this.enabled;
        return this;
    },

    /**
     * Destroy instance of Tooltip
     * @return void
     */
    destroy: function () {
        this.enabled = false;
        this.tip.dispose();
        this.element.store('tooltip', null);
    },

    /**
     * Get Options set on the Element via the dataset tags, data-animation etc.
     * @return object Key Value pair object of dataset tags.
     */
    getDataOptions: function () {
        var dataset_name;
        var dataset_value;
        var options = {};
        var element = this.element;

        if (typeof element.dataset != 'undefined') {

            for (dataset_name in element.dataset) {

                dataset_value = this.trueValue( element.dataset[dataset_name] );

                options[dataset_name] = dataset_value;
            }

            return options;

        } else if (Browser.ie) {

            // Cycle through options name to find data-<name> values where dataset is not available to us.
            for (dataset_name in this.options) {

                if (element.get('data-' + dataset_name)) {

                    options[dataset_name] = this.trueValue( element.get('data-' + dataset_name) );

                }

            }

            return options;

        } else {

            // Can't find data options, return empty object
            return {};

        }
    },

    /**
     * trueValue convert strings to their literals.
     * @param  string value String Value to convert to literal
     * @return mixed        Literal value of string where applicable, or the string.
     */
    trueValue: function (value) {
        if (value == 'true') {
            return true;
        } else if (value == 'false') {
            return false;
        } else if (value == 'null') {
            return null;
        } else {
            return value;
        }
    }
});

/**
 * Full Credit here.
 * http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
 */
function isElement(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrom)
        return obj instanceof HTMLElement;
    }
    catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
    }
}
