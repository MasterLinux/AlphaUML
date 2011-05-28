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
dojo.require("ui.TabBar");

dojo.declare("ui.Frame", ui.Object, {
    contentId: null,
    tabBar: null,
    tabs: null,
    width: null,
    height: null,
    frameNode: null,
    contentNode: null,
    
    constructor: function(args) {
        this.uiType = "frame";
        this.tabs = args.tabs;
    },

    create: function() {
        //call the method of the super class
        this.inherited(arguments);

        //make frame global
        this.setGlobal("frame");
        
        //create other ids
        this.contentId = this.htmlId + "Content";

        //place tab bar into DOM
        this.frameNode = dojo.create("div", {
            "class": "Frame",
            "uitype": this.uiType,
            "id": this.htmlId
        }, dojo.byId(this.placeAt));

        this.contentNode = dojo.create("div", {
            "class": "content",
            "id": this.contentId
        }, this.frameNode);

        /*
        dojo.place(
            '<div class="Frame" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="content" id="' + this.contentId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );*/

        this.tabBar = new ui.TabBar({
            frameId: this.htmlId,
            placeAt: this.htmlId,
            tabs: this.tabs
        });

        this.tabBar.create();

        this.setSize();
    },
    
    setSize: function(width, height) {
        width = (typeof width == "number") ? width : 500;
        height = (typeof height == "number") ? height : 400;

        //set as css properties
        dojo.style(this.frameNode, "width", width + "px");
        dojo.style(this.frameNode, "height", height + "px");

        //get tab bar height
        var tabBarHeight = this.tabBar.height();

        //set content div
        dojo.style(this.contentNode, "width", width + "px");
        dojo.style(this.contentNode, "height", (height - tabBarHeight) + "px");
    }
});