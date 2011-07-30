/**
 * User: Christoph Grundmann
 * Date: 04.07.11
 * Time: 15:49
 * a tooltip like mouse tag
 * that follows the mouse pointer
 * used for showing the activity of a tool
 * like the add-tool for classes
 */
dojo.provide("ui.MouseInfo");
dojo.require("ui.Object");

dojo.declare("ui.MouseInfo", ui.Object, {
    onClickUiType: null,
    onClickArea: null,
    onClick: null,
    icon: null,
    title: null,

    //ids
    iconId: null,
    titleId: null,
    offsetX: null,
    offsetY: null,
    x: null,
    y: null,

    /**
     * initializes mouse info tooltip
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.onClickUiType = args.onClickUiType;
        this.onClickArea = args.onClickArea;
        this.onClick = args.onClick;
        this.icon = args.icon;
        this.title = args.title;
        this.offsetX = args.offsetX || 10;
        this.offsetY = args.offsetY || 10;
        this.x = args.x;
        this.y = args.y;
    },

    /**
     * places tooltip and sets
     * onMouseMove event listener
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.iconId = this.htmlId + "Icon";
        this.titleId = this.htmlId + "Title";

        //place info tooltip
        dojo.place(
            '<div class="MouseInfo" id="' + this.htmlId + '">' +
                '<div class="inner">' +
                    '<div class="icon" id="' + this.iconId + '"></div>' +
                    '<div class="title" id="' + this.titleId + '"></div>' +
                '</div>' +
            '</div>',
            dojo.byId("main")
        );

        //setup info tooltip
        this.setPosition(this.x, this.y, this.offsetX, this.offsetY);
        this.setIcon(this.icon);
        this.setTitle(this.title);

        //register onMouseMove event
        this.connect({
            event: "onmousemove",
            body: true,
            method: function(event) {
                //update position
                this.setPosition(event.clientX, event.clientY, this.offsetX, this.offsetY);
            }
        });

        //execute onClick function
        if(this.onClick && this.onClickArea) {
            this.connect({
                event: "onclick",
                nodeId: this.onClickArea,
                method: function(event) {
                    //dojo.stopEvent(event);
                    this.onClick(event);
                }
            });
        }

        //check on gui types
        else if(this.onClick && this.onClickUiType) {
            this.connect({
                event: "onclick",
                nodeId: "main",
                method: function(event) {
                    //gets the uitype and reference
                    //of the clicked DOM element
                    var getUiObject = dojo.hitch(this, function(node) {
                        //max search iterations
                        var maxSearchLoops = 10;
                        var curSearchLoops = 0;
                        var nodeId = null;
                        var uiType = null;

                        //search ui type of the given node
                        while(!uiType && curSearchLoops < maxSearchLoops && node) {
                            //get uitype property of the current node
                            uiType = dojo.getNodeProp(node, "uitype");
                            //get next parent node if no type is found
                            if(!uiType) node = node.parentNode;
                            //otherwise get the nodes id
                            else nodeId = node.id;
                            //increment loop counter
                            curSearchLoops++;
                        }

                        //if specific ui type found return it
                        if(uiType == this.onClickUiType) {
                            return this.getGlobal(uiType, nodeId);
                        }

                        //otherwise return false
                        else return false;
                    });

                    //get searched ui element and return it if found
                    var uiObject = getUiObject(event.target);
                    if(uiObject) this.onClick(event, uiObject);
                }
            });
        }
    },

    /**
     * activates event handler and shows the tooltip
     */
    activate: function() {
        this.inherited(arguments);
        this.show();
    },

    /**
     * deactivates event handler and hides tooltip
     */
    deactivate: function() {
        this.hide(0);
        this.inherited(arguments);
    },

    /**
     * sets the title
     * @param title string
     */
    setTitle: function(title) {
        this.title = title || this.title || "";
        var node = dojo.byId(this.titleId);

        //set title
        if(title) {
            dojo.style(node, "display", "");
            node.innerHTML = this.title;
        }
        //or hide
        else dojo.style(node, "display", "none");
    },

    /**
     * sets icon
     * @param icon string css class
     */
    setIcon: function(icon) {
        this.icon = icon || this.icon;
        var node = dojo.byId(this.iconId);

        //set new icon class
        if(icon) {
            dojo.style(node, "display", "");
            dojo.attr(node, "class", "icon " + icon);
        }
        //or hide icon
        else dojo.style(node, "display", "none");
    },

    /**
     * sets the position of this info tooltip
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y, offsetX, offsetY) {
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;
        this.x = x || 0;
        this.y = y || 0;

        //set position
        var node = dojo.byId(this.htmlId);
        dojo.style(node, "left", this.x + this.offsetX + "px");
        dojo.style(node, "top", this.y + this.offsetY + "px");
    }
});
