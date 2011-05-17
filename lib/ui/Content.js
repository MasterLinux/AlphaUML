/**
 * User: Christoph Grundmann
 * Date: 10.05.11
 * Time: 21:01
 *
 */
dojo.provide("ui.Content");
dojo.require("lib.Obj");

dojo.declare("ui.Content", lib.Obj, {
    content: null,
    tabBarId: null,
    width: null,
    height: null,

    /**
     * initializes tab content
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.content = args.content;
        this.tabBarId = args.tabBarId;
        this.width = args.width;
        this.height = args.height;
        this.uiType = "content";
    },

    /**
     * places the content into DOM
     * and registers each necessary
     * event handler.
     * @param hide boolean hides content. hide is true by default
     */
    create: function(hide) {
        if(hide === undefined) hide = true;

        //create unique id
        this.inherited(arguments);

        //place content node
        dojo.place(
            '<div class="content" uitype="' + this.uiType + '" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //hide content node
        if(hide) this.deactivate();

        //add content into node
        this.setContent();
    },

    /**
     * overwritten function
     * shows the content and activates
     * each deactivated event handler
     */
    activate: function() {
        //get content node
        var node = dojo.byId(this.htmlId);
        
        //show node
        if(node) dojo.style(node, "display", "");

        //activate event handler
        this.inherited(arguments);
    },

    /**
     * overwritten function
     * hides the content and deactivates
     * each registered event handler
     */
    deactivate: function() {
        //deactivate event handler
        this.inherited(arguments);

        //get content node
        var node = dojo.byId(this.htmlId);

        //show node
        if(node) dojo.style(node, "display", "none");
    },

    /**
     * sets new content like html
     * or text and place it into DOM
     * @param content string
     */
    setContent: function(content) {
        this.content = content || this.content || "";

        //get content node
        var node = dojo.byId(this.htmlId);

        //place content into DOM
        if(node) node.innerHTML = this.content;
    },

    /**
     * registers the parent tab bar
     * @param tabBar ui.TabBar
     */
    register: function(tabBar) {
        this.placeAt = tabBar.contentId;
        this.tabBarId = tabBar.htmlId;
    },

    /**
     * sets the size of the
     * contents container
     * @param width string
     * @param height string
     */
    setSize: function(width, height) {
        this.width = width;
        this.height = height;

        //get content node
        var contentDiv = dojo.byId(this.htmlId);

        //set the containers size
        dojo.style(contentDiv, "width", width);
        dojo.style(contentDiv, "height", height);
    }
});
