/**
 * User: Christoph Grundmann
 * Date: 07.05.11
 * Time: 17:38
 *
 */
dojo.provide("ui.Tab");
dojo.require("ui.Object");
dojo.require("ui.util.DragAndDrop");

dojo.declare("ui.Tab", ui.Object, {
    title: null,
    index: null,
    onClick: null,
    content: null,
    frameId: null,
    titleId: null,
    closeId: null,
    buttonId: null,

    //TODO rename var?
    placementIndex: null,

    //drag and drop
    dnd: null,
    dndObj: null,

    //static click history
    history: {tabs: []},

    constructor: function(args) {
        args = args || {};
        this.title = args.title;
        this.onClick = args.onClick;
        this.content = args.content;
        this.frameId = args.frameId;
        this.uiType = "tab";

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
            method: function(history) {
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
                    var tab = frame.getTab(0);

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

        //
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

                    console.debug(this.placementIndex);
                }
            }
        });

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
     * overwritten super class method
     * activates this tab
     */
    activate: function(publish) {
        publish = (typeof publish == "boolean") ? publish : true;

        //add css class
        dojo.addClass(this.htmlId, "selected");

        //show content of this tab
        if(this.content) this.content.activate();

        //activate each necessary event handler
        this.inherited(arguments);

        //activates drag and drop functionality
        if(this.dnd && this.dndObj) {
            this.dndObj.activate();
        }

        //execute specific onClick function
        if(this.onClick) this.onClick();

        //throw event for tab activation
        if(publish) dojo.publish("TabActivated", [{
            frameId: this.frameId,
            tabId: this.htmlId
        }]);
    },

    /**
     * overwritten super class method
     * deactivates this tab
     */
    deactivate: function(event) {
        var isFrame = event.frameId == this.frameId;
        var isTab = event.tabId == this.htmlId;
        var force = event.force;
        var dndForce = event.dndForce || false;

        //deactivate tab if it is activated
        if((isFrame && !isTab && this.isActivated) || force) {
            //remove css class
            dojo.removeClass(this.htmlId, "selected");

            //hide content
            if(this.content) this.content.deactivate();

            //deactivate drag and drop
            if(this.dnd && this.dndObj && dndForce) {
                this.dndObj.deactivate({force: true});
            }

            //deactivate active event handler
            this.inherited(arguments);
        }

        //store id of the current activated tab
        if(isTab && isFrame) {
            this.historyPush(event.tabId);
        }
    },

    /**
     * registers the parent frame
     * @param frame ui.Frame
     */
    register: function(frame) {
        this.placeAt = frame.tabsId;
        this.frameId = frame.htmlId;

        //register the frame
        if(this.content) {
            this.content.register(frame);
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

        //set new tab index
        var frame = this.getGlobal("frame", this.frameId);
        frame.setTabIndex([this.htmlId]);

        //if the current active tab will
        //closed activate the last active one
        if(this.isActivated) {
            dojo.publish("TabClosed", [this.history.tabs]);
        }

        //remove permanently
        this.content.destroy(true);
        this.destroy(true);

        //remove from frame
        frame.removeTab(this.htmlId);
    },

    /**
     * adds a tab id of the
     * current clicked tab
     * @param id string
     */
    historyPush: function(id) {
        //get last registered id
        var index = this.history.tabs.length - 1;
        var last = this.history.tabs[index];

        //push id if it's not registered last times
        if(last != id || !last) this.history.tabs.push(id);
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
            dojo.forEach(this.history.tabs,
                dojo.hitch(this, function(i) {
                    if(i != id) newHistory.push(i);
                })
            );

            //store new result
            this.history.tabs = newHistory;
        } else {
            //remove each id
            this.history.tabs = [];
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
                    return frame.tabsId;
                }
            ))();
        
        //get this tab node and remove it if already exists
        var node = dojo.byId(this.htmlId);
        if(node) dojo.destroy(node);

        //place tab button into the parent frame
        dojo.place(
            '<div class="Tab" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="button" id="' + this.buttonId + '">' +
                    '<div class="title" id="' + this.titleId + '">' + this.title + '</div>' +
                '</div>' +
                '<div class="close" id="' + this.closeId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt),
            position
        );

        //recreate this object
        if(typeof frame == "object") {
            //activate event handler
            this.activate();

            //change tab index
            frame.setTabIndex();

            //TODO if this.frameId != frame.htmlId replace the content content.register()

            //set each necessary instance var
            //if frame is a ui.Frame object
            this.frameId = frame.htmlId;
        }
    }
});