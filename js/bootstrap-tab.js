/* ========================================================
 * bootstrap-tab.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
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
 * ======================================================== */

/**
 * @todo  Support Dropdown menu items in the list of tabs
 */

Element.implement ({
    tab: function(options) {
        if ( this.retrieve('tab') === null ) {
            this.store('tab', new Tab (options, this));
        }
        return this.retrieve('tab');
    }
});

Tab = new Class({
    Implements: [Options, Events],
    options: {

    },

    initialize: function (options, tab) {
        this.tab  = tab;
        this.list = tab.getParent('ul:not(.dropdown-menu)');

        if (!this.list) {
            return; // Unable to find parent ul to sit on.
        }

        this.setOptions(options);
        this.setOptions(this.getDataOptions(this.tab));

        if (!this.options.target) {
            this.selector = this.tab.get('href');
            this.selector = this.selector && this.selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
            this.selector = $(document.body).getElement(this.selector);
        }

        this.tab.addEvent('click', function(event) {
            event.preventDefault();
            this.show();
        }.bind(this));
    },

    show: function () {
        if (this.tab.getParent('li').hasClass('active')) return;

        previous = this.list.getElement('.active:last a');

        e = new Event.Mock(this.tab, { type: 'show', relatedTarget: previous });
        this.tab.fireEvent('show', e);

        if (e.isDefaultPrevented()) return; // Someone stopped the event;

        this.activate(this.tab.getParent('li'), this.list);
        this.activate(this.selector, this.selector.getParent(), function () {
            this.tab.fireEvent('shown', new Event.Mock(this.tab, { type: 'shown', relatedTarget: previous }));
        }.bind(this));
    },

    activate: function (element, container, callback) {
        var active = container.getElement('> .active');
        var transition = callback && this.browserTransitionEnd() && active.hasClass('fade');

        function next() {
            active.removeClass('active');

            if (active.getElement('> .dropdown-menu > .active')) {
                active.getElement('> .dropdown-menu > .active').removeClass('active');
            }

            element.addClass('active');

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in');
            } else {
                element.removeClass('fade');
            }

            if (element.getParent('.dropdown-menu')) {
                element.getElement('li.dropdown').addClass('active');
            }

            callback && callback();
        }

        transition ? active.addEventListener(this.browser_transition_end, next) : next();

        active.removeClass('in');

    },

    /**
     * Get Options set on the Element via the dataset tags, data-animation etc.
     * @return object Key Value pair object of dataset tags.
     */
    getDataOptions: function (selector) {
        var dataset_name;
        var dataset_value;
        var options = {};
        var element = selector;

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
    },

    browserTransitionEnd: function () {
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
          'transition':'transitionEnd',
          'OTransition':'oTransitionEnd',
          'MSTransition':'msTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
        };

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }

        return false;
    }
});

/**
 * http://davidwalsh.name/mootools-event
 * creates a Mock event to be used with fire event
 * @param Element target an element to set as the target of the event - not required
 *  @param string type the type of the event to be fired. Will not be used by IE - not required.
 *
 */
Event.Mock = function(target,type){
    var e = window.event;
    type = type || 'click';

    if (document.createEvent){
        e = document.createEvent('HTMLEvents');
        e.initEvent(
          type, //event type
          false, //bubbles - set to false because the event should like normal fireEvent
          true //cancelable
        );
    }
    e = new Event(e);
    e.target = target;
    return e;
};

Event.implement({
    isDefaultPrevented: function () {
        return this.event.defaultPrevented;
    }
});

/**
 * Seek out all data-toggle=tab elements, and we have target tabs.
 * @return void
 */
window.addEvent('domready', function() {
    $(document.body).getElements('[data-toggle=tab]').each(function (element) {
        if (element.get('data-target') !== null || element.get('href') !== null) {
            element.tab();
        }
    });
});
