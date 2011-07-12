/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 15:00
 *
 */
dojo.provide("ui.TextInput");
dojo.require("ui.Object");

dojo.declare("ui.TextInput", ui.Object, {
    valueFilter: null,
    dropDownBtn: null,
    dropDown: null,
    dropDownId: null,
    buttonsId: null,
    inputId: null,
    options: null,
    value: null,
    type: null,
    minSize: null,
    dynamicSize: null,

    constructor: function(args) {
        this.options = args.options || [];
        this.type = args.type || 'text';
        this.value = args.value || "";
        this.error = args.error || this.error;
        this.warning = args.warning || this.warning;
        this.valueFilter = args.valueFilter;
        this.dynamicSize = args.dynamicSize;
        this.minSize = args.minSize;
    },

    create: function() {
        //execute method of super class
        this.inherited(arguments);

        //create ids
        this.dropDownId = this.htmlId + 'DropDown';
        this.buttonsId = this.htmlId + 'Buttons';
        this.inputId = this.htmlId + 'Input';

        //place input
        dojo.place(
            '<div class="TextInput" id="' + this.htmlId + '">' +
                '<input type="' + this.type + '" class="input" id="' + this.inputId + '" />' +
                '<div class="buttons" id="' + this.buttonsId + '"></div>' +
                '<div class="dropDown" id="' + this.dropDownId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        this.setValue(this.value);

        this.connect({
            event: "onkeyup",
            nodeId: this.inputId,
            method: function() {
                var input = dojo.byId(this.inputId);
                //TODO test on empty strings and set a warning or error if necessary
                //TODO empty strings must be declared as warning or error before
                this.value = input.value;

                //sets an error if true
                if(this.error(this.value)) {
                    dojo.addClass(input, "error");
                } else {
                    dojo.removeClass(input, "error");
                }

                //sets a warning if true
                if(this.warning(this.value)) {
                    dojo.addClass(input, "warning");
                } else {
                    dojo.removeClass(input, "warning");
                }

                //set dynamic input size
                if(this.dynamicSize) {
                    this.setSize(this.value.length);
                }
            }
        });

        //create only a drop down menu if necessary
        if(this.options.length > 0) {
            //create a new drop down menu
            this.dropDown = new ui.TextInputDropDown({
                placeAt: this.dropDownId,
                options: this.options,
                parent: this
            });

            //set min size
            this.minSize = this.dropDown.size;

            //add drop down button
            this.dropDownBtn = new ui.TextInputButton({
                placeAt: this.buttonsId,
                icon: "arrow",
                onClick: dojo.hitch(this, function(event) {
                    //open drop down menu
                    if(this.dropDown.isOpen) {
                        this.dropDown.close();
                    } else {
                        this.dropDown.open(0, 0);
                    }
                })
            });
        }

        //set input size
        this.setSize(this.minSize);
    },

    /**
     *
     * @param value
     */
    error: function(value) {
        return false;
    },

    warning: function(value) {
        return false;
    },

    /**
     * gets the current set value
     * of this text input
     */
    getValue: function() {
        var val = this.value;

        //filter value
        if(this.valueFilter) {
            val = this.valueFilter(val);
        }

        return val;
    },

    setValue: function(value) {
        this.value = value || "";
        dojo.byId(this.inputId).value = value;
    },

    /**
     * sets the input size
     * @param size
     */
    setSize: function(size) {
        if(!this.minSize) this.minSize = 2;
        size = size || this.minSize;
        var input = dojo.byId(this.inputId);
        if(size < this.minSize) size = this.minSize;
        dojo.attr(input, "size", size);
    }
});

dojo.declare("ui.TextInputButton", ui.Object, {
    onClick: null,
    title: null,
    icon: null,

    /**
     * initializes button with
     * the following properties
     *
     * args: {
     *  onClick: function -> executes on an onClick event
     *  title: string -> [optional] button title
     *  icon: string -> [optional] css-class like "arrow"
     * }
     *
     * @param args
     */
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title || "";
        this.icon = args.icon;

        this.create();
    },

    /**
     * creates a button with a title or an icon.
     * in addition it sets the onClick handle.
     */
    create: function() {
        //call method of super class
        this.inherited(arguments);

        //place button node
        dojo.place(
            '<div class="button" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //set icon class if given
        if(this.icon) this.setIcon(this.icon);
        else if(this.title) this.setTitle(this.title);

        //set event handler for an onClick event
        this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function(event) {
                if(this.onClick) this.onClick(event);
            }
        })
    },

    /**
     * sets button icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        var node = dojo.byId(this.htmlId);
        this.icon = icon || "";

        dojo.attr(node, "class", "button icon " + this.icon);
    },

    /**
     * sets the button title
     * @param title string
     */
    setTitle: function(title) {
        var node = dojo.byId(this.htmlId);
        this.title = title || "";

        node.innerHTML = this.title;
        dojo.attr(node, "class", "button title");
    }
});

dojo.declare("ui.TextInputDropDown", ui.Object, {
    isOpen: null,
    onOpen: null,
    onClose: null,
    options: null,
    input: null,
    size: null,

    /**
     * initializes drop down menu
     *
     * args: {
     *  onOpen: function -> executes if menu will open
     *  onClose: function -> executes if menu will close
     *  options: array of options,
     *  parent: ui.TextInput 
     * }
     *
     * @param args
     */
    constructor: function(args) {
        this.onOpen = args.onOpen;
        this.onClose = args.onClose;
        this.options = args.options;
        this.input = args.parent;

        this.create();
    },

    /**
     * creates and places the drop down menu
     */
    create: function() {
        //call method of super class
        this.inherited(arguments);

        //place button node
        dojo.place(
            '<div class="DropDownMenu" style="opacity: 0; display: none;" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        this.addOptions(this.options);
    },

    /**
     * opens the drop down menu on the given position
     * @param x integer
     * @param y integer
     */
    open: function(x, y) {
        this.isOpen = true;
        this.setPosition(x, y);
        this.show();
    },

    /**
     * closes the drop down menu
     */
    close: function() {
        this.isOpen = false;
        this.hide();
    },

    /**
     * adds options to the drop down menu
     * options: [
     *   {
     *      title: string,
     *      value: string -> unique value,
     *      icon: string -> css class
     *      onClick: function -> will be executed on an onClick event
     *   }
     * ]
     * @param options array
     */
    addOptions: function(options) {
        var maxLength = 0;
        if(!this.options) this.options = {};
        dojo.forEach(options, dojo.hitch(this, function(option) {
            //create new option and store it
            if(!this.options[option.value]) {
                this.options[option.value] = new ui.TextInputOption({
                    placeAt: this.htmlId,
                    parent: this,
                    title: option.title,
                    icon: option.icon,
                    value: option.value,
                    onClick: option.onClick
                });

                var length = option.value.length;
                if(length > maxLength) maxLength = length;
            }
        }));

        //set min input size
        this.size = maxLength;
    },

    /**
     * sets the position of the drop down menu
     * @param x
     * @param y
     */
    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        dojo.style(node, "left", x + "px");
        dojo.style(node, "top", y + "px");
    }
});

dojo.declare("ui.TextInputOption", ui.Object, {
    dropDown: null,
    onClick: null,
    title: null,
    icon: null,
    value: null,

    /**
     * initializes drop down option
     *
     * args: {
     *  onClick: function -> executes on an onClick event
     *  title: string -> [optional] option title
     *  value: string
     *  icon: string -> [optional] css-class like "public"
     *  parent: ui.TextInputDropDown
     * }
     *
     * @param args
     */
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title || "";
        this.icon = args.icon;
        this.dropDown = args.parent;
        this.value = args.value;

        this.create();
    },

    /**
     * creates a option with a title and icon.
     * in addition it sets the onClick handle.
     */
    create: function() {
        //call method of super class
        this.inherited(arguments);

        //create ids
        this.iconId = this.htmlId + "Icon";
        this.titleId = this.htmlId + "Title";

        //place button node
        dojo.place(
            '<div class="option" id="' + this.htmlId + '">' +
                 '<div class="icon" id="' + this.iconId + '"></div>' +
                 '<div class="title" id="' + this.titleId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //set icon class if given
        this.setIcon(this.icon);
        this.setTitle(this.title);

        //set value and close drop down menu
        this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function() {
                if(this.onClick) this.onClick();
                this.dropDown.input.setValue(this.value);
                this.dropDown.close();
            }
        })
    },

    /**
     * sets the option icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        var node = dojo.byId(this.iconId);
        this.icon = icon || "";

        dojo.attr(node, "class", "icon " + this.icon);
    },

    /**
     * sets the button title
     * @param title string
     */
    setTitle: function(title) {
        var node = dojo.byId(this.titleId);
        this.title = title || "";

        node.innerHTML = this.title;
    }
});