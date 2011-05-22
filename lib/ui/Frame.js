/**
 * User: Christoph Grundmann
 * Date: 06.05.11
 * Time: 15:59
 *
 * Implementation of a tab bar.
 * Usually used for frames.
 */
dojo.provide("ui.Frame");
dojo.require("ui.Object");

dojo.declare("ui.Frame", ui.Object, {
    tabs: null,
    title: null,
    draggable: null,
    tabsId: null,
    contentId: null,
    width: null,
    height: null,

    /**
     * initializes a tab bar
     *
     * args: {
     *  placeAt: string -> id of the parent node where this tab bar will be placed
     *  title: string -> tab bar title
     *  draggable: boolean -> enables the drag and drop function for the parent frame
     *  tabs: object -> collection of tabs
     * }
     *
     * @param args
     */
    constructor: function(args) {
        this.tabs = args.tabs || {};
        this.title = args.title;
        this.draggable = args.draggable;
        this.width = args.width;
        this.height = args.height;
        this.uiType = "frame";
    },

    /**
     * creates the tab bar. places it into DOM
     * and inserts each registered tab for this bar.
     */
    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //make frame global
        this.setGlobal(this.uiType);

        //create other ids
        this.tabsId = this.htmlId + "Tabs";
        this.contentId = this.htmlId + "Content";

        //place tab bar into DOM
        dojo.place(
            '<div class="Frame" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="tabs" id="' + this.tabsId + '"></div>' +
                '<div class="content" id="' + this.contentId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //create each registered tab
        var tabIndex = 0;
        var firstTab = '';
        for(var tab in this.tabs) {
            //get name of the first tab
            if(tabIndex == 0) {
                tabIndex++;
                firstTab = tab;
            }

            //register tab to this tab bar
            this.tabs[tab].register(this);

            //place the tab into tab bar
            this.tabs[tab].create();
        }

        //activate the first tab
        this.tabs[firstTab].activate();

        //set the tab index
        this.setTabIndex();

        //set size of this frame
        this.setSize(
            this.width || "500px",
            this.height || "300px"
        );
    },

    scrollLeft: function() {

    },

    scrollRight: function() {

    },

    /**
     * adds a new tab into tis frame
     * @param tab ui.Tab
     * @param activate boolean if it's set to true it will be activated after adding
     * @param replace boolean if true it replaces the content into a new frame
     */
    addTab: function(tab, activate, replace) {
        replace = (typeof replace == "boolean") ? replace : false;

        //add tab TODO: check for overwrites. that shouldn't be
        this.tabs[tab.title] = tab;

        //register tab to this tab bar
        tab.register(this);

        //place it into frame
        if(!replace) tab.create();
        //replace content
        else tab.content.place(this);

        //activate it
        if(activate) tab.activate();
    },

    /**
     * removes a tab
     * @param id string htmlId
     */
    removeTab: function(id) {
        //iterate registered tabs
        for(var tab in this.tabs) {
            //search for tab with the given id
            if(this.tabs[tab].htmlId == id) {
                delete this.tabs[tab];
                //break this loop
                break;
            };
        }
    },

    /**
     * gets a tab by index or htmlId. if tab doesn't exists it returns false
     * @param index integer|string array like index or a htmlId of a specific tab
     * @return ui.Tab|false
     */
    getTab: function(index) {
        var isRegistered = false;
        var resultTab = null;

        //no registered tabs
        if(!this.tabs) {
            return isRegistered;
        }

        //index is given
        else if(typeof index == "number") {
            //iterate registered tabs
            for(var tab in this.tabs) {
                //search for tab with the given index
                if(this.tabs[tab].index === index) {
                    resultTab = this.tabs[tab];
                    isRegistered = true;
                    //break this loop
                    break;
                };
            }

            //return tab if founded otherwise false
            return resultTab || isRegistered;
        }

        //htmlId is given
        else if(typeof index == "string") {
            return this.tabs[index] || isRegistered;
        }
    },

    /**
     * sets or updates the tab index
     * @param exclude array array of htmlIds for excluding
     */
    setTabIndex: function(exclude) {
        var index = 0;

        //get tab nodes of this frame
        dojo.query('#' + this.htmlId + ' div[uitype="tab"]').forEach(
            dojo.hitch(this, function(node) {
                //get ui object of this node
                var tab = this.getGlobal("tab", node.id);

                //skip iteration if the current tab
                //is available in the exclude array
                var isExcluded = false;
                dojo.forEach(exclude, dojo.hitch(this, function(id) {
                    if(tab.htmlId == id) {
                        tab.setIndex(null);
                        isExcluded = true;
                    }
                }));

                //set the index
                if(!isExcluded) {
                    tab.setIndex(index);
                    //increment index
                    index++;
                }
            })
        );
    },

    /**
     * sets the size of this frame
     * parameters could be a pixel "42px"
     * or a percent "42%" value
     * @param width string
     * @param height string
     */
    setSize: function(width, height) {
        this.width = width;
        this.height = height;

        //get frame node
        var frameDiv = dojo.byId(this.htmlId);
        var tabsDiv = dojo.byId(this.tabsId);
        var contentDiv = dojo.byId(this.contentId);

        //set as css properties
        dojo.style(frameDiv, "width", width);
        dojo.style(frameDiv, "height", height);

        //TODO: google chrome and adobe air(webkit) gets the wrong css properties and calculates the height wrong
        //calculate the required height of the content div
        var heightVal = parseInt(height.replace("px", ""));
        var contentH = heightVal -  dojo.style(tabsDiv, "height") +
                                    dojo.style(tabsDiv, "marginTop") +
                                    dojo.style(tabsDiv, "marginBottom") +
                                    dojo.style(tabsDiv, "paddingTop") +
                                    dojo.style(tabsDiv, "paddingBottom");

        //set size of the tabs and content div
        dojo.style(tabsDiv, "width", width);
        dojo.style(contentDiv, "width", width);
        dojo.style(contentDiv, "height", contentH + "px");

        //set the content size for each tab
        if(this.tabs) for(var tab in this.tabs) {
            if(this.tabs[tab].content) {
                this.tabs[tab].content.setSize(width, contentH + "px");
            }
        }
    }
});