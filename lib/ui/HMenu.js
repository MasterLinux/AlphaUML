/**
 * User: Christoph Grundmann
 * Date: 27.05.11
 * Time: 17:04
 *
 * horizontal menu
 */
dojo.provide("ui.HMenu");
dojo.require("ui.util.Node");

dojo.declare("ui.HMenu", ui.Object, {
    structure: null,
    buttons: null,

    constructor: function(args) {
        this.structure = args.structure;
        this.buttons = [];
        this.uiType = "HMenu";
    },

    create: function() {
        this.inherited(arguments);

        //place menu
        dojo.place(
            '<ul class="HMenu" uitype="' + this.uiType + '" id="' + this.htmlId + '"></ul>',
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
        this.uiType = "HMenuButton";
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
                '<div class="' + this.type + '" uitype="' + this.uiType + '" id="' + this.buttonId + '">' +
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

        if(this.menu) {
            this.menu.register(this.titleId);
            //create and place menu
            this.menu.create(this.htmlId);
        }
    }
});

/**
 * drop down menu for horizontal menus
 */
dojo.declare("ui.HMenuDropDown", ui.Object, {
    parentId: null,
    nodeUtil: null,
    buttons: null,
    isOpen: null,
    isInit: null,
    posX: null,
    posY: null,

    constructor: function(args) {
        this.nodeUtil = new ui.util.Node();
        this.buttons = args.buttons;
        this.parentId = args.parentId;
        this.isOpen = false;
        this.isInit = false;
        this.posX = args.x;
        this.posY = args.y;
        this.uiType = "HMenuDropDown";
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
            '<ul class="HMenuDropDown" style="opacity: 0; display: none;" uitype="' + this.uiType + '" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //insert button
        if(this.buttons) dojo.forEach(this.buttons,
            dojo.hitch(this, function(btn) {
                btn.create(this.htmlId);
            })
        );

        //close menu if another is open
        this.subscribe({
            event: "DropDownMenuOpened",
            method: function(event) {
                //close menu
                if(this.htmlId != event.id) {
                    this.close();
                }
            }
        });

        this.connect({
            name: "OutOfFocus",
            event: "onclick",
            body: true,
            method: function(event) {
                var uiType = this.getUiType(event.target);
                var isHMenuDropDown = (uiType == "HMenuDropDown");
                var isHMenuButton = (uiType == "HMenuButton");

                //close menu if click is out of focus
                if(this.isOpen && !isHMenuDropDown && !isHMenuButton) {
                    this.close();
                }
            }
        })
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

        //initialize position
        if(!this.isInit) {
            this.isInit = true;
            
            //get the node and pos of the parent button
            var parentNode = dojo.byId(this.parentId);
            var parentPos = dojo.position(parentNode);

            //set position
            this.setPosition(parentPos.x, parentPos.y + parentPos.h);
        }

        //show menu
        this.show(300);

        dojo.publish("DropDownMenuOpened", [{
            id: this.htmlId
        }]);
    },

    /**
     * closes the menu
     */
    close: function() {
        this.isOpen = false;
        this.hide(300);
    },

    /**
     * gets the next found
     * uitype of a dom node
     * @param node dom node
     */
    getUiType: function(node) {
        //max search iterations
        var maxSearchLoops = 5;
        var curSearchLoops = 0;
        var uiType = null;

        //search ui type of the given node
        while(!uiType && curSearchLoops < maxSearchLoops && node) {
            //get uitype property of the current node
            uiType = dojo.getNodeProp(node, "uitype");
            //get next parent node if no type is found
            if(!uiType) node = node.parentNode;
            //increment loop counter
            curSearchLoops++;
        }

        //return found uitype
        return uiType;
    },

    /**
     * sets the position of
     * the drop down menu
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        this.posX = x || this.posX;
        this.posY = y || this.posY;

        this.nodeUtil.setPosition(
            this.htmlId,
            this.posX,
            this.posY
        );
    },

    /**
     * registers this menu to
     * a menu button
     * @param parentId
     */
    register: function(parentId) {
        this.parentId = parentId;
    }
});

