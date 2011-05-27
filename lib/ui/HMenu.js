/**
 * User: Christoph Grundmann
 * Date: 27.05.11
 * Time: 17:04
 *
 * horizontal menu
 */
dojo.provide("ui.HMenu");

dojo.declare("ui.HMenu", ui.Object, {
    structure: null,

    constructor: function(args) {
        this.structure = args.structure;
        
    }
});

/**
 * button for horizontal menus
 */
dojo.declare("ui.HMenuButton", ui.Object, {
    onClick: null,
    title: null,
    menu: null,
    
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title;
        this.menu = args.menu;
    },

    /**
     * creates the button
     * @param placeAt string id of the parent node
     */
    create: function(placeAt) {
        this.placeAt = placeAt || this.placeAt;

        //execute superclass function
        this.inherited(arguments);

        //place button
        dojo.place(
            '<li class="HMenuButton" id="' + this.htmlId + '">' +
                '<div class="title">' + this.title + '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //register onClick event handler
        this.connect({
            name: "ButtonClick",
            event: "onclick",
            method: function(event) {
                //execute onClick function
                if(this.onClick) this.onClick();
            }
        });

        //TODO create menu
        //if(this.menu)
    }
});

/**
 * drop down menu for horizontal menus
 */
dojo.declare("ui.HMenuDropDown", ui.Object, {
    buttons: null,

    constructor: function(args) {
        this.buttons = args.buttons;
    },

    create: function(placeAt) {
        this.placeAt = placeAt || this.placeAt;

        //execute superclass function
        this.inherited(arguments);

        //place drop down menu
        dojo.place(
            '<ul class="HMenuDropDown" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //insert button
        if(this.buttons) dojo.forEach(this.buttons,
            dojo.hitch(this, function(btn) {
                btn.create(this.htmlId);
            })
        );
    }
});

