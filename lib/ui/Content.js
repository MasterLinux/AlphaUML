/**
 * User: Christoph Grundmann
 * Date: 10.05.11
 * Time: 21:01
 *
 */
dojo.provide("ui.Content");
dojo.require("ui.Object");

dojo.declare("ui.Content", ui.Object, {
    contentNode: null,
    content: null,
    //TODO rename to frameId
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

        //make tab global
        this.setGlobal(this.uiType);

        //place content node
        this.place();

        this.subscribe({
            event: "RefreshWindow",
            method: this.setSize
        })

        //hide content node
        if(hide) this.deactivate();
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

        //set size of the parent element
        this.setSize();
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
     * registers the parent frame
     * @param frame ui.Frame
     */
    register: function(frame) {
        this.placeAt = frame.contentId;
        this.tabBarId = frame.htmlId;
    },

    /**
     * sets the size of the
     * contents container
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        //get size of the parent node
        var parent = this.contentNode.parentNode || dojo.byId(this.tabBarId);
        var parentPos = dojo.position(parent);

        this.width = width || parentPos.w;
        this.height = height || parentPos.h;

        //set the containers size
        dojo.style(this.contentNode, "width", this.width + "px");
        dojo.style(this.contentNode, "height", this.height + "px");
    },

    //places content into a frame
    place: function(frame) {
        //remove content if already exists
        var node = dojo.byId(this.htmlId);
        if(node) dojo.destroy(node);

        //place into the given frame
        if(frame) {
            //deactivate current content
            this.deactivate();
            
            //refresh register vars
            this.placeAt = frame.contentId;
            this.tabBarId = frame.htmlId;
        }

        this.contentNode = dojo.create("div", {
            "class": "content",
            "uitype": this.uiType,
            "id": this.htmlId
        }, dojo.byId(this.placeAt));

        //add content into node
        this.setContent();

        //activate content
        if(frame) this.activate();
    }
});

