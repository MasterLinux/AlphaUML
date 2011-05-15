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
    onClick: null,
    content: null,
    tabBarId: null,
    titleId: null,
    closeId: null,
    buttonId: null,

    //static click history
    history: {tabs: []},

    constructor: function(args) {
        this.title = args.title;
        this.onClick = args.onClick;
        this.content = args.content;
        this.tabBarId = args.tabBarId;
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
        
        //place tab button into tab bar
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

        //subscribe for a "ActivateLastTab" event
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
            tabBarId: this.tabBarId,
            tabId: this.htmlId
        }]);
    },

    /**
     * overwritten super class method
     * deactivates this tab
     */
    deactivate: function(event) {
        var isTabBar = event.tabBarId == this.tabBarId;
        var isTab = event.tabId == this.htmlId;
        var force = event.force;

        //deactivate tab if it is activated
        if((isTabBar && !isTab && this.isActivated) || force) {
            //remove css class
            dojo.removeClass(this.htmlId, "selected");

            //hide content
            if(this.content) this.content.deactivate();

            //deactivate active event handler
            this.inherited(arguments);
        }

        //store id of the current activated tab
        if(isTab && isTabBar) {
            this.historyPush(event.tabId);
        }
    },

    /**
     * registers the parent tab bar
     * @param tabBar ui.TabBar
     */
    register: function(tabBar) {
        this.placeAt = tabBar.tabsId;
        this.tabBarId = tabBar.htmlId;

        //TODO: need to store the tabBar object for setContent()?

        //register the tab bar
        if(this.content) {
            this.content.register(tabBar);
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

        //if the current active tab will
        //closed activate the last active one
        if(this.isActivated) {
            dojo.publish("TabClosed", [this.history.tabs]);
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
    }
});