 /**
  * Inspired from https://github.com/nostalgiaz/bootstrap-toggle-buttons
  * Copyright: Sentral Education 2013 by Darren Nolan.
  * etc. etc.
  *
  * Takes a checkbox, and makes it purdy bootstrap buttons and toggles states.
  * @todo : Animation of the toggle.
  *
  *
  * Options:
  *  size: (as per bootstrap buttons) large, small, mini or false for default)
  *  enabled: (as per bootstrap buttons) primary, danger, info, success, warning or false for default button color.
  *  enabledtext: Text Label for Enabled/Active button
  *  disabled: (as per bootstrap buttons) primary, danger, info, success, warning or false for default button color.
  *  disabledtext: Text Label for Enabled/Active button
  *
  *  animation: boolean = CSS3 transition between button states.  Fixed at 0.2s at this stage.
  *
  *
  * Usage:
  *
  * <div data-toggle="toggleButtons" data-enabledtext="Shown" data-disabledtext="Hidden">
  *   <input type="checkbox" id="showWeekends">
  * </div>
  *
  *
  */
 Element.implement ({
    toggleButtons: function (options) {
        if (this.retrieve('toggleButtons') === null) {
            this.store('toggleButtons', new toggleButtons (options, this));
        }
        return this.retrieve('toggleButtons');
    }
 });

 toggleButtons = new Class({
    Implements: [Options, Events],
    options: {
        size:        false,    // 'large', 'small', 'mini' or false for default button size.

        enabled:     'primary',  // 'primary', 'danger', 'info', 'success', 'warning' or false for default button color.
        enabledtext: 'ON',

        disabled:    false,
        disabledtext:'OFF',

        animation:    true
    },

    initialize: function (options, element) {

        this.element  = element;
        this.checkbox = element.getElement('input[type=checkbox]');

        this.setOptions(options);               // Merge passed options to this.options
        this.setOptions(this.getDataOptions()); // Merge Data- Options to this.options

        this.enabled = true;

        if (this.checkbox.checked) {
            this.state = true;
        } else {
            this.state = false;
        }

        this.displayButtons();

        this.checkbox.addEvent('change', function() {
            if (this.checkbox.checked) {
                this.setOn(true);
            } else {
                this.setOff(true);
            }
        }.bind(this));
    },

    displayButtons: function () {
        this.checkbox.hide();
        this.element.addClass('toggle-buttons');

        this.button_container = new Element('div').addClass('btn-group');

        this.button_blank = new Element('button').addClass('btn');
        if (this.options.size) {
            this.button_blank.addClass('btn-' + this.options.size);
        }


        this.button_left = this.button_blank.clone().set('text', this.options.enabledtext);
        if (this.options.enabled) {
            this.button_left.addClass('btn-' + this.options.enabled);
        }
        this.button_right = this.button_blank.clone().set('text', this.options.disabledtext);
        if (this.options.disabled) {
            this.button_right.addClass('btn-' + this.options.disabled);
        }


        this.button_container
            .grab(this.button_left)
            .grab(this.button_blank)
            .grab(this.button_right);

        this.button_container.inject(this.element, 'bottom');

        this.button_container.disableSelection();

        var button_left_size  = this.button_left.measure( function() { return this.getSize(); });
        var button_right_size = this.button_right.measure( function() { return this.getSize(); });
        var button_width      = (button_left_size.x > button_right_size.x) ? button_left_size.x : button_right_size.x;
        var button_height     = (button_left_size.y > button_right_size.y) ? button_left_size.y : button_right_size.y;

        var button_styles = {
            'position': 'absolute',
            'width':    button_width -1,
            'height':   button_height,
            'margin-left': 0
        };

        if (this.checked()) {
            this.button_left.setStyles(button_styles).setStyle('left', '0%');
            this.button_blank.setStyles(button_styles).setStyle('left', '50%');
            this.button_right.setStyles(button_styles).setStyle('left', '100%');

            this.button_blank.style.borderTopRightRadius    = '4px';
            this.button_blank.style.borderBottomRightRadius = '4px';
            this.button_blank.style.borderTopLeftRadius     = '0px';
            this.button_blank.style.borderBottomLeftRadius  = '0px';
        } else {
            this.button_left.setStyles(button_styles).setStyle('left', '-50%');
            this.button_blank.setStyles(button_styles).setStyle('left', '0%');
            this.button_right.setStyles(button_styles).setStyle('left', '50%');

            this.button_blank.style.borderTopRightRadius    = '0px';
            this.button_blank.style.borderBottomRightRadius = '0px';
            this.button_blank.style.borderTopLeftRadius     = '4px';
            this.button_blank.style.borderBottomLeftRadius  = '4px';
        }

        if (this.options.animation) {
            this.button_left.style.transition = 'left 0.2s';
            this.button_blank.style.transition = 'left 0.2s';
            this.button_right.style.transition = 'left 0.2s';

            this.button_left.style.WebkitTransition = 'left 0.2s';
            this.button_blank.style.WebkitTransition = 'left 0.2s';
            this.button_right.style.WebkitTransition = 'left 0.2s';

            this.button_left.style.MozTransition = 'left 0.2s';
            this.button_blank.style.MozTransition = 'left 0.2s';
            this.button_right.style.MozTransition = 'left 0.2s';
        }

        this.button_container.setStyles({
            'overflow': 'hidden',
            'width':    (button_width * 2) -2,
            'height':   button_height
        });

        this.button_container.style.borderRadius    = '4px';
        this.button_container.style.MozBorderRadius = '4px';

        this.button_left.addEvent('click', function (event) {
            event.stop();
            this.toggleState();
        }.bind(this));
        this.button_right.addEvent('click', function (event) {
            event.stop();
            this.toggleState();
        }.bind(this));
        this.button_blank.addEvent('click', function (event) {
            event.stop();
            this.toggleState();
        }.bind(this));

    },

    deleteButtons: function () {
        this.enabled = false;
        this.checkbox.show();
        this.element.removeClass('btn-group');
        this.button_container.dispose();
    },

    toggleState: function () {
        if (this.state) {
            this.setOff();
        } else {
            this.setOn();
        }
    },

    setOn: function (triggered_manually) {
        if (typeof triggered_manually == 'undefined' || triggered_manually === false) {

            e = new Event.Mock(this.element, 'setoff');
            this.element.fireEvent('setoff', e);

            if (!this.enabled || e.isDefaultPrevented()) {
                return;
            }

            e = new Event.Mock(this.checkbox, 'change');
            this.checkbox.fireEvent('change', e);

            this.checkbox.checked = true;

        }

        this.state = true;

        this.button_left.setStyle('left', '0%');
        this.button_blank.setStyle('left', '50%');
        this.button_right.setStyle('left', '100%');

        this.button_blank.style.borderTopRightRadius    = '4px';
        this.button_blank.style.borderBottomRightRadius = '4px';
        this.button_blank.style.borderTopLeftRadius     = '0px';
        this.button_blank.style.borderBottomLeftRadius  = '0px';

    },

    setOff: function (triggered_manually) {
        if (typeof triggered_manually == 'undefined' || triggered_manually === false) {

            e = new Event.Mock(this.element, 'setoff');
            this.element.fireEvent('setoff', e);

            if (!this.enabled || e.isDefaultPrevented()) {
                return;
            }

            e = new Event.Mock(this.checkbox, 'change');
            this.checkbox.fireEvent('change', e);

            this.checkbox.checked = false;

        }

        this.state = false;

        this.button_left.setStyle('left', '-50%');
        this.button_blank.setStyle('left', '0%');
        this.button_right.setStyle('left', '50%');

        this.button_blank.style.borderTopRightRadius    = '0px';
        this.button_blank.style.borderBottomRightRadius = '0px';
        this.button_blank.style.borderTopLeftRadius     = '4px';
        this.button_blank.style.borderBottomLeftRadius  = '4px';

    },

    checked: function () {
        return this.state;
    },

    enable: function () {
        this.enabled = true;
        this.button_left.removeClass('disabled');
        this.button_right.removeClass('disabled');
        return this;
    },
    disable: function () {
        this.enabled = false;
        this.button_left.addClass('disabled');
        this.button_right.addClass('disabled');
        return this;
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

Element.implement({
    disableSelection: function(){
        if (typeof this.onselectstart!="undefined") //IE route
            this.onselectstart=function(){return false;};
        else if (typeof this.style.MozUserSelect!="undefined") //Firefox route
            this.style.MozUserSelect="none";
        else //All other route (ie: Opera)
            this.onmousedown=function(){return false;};
        this.style.cursor = "default";
        return this;
        //this.addClass('-webkit-user-select','none');
    }
});

/**
 * Seek out all data-toggle=modal elements, and if they have data-target="#foo" or href="#foo" - that's our target modal.
 * @return void
 */
window.addEvent('domready', function() {
    $(document.body).getElements('[data-toggle=toggleButtons]').each(function (element) {
        element.toggleButtons();
    });
});

