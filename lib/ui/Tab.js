/**
 * User: Christoph Grundmann
 * Date: 07.05.11
 * Time: 17:38
 *
 */
dojo.provide("ui.Tab");
dojo.require("ui.Object");
dojo.require("ui.util.DragAndDrop");
dojo.require("ui.util.Node");

dojo.declare("ui.Tab", ui.Object, {
    title: null,
    index: null,
    onClick: null,
    content: null,
    tabBarId: null,
    frameId: null,
    titleId: null,
    closeId: null,
    buttonId: null,
    menu: null,
    nodeUtil: null,
    placementIndex: null,
    creationDate: null,

    //drag and drop
    dnd: null,
    dndObj: null,

    //static click history
    static: {history:{}},

    constructor: function(args) {
        args = args || {};
        this.title = args.title;
        this.onClick = args.onClick;
        this.content = args.content;
        this.tabBarId = args.tabBarId;
        this.frameId = args.frameId;
        this.menu = args.menu;
        this.nodeUtil = new ui.util.Node();
        this.uiType = "tab";

        var nowDate = new Date().toGMTString();
        this.creationDate = Date.parse(nowDate);

        //enables or disables the drag and drop functionality
        this.dnd = (typeof args.dnd == "boolean") ? args.dnd : true;
    },

    /**
     * creates a tab and place it into DOM
     */
    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //make tab global
        this.setGlobal(this.uiType);

        //create other ids
        this.buttonId = this.htmlId + "Tab";
        this.titleId = this.htmlId + "Title";
        this.closeId = this.htmlId + "Close";
        
        //place tab button into the parent frame
        this.place(this.placeAt);

        //place tab content
        if(this.content) {
            this.content.create();
        }


        if(this.menu) {
            this.menu.create();
        }

        //subscribe for a "TabActivated" event
        this.subscribe({
            event: "TabActivated",
            lock: true,
            method: this.deactivate
        });

        //subscribe for a "TabClosed" event
        this.subscribe({
            event: "TabClosed",
            lock: true,
            method: function(tabBarId) {
                var history = this.static.history[tabBarId];
                
                //get last tab id
                var index = history.length-1;
                var last = history[index];

                //activate if this is the last active tab
                if(this.htmlId == last) {
                    this.activate(false);
                } else if(index < 0) {
                    //index is out of range, so the
                    //history has no tabs registered
                    var frame = this.getGlobal("frame", this.frameId);

                    //get the first tab
                    var tab = frame.tabBar.getTab(0);

                    //activate it
                    if(tab && !tab.isActivated) {
                        tab.activate(false);
                    }
                }
            }
        });

        //activate dnd functionality
        if(this.dnd) this.dndObj = new ui.util.DragAndDrop({
            handle: this.buttonId,
            movable: this,
            onMove: function() {}
        });

        //register an onClick event handler
        this.connect({
            nodeId: this.buttonId,
            event: "onclick",
            lock: true,
            method: this.activate
        });

        //register close button
        this.connect({
            name: "CloseTab",
            nodeId: this.closeId,
            event: "onclick",
            lock: true,
            method: this.close
        });

        //if an ui object is currently dragging show a
        //placement border and calculate the index
        this.connect({
            nodeId: this.htmlId,
            event: "onmousemove",
            lock: true,
            method: function(mouse) {
                if(this.dndObj.static.active) {
                    var isCloseButton = mouse.target.id == this.closeId;
                    var tabWidth = dojo.style(this.htmlId, "width")/2;

                    //set placement index and show a visual placement border
                    if(mouse.offsetX < tabWidth && !isCloseButton) {
                        //left side is hovered
                        //set placement index
                        this.placementIndex = this.index;

                        //set left border
                        dojo.style(this.htmlId, "borderLeft", "solid 4px #000000");
                        dojo.style(this.htmlId, "borderRight", "none");
                    } else {
                        //right side is hovered
                        //set placement index
                        this.placementIndex = this.index + 1;

                        //set right border
                        dojo.style(this.htmlId, "borderRight", "solid 4px #000000");
                        dojo.style(this.htmlId, "borderLeft", "none");
                    }
                }
            }
        });

        //remove added border at lost focus
        this.connect({
            nodeId: this.htmlId,
            event: "onmouseout",
            lock: true,
            method: function() {
                //remove border
                dojo.style(this.htmlId, "borderRight", "none");
                dojo.style(this.htmlId, "borderLeft", "none");
            }
        });

    },

    /**
     * destroys the tab
     * @param del
     */
    destroy: function(del) {
        if(this.dnd) this.dndObj.destroy();
        this.inherited(arguments);
    },

    /**
     * overwritten super class method
     * activates this tab
     */
    activate: function(publish) {
        publish = (typeof publish == "boolean") ? publish : true;

        if(!this.isActivated) {
            //add css class
            dojo.addClass(this.htmlId, "selected");

            //show content and menu of this tab
            if(this.content) this.content.activate();
            if(this.menu) this.menu.activate();

            //activate each necessary event handler
            this.inherited(arguments);

            //activates drag and drop functionality
            if(this.dnd && this.dndObj) {
                this.dndObj.activate();
            }

            //execute specific onClick function
            if(this.onClick) this.onClick();

            //resize frame size
            this.getGlobal("frame", this.frameId).setSize();

            //throw event for tab activation
            if(publish) dojo.publish("TabActivated", [{
                tabBarId: this.tabBarId,
                tabId: this.htmlId
            }]);
        }
    },

    /**
     * overwritten super class method
     * deactivates this tab
     */
    deactivate: function(event) {
        var isTabBar = event.tabBarId == this.tabBarId;
        var isTab = event.tabId == this.htmlId;
        var force = event.force;
        var dndForce = event.dndForce || false;

        //deactivate tab if it is activated
        if((isTabBar && !isTab && this.isActivated) || force) {
            //remove css class
            dojo.removeClass(this.htmlId, "selected");

            //hide content and menu
            if(this.content) this.content.deactivate();
            if(this.menu) this.menu.deactivate();

            //deactivate drag and drop
            if(this.dnd && this.dndObj && dndForce) {
                this.dndObj.deactivate({force: true});
            }

            //resize frame size
            this.getGlobal("frame", this.frameId).setSize();

            //deactivate active event handler
            this.inherited(arguments);
        }

        //handles the activation of the menu container
        if(isTab && this.menu) {
            var frame = this.getGlobal("frame", this.frameId);
            frame.activateMenu();
        } else if(isTab && !this.menu) {
            var frame = this.getGlobal("frame", this.frameId);
            frame.deactivateMenu();
        }

        //store id of the current activated tab
        if(isTab && isTabBar) {
            this.historyPush(event.tabId);
        }
    },

    /**
     * registers the parent frame
     * @param frame ui.TabBar
     */
    register: function(tabBar) {
        this.placeAt = tabBar.innerId;
        this.tabBarId = tabBar.htmlId;
        this.frameId = tabBar.frameId;

        if(this.content) {
            //get frame of the tab bar
            var frame = this.getGlobal("frame", tabBar.frameId);
            //register the content
            this.content.register(frame, this);
        }

        if(this.menu) {
            //get frame of the tab bar
            var frame = this.getGlobal("frame", tabBar.frameId);
            //register the content
            this.menu.register(frame, this);
        }
    },

    /**
     * sets new content and
     * @param content
     */
    setContent: function(content) {
        //TODO: implementation!
    },

    /**
     * closes the tab and
     * destroys the content
     */
    close: function() {
        //remove id of this tab from history
        this.historyClear(this.htmlId);

        //get parent frame
        var frame = this.getGlobal("frame", this.frameId);

        //remove from frame
        frame.tabBar.removeTab(this.htmlId);

        //set new tab index
        frame.tabBar.setTabIndex([this.htmlId]);

        //if the current active tab will
        //closed activate the last active one
        if(this.isActivated) {
            dojo.publish("TabClosed", [this.tabBarId]);
        }

        //remove permanently
        this.content.destroy(true);
        this.destroy(true);
    },

    /**
     * adds a tab id of the
     * current clicked tab
     * @param id string
     */
    historyPush: function(id) {
        if(!this.static.history[this.tabBarId]) {
            this.static.history[this.tabBarId] = []
        }

        //get last registered id
        var history = this.static.history[this.tabBarId];
        var index = history.length - 1;
        var last = history[index];

        //push id if it's not registered last times
        if(last != id || !last) {
            this.static.history[this.tabBarId].push(id);
        }
    },

    /**
     * clears the hole history or
     * removes only the given id
     * @param id string
     */
    historyClear: function(id) {
        if(id) {
            var newHistory = [];

            //filter all registered ids
            dojo.forEach(this.static.history[this.tabBarId],
                dojo.hitch(this, function(i) {
                    if(i != id) newHistory.push(i);
                })
            );

            //store new result
            this.static.history[this.tabBarId] = newHistory;
        } else {
            //remove each id
            this.static.history[this.tabBarId] = [];
        }
    },

    /**
     * sets position index of this
     * tab in the parent frame
     * @param index integer
     */
    setIndex: function(index) {
        this.index = index;
    },

    /**
     * returns the position index
     * of this tab
     * @return integer position index
     */
    getIndex: function() {
        return this.index;
    },

    /**
     * places this tab into the
     * given frame on the
     * indexed position
     * @param ui.Frame|string placeAt or a frame
     * @param index integer
     */
    place: function(frame, index) {
        var position = (typeof index == "number") ? index : "last";

        //TODO clear click history
        //this.historyClear(this.htmlId);

        //TODO if tab will be placed in another frame skip this step
        //important - the current placed tab-container will be destroyed
        //before the new one will be placed. So the index decrement about 1
        if(typeof position == "number" && position > this.index && this.frameId == frame.htmlId) {
            position = position - 1;
        }

        //set placeAt node id
        this.placeAt = (typeof frame != "object") ? frame :
            (dojo.hitch(this,
                function(){
                    //deactivate event handler
                    this.deactivate({
                        force: true,
                        dndForce: true
                    });

                    //return new placeAt id
                    return frame.tabBar.innerId;
                }
            ))();
        
        //get this tab node and remove it if already exists
        var node = dojo.byId(this.htmlId);
        if(node) dojo.destroy(node);

        //place tab button into the parent frame
        dojo.place(
            '<div class="Tab" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="inner">' +
                    '<div class="button" id="' + this.buttonId + '">' +
                        '<div class="title" id="' + this.titleId + '">' + this.title + '</div>' +
                    '</div>' +
                    '<div class="close" id="' + this.closeId + '"><div class="icon"></div></div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt),
            position
        );

        //recreate this object
        if(typeof frame == "object") {
            //TODO if this.frameId != frame.htmlId replace the content content.register()
            //replace content
            if(this.frameId != frame.htmlId) {
                //get the last used frame
                var lastFrame = this.getGlobal("frame", this.frameId);

                //remove tab from last frame
                lastFrame.tabBar.removeTab(this.htmlId);

                //refresh the tab index of the last frame
                lastFrame.tabBar.setTabIndex();

                //activate the first tab
                if(!lastFrame.tabBar.getTab(true)) {
                    var tab = lastFrame.tabBar.getTab(0);
                    if(tab) tab.activate();
                }

                //add this tab into the new frame
                frame.tabBar.addTab(this, true, true);
            }

            //set each necessary instance var
            //if frame is a ui.Frame object
            //this.frameId = frame.htmlId;

            //activate event handler
            this.activate();

            //change tab index
            frame.tabBar.setTabIndex();
        }
    },

    /**
     * calculates the width of
     * the tab and returns it
     */
    getWidth: function() {
        //workaround to fix the the floating bug
        return this.nodeUtil.width(this.titleId) + 2* this.nodeUtil.width(this.closeId);
    },

    /**
     * sets the tab title
     * @param title string
     * @param store boolean if true the title property will be overwritten
     */
    setTitle: function(title, store) {
        store = (typeof store == "boolean") ? store : true;
        if(store) this.title = title;

        //get title node
        var titleNode = dojo.byId(this.titleId);

        //if node exists change dom
        if(titleNode) titleNode.innerHTML = title;
    }
});