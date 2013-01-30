/* =============================================================
 * bootstrap-typeahead.js v2.2.2
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
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
    typeahead: function(options) {
        if ( this.retrieve('Typeahead') === null ) {
            this.store('Typeahead', new Typeahead (options, this));
        }
        return this.retrieve('Typeahead');
    }
});

Typeahead = new Class({
    Implements: [Options, Events],
    options: {
        source:      [],    // The data source to query against. May be an array of strings or a function.
                            // The function is passed two arguments, the query value in the input field
                            // and the process callback. The function may be used synchronously by returning
                            // the data source directly or asynchronously via the process callback's single argument.

        items:       8,     // The max number of items to display in the dropdown.

        minLength:   1,     // The minimum character length needed before triggering autocomplete suggestions

        matcher:     {},    // The method used to determine if a query matches an item. Accepts a single argument, the item
                            // against which to test the query. Access the current query with this.query. Return a boolean true if query is a match.

        sorter:      {},    // Method used to sort autocomplete results. Accepts a single argument items and has the scope of the
                            // typeahead instance. Reference the current query with this.query.

        updater:     {},    // The method used to return selected item. Accepts a single argument, the item and has the scope of the typeahead instance.

        highlighter: {},    // Method used to highlight autocomplete results. Accepts a single argument item and has the scope of the typeahead instance. Should return html.

        menu:        '<ul class="typeahead dropdown-menu"></ul>',
        item:        '<li><a href="#"></a></li>'
    },

    initialize: function (options, element) {
        this.element = element;
        this.setOptions(options);

        this.menu = new Elements.from(this.options.menu)[0];
        this.item = new Elements.from(this.options.item)[0];

        this.listen();
    },

    select: function () {
        var active = this.menu.getElement('.active');
        var val    = active.get('data-value');

        this.element
            .set('value', this.updater(val))
            .fireEvent('change', new Event.Mock(this.element, 'change'));

        return this.hide();
    },

    updater: function (item) {
        return item;
    },

    show: function () {
        var pos = Object.merge({}, this.element.getCoordinates(), {
            height: this.element.offsetHeight
        });

        this.menu.inject(this.element, 'after')
            .setStyles({
                top: pos.top + pos.height,
                left: pos.left
            })
            .show();

        this.shown = true;

        return this;
    },

    hide: function () {
        this.menu.hide();
        this.shown = false;
        return this;
    },

    lookup: function (event) {
        var items;

        this.query = this.element.get('value');

        if (!this.query || this.query.length < this.options.minLength) {
            return this.shown ? this.hide() : this;
        }

        items = typeof this.options.source == 'function' ? this.options.source(this.query, this.process.bind(this)) : this.options.source;

        return items ? this.process(items) : this;
    },

    process: function (items) {
        items = items.filter(function (item) {
            return this.matcher(item);
        }.bind(this));

        items = this.sorter(items);

        if (!items.length) {
            return this.shown ? this.hide() : this;
        }

        return this.render(items.slice(0, this.options.items)).show();
    },

    matcher: function (item) {
        return ~item.toLowerCase().indexOf(this.query.toLowerCase());
    },

    sorter: function (items) {
        var beginswith = [];
        var caseSensitive = [];
        var caseInsensitive = [];
        var item;

        while (item = items.shift()) {
            if (!item.toLowerCase().indexOf(this.query.toLowerCase())) {
                beginswith.push(item);
            } else if (~item.indexOf(this.query)) {
                caseSensitive.push(item);
            } else  {
                caseInsensitive.push(item);
            }
        }

        return beginswith.concat(caseSensitive, caseInsensitive);
    },

    highlighter: function (item) {
        var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>';
        });
    },

    render: function (items) {
        items = items.map(function (item, i) {
            i = this.item.clone();
            i.set('data-value', item);
            i.getElement('a').set('html', this.highlighter(item));
            return i;
        }.bind(this));

        this.menu.set('html', null);

        items.each(function (item) {
            item.inject(this.menu);
        }.bind(this));

        this.menu.getFirst('li').addClass('active');
        return this;
    },

    next: function (event) {
        var active = this.menu.getElement('.active').removeClass('active');
        var next = active.getNext();

        if (next === null) {
            next = this.menu.getElement('li');
        }

        next.addClass('active');
    },

    prev: function (event) {
        var active = this.menu.getElement('.active').removeClass('active');
        var prev   = active.getPrevious();

        if (prev === null) {
            prev = this.menu.getLast('li');
        }

        prev.addClass('active');
    },

    listen: function () {
        this.element.addEvents({
            'blur': function (e) {
                this.blur(e);
            }.bind(this),
            'keypress': function (e) {
                this.keypress(e);
            }.bind(this),
            'keyup': function (e) {
                this.keyup(e);
            }.bind(this)
        });

        if (this.eventSupported('keydown')) {
            this.element.addEvent('keydown', function (e) {
                this.keydown(e);
            }.bind(this));
        }

        this.menu.addEvents({
            'click:relay(li)': function (e) {
                this.click(e);
            }.bind(this),
            'mouseenter:relay(li)': function (e) {
                this.mouseenter(e);
            }.bind(this)
        });
    },

    eventSupported: function (eventName) {
        var isSupported = typeof this.element['on' + eventName] != 'undefined';

        if (!isSupported) {
            this.element.set('on' + eventName, 'return;');
            isSupported = typeof this.element['on' + eventName] === 'function';
        }

        return isSupported;
    },

    move: function (e) {
        if (!this.shown) return;

        switch(e.code) {
            case 9: // tab
            case 13: // enter
            case 27: // escape
                e.preventDefault();
                break;

            case 38: // up arrow
                e.preventDefault();
                this.prev();
                break;

            case 40: // down arrow
                e.preventDefault();
                this.next();
                break;
        }

        e.stopPropagation();
    },

    keydown: function (e) {
        this.suppressKeyPressRepeat = ~[40,38,9,13,27].indexOf(e.code);
        this.move(e);
    },

    keypress: function (e) {
        if (this.suppressKeyPressRepeat) return;
        this.move(e);
    },

    keyup: function (e) {
        switch(e.code) {
            case 40: // down arrow
            case 38: // up arrow
            case 16: // shift
            case 17: // ctrl
            case 18: // alt
                break;

            case 9: // tab
            case 13: // enter
                if (!this.shown) return;
                this.select();
                break;

            case 27: // escape
                if (!this.shown) return;
                this.hide();
                break;

            default:
                this.lookup();
      }

      e.stopPropagation();
      e.preventDefault();
    },

    blur: function (e) {
        setTimeout(function () {
            this.hide();
        }.bind(this), 150);
    },

    click: function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.select();
    },

    mouseenter: function (e) {
        var target = e.target.get('data-value') === null ? e.target.getParent('li') : e.target;
        this.menu.getElements('.active').removeClass('active');
        target.addClass('active');
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
 * Seek out all data-provide=typeahead elements, bind on focus.
 * @return void
 */

window.addEvent('domready', function() {
    $(document.body).getElements('[data-provide=typeahead]').each(function (element) {
        element.typeahead();
    });
});
