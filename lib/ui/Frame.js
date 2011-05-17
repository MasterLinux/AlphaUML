/**
 * User: Christoph Grundmann
 * Date: 06.05.11
 * Time: 15:59
 *
 * Implementation of a tab bar.
 * Usually used for frames.
 */
dojo.provide("ui.Frame");
dojo.require("lib.Obj");

dojo.declare("ui.Frame", lib.Obj, {
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
    },

    /**
     * creates the tab bar. places it into DOM
     * and inserts each registered tab for this bar.
     */
    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //create other ids
        this.tabsId = this.htmlId + "Tabs";
        this.contentId = this.htmlId + "Content";

        //place tab bar into DOM
        dojo.place(
            '<div class="Frame" id="' + this.htmlId + '">' +
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
     * adds a new tab into the tab bar
     * @param tab ui.Tab a new tab for this tab bar
     * @param activate boolean if it's set to true it will be activated after adding
     */
    addTab: function(tab, activate) {
        //add tab TODO: check for overwrites. that shouldn't be
        this.tabs[tab.title] = tab;

        //register tab to this tab bar
        tab.register(this);

        //place it into bar
        tab.create();

        //activate it
        if(activate) tab.activate();
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

        //calculate the required height of the content div
        var heightVal = parseInt(height.replace("px", ""));
        var contentH = heightVal - (dojo.style(tabsDiv, "height") +
                                    dojo.style(tabsDiv, "marginTop") +
                                    dojo.style(tabsDiv, "marginBottom") +
                                    dojo.style(tabsDiv, "paddingTop") +
                                    dojo.style(tabsDiv, "paddingBottom"));

        //set size of the tabs and content div
        dojo.style(tabsDiv, "width", width);
        dojo.style(contentDiv, "width", width);
        dojo.style(contentDiv, "height", contentH + "px");
    }
});