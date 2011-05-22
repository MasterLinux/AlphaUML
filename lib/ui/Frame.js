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
    scrollPos: null,
    draggable: null,
    tabsInnerId: null,
    tabsOuterId: null,
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
        this.tabsInnerId = this.htmlId + "InnerTabs";
        this.tabsOuterId = this.htmlId + "OuterTabs";
        this.tabsRightId = this.htmlId + "ScrollRight";
        this.tabsLeftId = this.htmlId + "ScrollLeft";
        this.contentId = this.htmlId + "Content";

        //place tab bar into DOM
        dojo.place(
            '<div class="Frame" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="tabsLeft" id="' + this.tabsLeftId + '"></div>' +
                '<div class="tabsOuter" id="' + this.tabsOuterId  + '">' +
                    '<div class="tabsInner" id="' + this.tabsInnerId + '"></div>' +                   
                '</div>' +
                '<div class="tabsRight" id="' + this.tabsRightId + '"></div>' +
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

        this.connect({
            name: "ScrollLeft",
            nodeId: this.tabsLeftId,
            event: "onclick",
            lock: true,
            method: this.scrollLeft
        });

        this.connect({
            name: "ScrollRight",
            nodeId: this.tabsRightId,
            event: "onclick",
            lock: true,
            method: this.scrollRight
        });

        /*
        dojo.connect(dojo.body(), "onkeyup", this, function(event) {
            var node = dojo.byId(this.tabsInnerId);
            var left = dojo.style(node, "left");
            //right
            if(event.keyCode == 39) {
                dojo.style(node, "left", (left + 10) + "px");
            } else if(event.keyCode == 37) {
                //left
                dojo.style(node, "left", (left - 10) + "px");
            }
        })*/
    },

    scrollLeft: function() {
        var node = dojo.byId(this.tabsInnerId);

        //initialize scroll var
        if(!this.scrollPos) this.scrollPos = 0;

        dojo.animateProperty({
            node: node,
            duration: 500,
            properties: {
                marginLeft: {
                    start: this.scrollPos,
                    end: (this.scrollPos+=50)
                }
            }
        }).play();

        //node.scrollLeft += 20;
    },

    scrollRight: function() {
        var node = dojo.byId(this.tabsInnerId);

        //initialize scroll var
        if(!this.scrollPos) this.scrollPos = 0;

        dojo.animateProperty({
            node: node,
            duration: 500,
            properties: {
                marginLeft: {
                    start: this.scrollPos,
                    end: (this.scrollPos-=50)
                }
            }
        }).play();
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

        //reset inner size
        this.setTabBarWidth();
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

        //reset inner size
        this.setTabBarWidth();
    },

    /**
     * //TODO change argument filter [index:integer, id:string, isActive:boolean]
     * gets a tab by index or htmlId. if tab doesn't exists it returns false
     * @param filter integer|string|boolean array like index or a htmlId of a specific tab or the current active tab in this frame
     * @return ui.Tab|false
     */
    getTab: function(filter) {
        var isRegistered = false;
        var resultTab = null;

        //no registered tabs
        if(!this.tabs) {
            return isRegistered;
        }

        //index is given
        else if(typeof filter == "number") {
            //iterate registered tabs
            for(var tab in this.tabs) {
                //search for tab with the given index
                if(this.tabs[tab].index === filter) {
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
        else if(typeof filter == "string") {
            return this.tabs[filter] || isRegistered;
        }

        //get active tab
        else if(typeof filter == "boolean") {
            //iterate registered tabs
            for(var tab in this.tabs) {
                //search for tab with the given index
                if(this.tabs[tab].isActivated === filter) {
                    resultTab = this.tabs[tab];
                    isRegistered = true;
                    //break this loop
                    break;
                };
            }

            //return tab if founded otherwise false
            return resultTab || isRegistered;
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
        var tabsOuterDiv = dojo.byId(this.tabsOuterId);
        var contentDiv = dojo.byId(this.contentId);

        //set as css properties
        dojo.style(frameDiv, "width", width);
        dojo.style(frameDiv, "height", height);

        this.setTabBarWidth();

        //TODO: google chrome and adobe air(webkit) gets the wrong css properties and calculates the height wrong
        //calculate the required height of the content div
        var heightVal = parseInt(height.replace("px", ""));
        var contentH = heightVal -  dojo.style(tabsOuterDiv, "height") +
                                    dojo.style(tabsOuterDiv, "marginTop") +
                                    dojo.style(tabsOuterDiv, "marginBottom") +
                                    dojo.style(tabsOuterDiv, "paddingTop") +
                                    dojo.style(tabsOuterDiv, "paddingBottom");

        //round result
        contentH = Math.ceil(contentH);

        var tabsOuterWidth = parseInt(width.replace("px", "")) - 40;

        //set size of the tabs and content div
        dojo.style(tabsOuterDiv, "width", tabsOuterWidth + "px");
        dojo.style(contentDiv, "width", width);
        dojo.style(contentDiv, "height", contentH + "px");

        //set the content size for each tab
        if(this.tabs) for(var tab in this.tabs) {
            if(this.tabs[tab].content) {
                this.tabs[tab].content.setSize(width, contentH + "px");
            }
        }
    },

    /**
     * TODO create a new class for the tab bar
     */
    setTabBarWidth: function() {
        var tabsInnerDiv = dojo.byId(this.tabsInnerId);
        
        //calc width of the inner div
        var tabsInnerWidth = 0;
        for(var tab in this.tabs) {
            console.debug(tabsInnerWidth);
            tabsInnerWidth += this.tabs[tab].getWidth();
        }

        //set width of the inner div
        dojo.style(tabsInnerDiv, "width", (Math.ceil(tabsInnerWidth) + 50) + "px");
    }
});