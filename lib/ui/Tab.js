/**
 * User: Christoph Grundmann
 * Date: 07.05.11
 * Time: 17:38
 *
 */
dojo.provide("ui.Tab");
dojo.require("lib.Obj");

dojo.declare("ui.Tab", lib.Obj, {
    title: null,
    index: null,
    onClick: null,
    content: null,
    frameId: null,
    titleId: null,
    closeId: null,
    buttonId: null,

    //static click history
    history: {tabs: []},

    constructor: function(args) {
        this.title = args.title;
        this.onClick = args.onClick;
        this.content = args.content;
        this.frameId = args.frameId;
    },

    /**
     * creates a tab and place it into DOM
     */
    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //create other ids
        this.buttonId = this.htmlId + "Tab";
        this.titleId = this.htmlId + "Title";
        this.closeId = this.htmlId + "Close";
        
        //place tab button into the parent frame
        dojo.place(
            '<div class="Tab" id="' + this.htmlId + '">' +
                '<div class="button" id="' + this.buttonId + '">' +
                    '<div class="title" id="' + this.titleId + '">' + this.title + '</div>' +
                '</div>' +
                '<div class="close" id="' + this.closeId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

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

        //register an onClick event handler
        this.connect({
            node: dojo.byId(this.buttonId),
            event: "onclick",
            lock: true,
            method: this.activate
        });

        //register close button
        this.connect({
            name: "CloseTab",
            node: dojo.byId(this.closeId),
            event: "onclick",
            lock: true,
            method: this.close
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

        //deactivate tab if it is activated
        if((isFrame && !isTab && this.isActivated) || force) {
            //remove css class
            dojo.removeClass(this.htmlId, "selected");

            //hide content
            if(this.content) this.content.deactivate();

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
    }
});