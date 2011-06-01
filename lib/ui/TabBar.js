/**
 * User: Christoph Grundmann
 * Date: 23.05.11
 * Time: 14:50
 *
 */
dojo.provide("ui.TabBar");
dojo.require("ui.Object");
dojo.require("ui.util.Size");

dojo.declare("ui.TabBar", ui.Object, {
    tabs: null,
    title: null,
    scrollPos: null,
    innerId: null,
    outerId: null,
    rightBtnId: null,
    leftBtnId: null,
    frameId: null,

    /**
     * initializes a tab bar
     *
     * args: {
     *  placeAt: string -> id of the parent node where this tab bar will be placed
     *  title: string -> tab bar title
     *  tabs: object -> collection of tabs
     * }
     *
     * @param args
     */
    constructor: function(args) {
        this.tabs = args.tabs;
        this.title = args.title;
        this.frameId = args.frameId;
        this.uiType = "tabbar";
    },

    /**
     * creates the tab bar. places it into DOM
     * and inserts each registered tab for this bar.
     */
    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //create other ids
        this.innerId = this.htmlId + "Inner";
        this.outerId = this.htmlId + "Outer";
        this.rightBtnId = this.htmlId + "RightBtn";
        this.leftBtnId = this.htmlId + "LeftBtn";

        //place tab bar into DOM
        dojo.place(
             '<div class="TabBar" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="leftBtn" id="' + this.leftBtnId + '"></div>' +
                '<div class="outer" id="' + this.outerId  + '">' +
                    '<div class="inner" id="' + this.innerId + '"></div>' +
                '</div>' +
                '<div class="rightBtn" id="' + this.rightBtnId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt),
            "first"
        );

        if(this.tabs) {
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
        }

        //set size of this frame
        this.setSize();

        this.connect({
            name: "ScrollLeft",
            nodeId: this.leftBtnId,
            event: "onclick",
            lock: true,
            method: this.scrollLeft
        });

        this.connect({
            name: "ScrollRight",
            nodeId: this.rightBtnId,
            event: "onclick",
            lock: true,
            method: this.scrollRight
        });

        //TODO resize event?
        this.subscribe({
            event: "RefreshWindow",
            method: this.setSize
        })
    },

    /**
     * scrolls the inner div to left
     */
    scrollLeft: function() {
        var node = dojo.byId(this.innerId);

        //initialize scroll var
        if(!this.scrollPos) this.scrollPos = 0;

        if(this.scrollPos < 0) {
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
        }
    },

    /**
     * scrolls the inner div to right
     */
    scrollRight: function() {
        var node = dojo.byId(this.innerId);

        //initialize scroll var
        if(!this.scrollPos) this.scrollPos = 0;

        //TODO test it
        if(this.scrollPos > dojo.position(this.innerId).w)
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
        else tab.content.place(this.getGlobal("frame", this.frameId));

        //activate it
        if(activate) tab.activate();

        //reset inner size
        this.setInnerSize();
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
        this.setInnerSize();
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
     * TODO remove height?
     * sets the size of this frame
     * parameters could be a pixel value
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        width = (typeof width == "number") ? width : 500;
        height = (typeof height == "number") ? height : 30;

        //get frame node
        var tabBarDiv = dojo.byId(this.htmlId);
        var outerDiv = dojo.byId(this.outerId);

        //set as css properties
        dojo.style(tabBarDiv, "width", width + "px");
        dojo.style(tabBarDiv, "height", height + "px");

        //set the size of the inner div
        this.setInnerSize();

        //width of navigation elements
        var navWidth = 40;

        //set size of the outer div
        var outerWidth = width - navWidth;
        dojo.style(outerDiv, "width", outerWidth + "px");
    },

    /**
     * TODO create a new class for the tab bar
     */
    setInnerSize: function() {
        //get inner div
        var innerDiv = dojo.byId(this.innerId);

        //calc width of the inner div
        var innerWidth = 0;
        for(var tab in this.tabs) {
            innerWidth += this.tabs[tab].getWidth();
        }

        //round width
        innerWidth = Math.ceil(innerWidth);

        //set width of the inner div
        dojo.style(innerDiv, "width", (innerWidth + 50) + "px");
    },

    width: function() {
        //create a new size util
        var sizeUtil = new ui.util.Size();
        //return width of this tab bar
        return sizeUtil.width(this.htmlId);
    },

    height: function() {
        //create a new size util
        var sizeUtil = new ui.util.Size();
        //return height of this tab bar
        return sizeUtil.height(this.htmlId);
    }
});
