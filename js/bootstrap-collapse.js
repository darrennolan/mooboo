/* =============================================================
 * bootstrap-collapse.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
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
 * ============================================================ */

 Element.implement ({
    collapse: function (options) {
        if ( this.retrieve('collapse') === null ) {
            this.store('collapse', new Collapse (options, this));
        }
        return this.retrieve('collapse');
    }
 });

 Collapse = new Class({
    Implements: [Options],
    options: {
        parent: false,  //selector    false   If selector then all collapsible elements under the specified parent will be closed when this collapsible item is shown. (similar to traditional accordion behavior)
        target: false
    },

    initialize: function (options, element) {
        // Element is the "a" tag. DONT FORGET THAT DAZZ.
        this.element = element;
        this.setOptions(options);
        this.setOptions(this.getDataOptions());

        this.bindEvent();
    },

    bindEvent: function () {
        this.element.addEvent('click', function (event) {
            event.preventDefault();
            this.toggle();
        }.bind(this));
    },

    show: function () {
        if (this.getTarget().hasClass('in')) return;

        this.element.fireEvent('show', this.element);

        if (this.options.parent) {
            $$(this.options.parent)[0].getElements('[data-toggle=collapse]').each(function (element) {
                if (element != this.element) {
                    element.collapse().hide();
                }
            }.bind(this));
        }

        this.getTarget().addClass('in');

        this.element.fireEvent('shown', this.element);
    },

    hide: function () {
        if ( ! this.getTarget().hasClass('in') ) return;

        this.element.fireEvent('hide', this.element);

        this.getTarget().removeClass('in');

        this.element.fireEvent('hidden', this.element);
    },

    toggle: function () {
        if (this.isOpen()) {
            this.hide();
        } else {
            this.show();
        }
    },

    isOpen: function () {
        return this.getTarget().hasClass('in');
    },

    getTarget: function () {
        if (this.options.target) {
            return $$(this.options.target)[0];
        } else {
            return $$(this.element.getProperty('href').replace(/.*(?=#[^\s]+$)/, ''))[0];
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
    }
 });

window.addEvent('domready', function () {
    $(document.body).getElements('[data-toggle=collapse]').each(function (element) {
        element.collapse();
    });
});
