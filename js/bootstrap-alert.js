/* ==========================================================
 * bootstrap-alert.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Modified for MooTools by GP Technology Solutions Pty Ltd
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

/* ==========================================================
 * bootstrap-alert.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Modified for MooTools by GP Technology Solutions Pty Ltd
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
    alert: function(options) {
        if ( this.retrieve('alert') === null ) {
            this.store('alert', new Alert (options, this));
        }
        return this.retrieve('alert');
    }
});

Alert = new Class({
    Implements: [Options, Events],
    options: {
        animation: true
    },

    initialize: function (options, selector) {
        this.selector = selector;

        this.setOptions(options);
        this.setOptions(this.getDataOptions(selector));

        if (!this.options.target) {

            this.target = selector.getParent('.alert');

        } else {

            this.target = this.options.target;

        }
    },

    close: function (e) {
        e && e.preventDefault(); // If e is event, prevent default action

        this.target.fireEvent('close', new Event.Mock(this.target, 'close'));

        if (this.options.animation) {

            this.target.fadeAndDestroy();

        } else {

            this.target.hide().dispose();

        }
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
    }
});

window.addEvent('domready', function() {
    $(document.body).addEvent('click:relay([data-dismiss=alert])', function() {
        this.alert().close();
    });
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

Element.implement({
    fadeAndDestroy: function(duration) {
        var el = this;
        duration = duration || 600;
        this.set('tween', {
            duration: duration
        }).fade('out').get('tween').chain(function() {
            el.dispose();
        });
    }
});
