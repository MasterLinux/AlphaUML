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
    isSubMenu: null,
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
        this.isSubMenu = args.isSubMenu;
        this.uiType = "contextmenu";
    },

    /**
     * creates the context menu
     * @param isSubMenu set as sub menu
     */
    create: function(isSubMenu) {
        this.isSubMenu = isSubMenu || false;
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
            method: function(id, subMenu) {
                if(this.htmlId != id && !subMenu) {
                    this.close();
                }
            }
        });
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
            description: button.description,
            isSubMenuButton: this.isSubMenu,
            menu: button.menu,
            parentId: this.htmlId
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
        this.setPosition(x, y);
        this.show(undefined, undefined, dojo.hitch(this, function() {
            this.isOpen = true;
        }));

        dojo.publish("ContextMenuOpened", [this.htmlId, this.isSubMenu]);
    },

    /**
     * closes context menu
     */
    close: function() {
        this.hide(undefined, undefined, dojo.hitch(this, function() {
            this.isOpen = false;
        }));
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
    parentId: null,
    title: null,
    titleArrow: " &#10152;",
    dynamicTitle: null,
    description: null,
    onClick: null,
    titleId: null,
    innerId: null,
    icon: null,
    isSubMenuButton: null,
    menuStructure: null,
    menu: null,

    /**
     * initializes and creates button
     * 
     * args: {
     *  placeAt: "parent id",
     *  title: "button title",
     *  icon: "css class",
     *  onClick: function(){},
     *  description: "tooltip desc",
     *  menu: object,
     *  parentId: string
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
        this.menuStructure = args.menu;
        this.isSubMenuButton = args.isSubMenuButton;
        this.parentId = args.parentId;

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
                '<div class="btnTitle" id="' + this.titleId + '"></div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //set icon TODO calculate button size?!
        //this.setIcon(this.icon);
        if(this.menuStructure) {
            //create new sub context menu
            this.menu = new ui.ContextMenu(this.menuStructure);
            this.menu.create(true);
            this.menu.register([this.htmlId]);
        }

        //configure button
        this.setTitle(this.title);

        //set onMouseOver handler
        if(this.menu) {
            this.connect({
                name: "OpenSubMenu",
                event: "onmousemove",
                nodeId: this.htmlId,
                method: function(event) {
                    //open menu
                    if(this.menu && !this.menu.isOpen) {
                        //get menu position
                        var pos = dojo.position(this.htmlId);
                        this.menu.open(pos.x + pos.w, pos.y - pos.h);
                    }
                }
            });

            //close menu if necessary
            this.subscribe({
                event: "ContextMenuButtonHover",
                method: function(id) {
                    if(this.htmlId != id && this.menu && this.menu.isOpen) {
                        this.menu.close();
                    }
                }
            })
        }

        //set onClick handler
        else this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function(event) {
                //execute onClick function if exists
                if(this.onClick) this.onClick();
            }
        });

        this.connect({
            name: "CloseSubMenu",
            event: "onmouseover",
            nodeId: this.htmlId,
            method: function(event) {
                //throw mouse over event
                if(!this.isSubMenuButton) {
                    dojo.publish("ContextMenuButtonHover", [this.htmlId]);
                }
            }
        });

        if(this.dynamicTitle) {
            //update title
            this.subscribe({
                event: "ContextMenuOpened",
                method: function(id, isSubMenu) {
                    if(this.parentId == id) {
                        this.setTitle();
                    }
                }
            });
        }
        
        //TODO add tooltip
    },

    /**
     * sets the title
     * @param title function | string
     */
    setTitle: function(title) {
        this.title = title || this.title;
        var node = dojo.byId(this.titleId);

        //execute title function
        if(typeof this.title == "function") {
            this.dynamicTitle = true;
            title = this.title();
        }

        //add title arrow if menu exists
        if(this.menu) title += this.titleArrow;

        //set title string
        node.innerHTML = title;
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

