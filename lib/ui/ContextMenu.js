/**
 * User: Christoph Grundmann
 * Date: 22.06.11
 * Time: 17:59
 *
 * implementation of a context menu
 */
dojo.provide("ui.ContextMenu");
dojo.require("ui.Object");

dojo.declare("ui.ContextMenu", ui.Object, {
    buttonStore: null,
    buttons: null,
    parents: null,
    isOpen: null,
    title: null,
    menuId: null,
    posX: null,
    posY: null,

    /**
     * TODO add sub-menus
     * will be placed into the body of the index.html
     * 
     * args: {
     *  title: "menu title"
     *  buttons: [
     *      {
     *          title: "button title",
     *          icon: "css class",
     *          onClick: function(){},
     *          description: "tooltip description"
     *      }
     *  ]
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.title = args.title;
        this.buttons = args.buttons;
        this.uiType = "contextmenu";
    },

    /**
     * creates the context menu
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.menuId = this.htmlId + "Menu";
        this.titleId = this.htmlId + "Title";

        //place menu
        dojo.place(
            '<div class="ContextMenu" uitype="' + this.uiType + '" style="opacity: 0; display: none;" id="' + this.htmlId + '">' +
                '<div class="inner">' +
                    '<div class="title" id="' + this.titleId + '"></div>' +
                    '<ul class="menu" id="' + this.menuId + '"></ul>' +
                '</div>' +
            '</div>',
            dojo.byId("main")
        );

        //configure menu
        this.setTitle(this.title);

        //add buttons
        dojo.forEach(this.buttons, dojo.hitch(this, function(btn) {
            this.addButton(btn);
        }));

        //close menu if click is out of focus
        this.connect({
            name: "CloseMenu",
            event: "onclick",
            body: true,
            method: function(event) {
                var isParent = false;
                dojo.forEach(this.parents, dojo.hitch(this, function(id) {
                    if(event.target.id == id) {
                        isParent = true;
                    }
                }));
                var isTitle = (event.target.id == this.titleId);
                var isButton = (dojo.attr(event.target, "uitype") == "contextmenubutton");

                //close menu if necessary
                if(!isParent && !isTitle && !isButton) {
                    this.close();
                }
            }
        });

        //close if another context menu is open
        this.subscribe({
            event: "ContextMenuOpened",
            method: function(id) {
                if(this.htmlId != id) {
                    this.close();
                }
            }
        })
    },

    /**
     * sets the title
     * @param title
     */
    setTitle: function(title) {
        this.title = title;
        dojo.byId(this.titleId).innerHTML = title;
    },

    /**
     * adds a new button into the menu
     * @param button object
     */
    addButton: function(button) {
        //create a new button
        var btn = new ui.ContextMenuButton({
            placeAt: this.menuId,
            title: button.title,
            icon: button.icon,
            onClick: dojo.hitch(this, function() {
                //execute onClick function
                if(button.onClick) button.onClick();
                //close menu
                this.close();
            }),
            description: button.description
        });

        //create button store if necessary
        if(!this.buttonStore) this.buttonStore = {};

        //store new button
        this.buttonStore[btn.htmlId] = btn;
    },

    /**
     * connects this menu to one or more gui components
     * @param ids array of node ids
     */
    register: function(ids) {
        this.parents = ids;
        dojo.forEach(ids, dojo.hitch(this, function(id) {
            this.connect({
                event: "onclick",
                nodeId: id,
                method: function(event) {
                    //open menu at the position of the registered click event
                    if(!this.isOpen) this.open(event.clientX, event.clientY);
                    else if(this.isOpen) this.close();
                }
            });

            /* TODO block onclick event on double click
            this.connect({
                event: "ondblclick",
                nodeId: id,
                method: function(event) {
                    console.debug("nothing to do");
                }
            }); */
        }));
    },

    /**
     * destroys each button and event handler
     * @param del
     */
    destroy: function(del) {
        //destroy buttons
        if(this.buttonStore) {
            dojo.forEach(this.buttonStore, dojo.hitch(this, function(btn) {
                btn.destroy(true);
            }));
        }

        this.inherited(arguments);
    },

    /**
     * opens context menu of position x, y
     * @param x integer
     * @param y integer
     */
    open: function(x, y) {
        if(dojo.byId(this.htmlId)) {
            this.isOpen = true;
            dojo.publish("ContextMenuOpened", [this.htmlId]);
            this.setPosition(x, y);
            this.show();
        }
    },

    /**
     * closes context menu
     */
    close: function() {
        if(dojo.byId(this.htmlId)) {
            this.isOpen = false;
            this.hide();
        }
    },

    /**
     * sets the position of the menu
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        this.posX = x;
        this.posY = y;

        if(node) {
            dojo.style(node, "left", x + "px");
            dojo.style(node, "top", y + "px");
        }
    }
});

/**
 * a button for context menus
 */
dojo.declare("ui.ContextMenuButton", ui.Object, {
    title: null,
    description: null,
    onClick: null,
    titleId: null,
    innerId: null,
    icon: null,

    /**
     * initializes and creates button
     * 
     * args: {
     *  placeAt: "parent id",
     *  title: "button title",
     *  icon: "css class",
     *  onClick: function(){},
     *  description: "tooltip desc"
     * }
     * 
     * @param args
     */
    constructor: function(args) {
        this.title = args.title;
        this.icon = args.icon;
        this.description = args.description;
        this.onClick = args.onClick;
        this.uiType = "contextmenubutton";

        //create button
        this.create();
    },

    /**
     * creates the button
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.titleId = this.htmlId + "Title";
        this.iconId = this.htmlId + "Icon";

        //place button
        dojo.place(
            '<li class="button" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div id="' + this.titleId + '">' + this.title + '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //set icon TODO calculate button size?!
        //this.setIcon(this.icon);

        //set onClick handler
        this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function(event) {
                //execute onClick function if exists
                if(this.onClick) this.onClick();
            }
        });

        //TODO add tooltip
    },

    /**
     * sets the button icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        var node = dojo.byId(this.iconId);
        this.icon = icon;

        //destroy old icon node if already exists
        if(node) dojo.destroy(node);

        //add icon into dom
        if(icon) dojo.place(
            '<div class="Icon ' + icon + '" id="' + this.iconId + '"></div>',
            dojo.byId(this.htmlId), "first"
        );

        console.debug(dojo.style(this.htmlId, "width"));
    }
});

