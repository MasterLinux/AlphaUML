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
    buttons: null,

    constructor: function(args) {
        this.structure = args.structure;
        this.buttons = [];
    },

    create: function() {
        this.inherited(arguments);

        //place menu
        dojo.place(
            '<ul class="HMenu" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //initialize menu elements
        dojo.forEach(this.structure, dojo.hitch(this, function(menu) {
            var dropDownBtns = [];

            //create buttons
            dojo.forEach(menu.buttons, dojo.hitch(this, function(btn) {
                dropDownBtns.push(new ui.HMenuButton({
                    type: "HMenuDropDownBtn",
                    onClick: btn.onClick,
                    title: btn.title,
                    menu: btn.menu
                }));
            }));

            //create drop down menu
            var dropDown = new ui.HMenuDropDown({
                buttons: dropDownBtns
            });

            //add menu button into the menu
            this.buttons.push(new ui.HMenuButton({
                type: "HMenuBtn",
                onClick: menu.onClick,
                placeAt: this.htmlId,
                title: menu.title,
                menu: dropDown
            }));
        }));

        /*
        //initialize menu elements
        for(var menu in this.structure) {
            var dropDownBtns = [];

            //get menu buttons
            var btns = this.structure[menu];

            //create menu buttons
            for(var btn in btns) {
                dropDownBtns.push(new ui.HMenuButton({
                    title: btn,
                    type: "HMenuDropDownBtn",
                    menu: btns[btn].menu,
                    onClick: btns[btn].onClick
                }));
            }

            //create drop down menu
            var dropDown = new ui.HMenuDropDown({
                buttons: dropDownBtns
            });

            //add menu button into the menu
            this.buttons.push(new ui.HMenuButton({
                placeAt: this.htmlId,
                type: "HMenuBtn",
                title: menu,
                menu: dropDown
            }));
        } */

        //create buttons
        dojo.forEach(this.buttons, function(btn) {
           btn.create();
        });
    }
});

/**
 * button for horizontal menus
 */
dojo.declare("ui.HMenuButton", ui.Object, {
    onClick: null,
    title: null,
    menu: null,
    type: null,

    /**
     * type = "HMenuDropDownBtn" || "HMenuBtn"
     * @param args
     */
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title;
        this.menu = args.menu;
        this.type = args.type;
    },

    /**
     * creates the button
     * @param placeAt string id of the parent node
     */
    create: function(placeAt) {
        this.placeAt = placeAt || this.placeAt;

        //execute superclass function
        this.inherited(arguments);

        //create necessary ids
        this.titleId = this.htmlId + "Title";
        this.buttonId = this.htmlId + "Button";

        //place button
        dojo.place(
            '<li id="' + this.htmlId + '">' +
                '<div class="' + this.type + '" id="' + this.buttonId + '">' +
                    '<div class="title" id="' + this.titleId + '">' + this.title + '</div>' +
                '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //register onClick event handler
        this.connect({
            nodeId: this.buttonId,
            name: "ButtonClick",
            event: "onclick",
            method: function(event) {
                //hide or show menu
                if(this.menu && this.menu.isOpen) {
                    this.menu.close();
                } else if(this.menu && !this.menu.isOpen) {
                    this.menu.open();
                }

                //execute onClick function
                if(this.onClick) this.onClick();
            }
        });

        //TODO create menu
        if(this.menu) {
            this.menu.create(this.htmlId);
        }
    }
});

/**
 * drop down menu for horizontal menus
 */
dojo.declare("ui.HMenuDropDown", ui.Object, {
    buttons: null,
    isOpen: null,

    constructor: function(args) {
        this.buttons = args.buttons;
        this.isOpen = false;
    },

    /**
     * creates the menu
     * @param placeAt
     */
    create: function(placeAt) {
        this.placeAt = placeAt || this.placeAt;

        //execute superclass function
        this.inherited(arguments);

        //place drop down menu
        dojo.place(
            '<ul class="HMenuDropDown" style="opacity: 0; display: none;" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //insert button
        if(this.buttons) dojo.forEach(this.buttons,
            dojo.hitch(this, function(btn) {
                btn.create(this.htmlId);
            })
        );
    },

    /**
     * destroys this menu
     */
    destroy: function() {
        //destroy buttons
        if(this.buttons) dojo.forEach(this.buttons,
            dojo.hitch(this, function(btn) {
                btn.destroy();
            })
        );

        //destroy this menu
        this.inherited(arguments);
    },

    /**
     * opens the menu
     */
    open: function() {
        this.isOpen = true;
        this.show(300);
    },

    /**
     * closes the menu
     */
    close: function() {
        this.isOpen = false;
        this.hide(300);
    }
});

