/**
 * User: Christoph Grundmann
 * Date: 18.06.11
 * Time: 16:32
 *
 * implements a scrollable content area
 */
dojo.provide("ui.content.Scrollable");
//dojo.require("dojo.dnd.Movable");
dojo.require("ui.Content");

dojo.declare("ui.content.Scrollable", ui.Content, {
    isScrolling: null,
    lockAxisX: null,
    lockAxisY: null,
    scrollX: null,
    scrollY: null,
    vectorX: null,
    vectorY: null,
    areaId: null,
    dnd: null,

    /**
     * initializes scrollable content area
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.lockAxisX = (typeof args.lockAxisX == "boolean") ? args.lockAxisX : false;
        this.lockAxisY = (typeof args.lockAxisY == "boolean") ? args.lockAxisY : false;
    },

    /**
     * creates a scrollable area and
     * places it into dom
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.areaId = this.htmlId + "Area";

        //create scrollable area
        this.createArea();
    },

    /**
     * replaces area into dom
     * and activates each necessary
     * event handler. will be executed
     * on the end of the replacing procedure
     */
    onPlaceEnd: function() {
        //create scrollable area
        this.createArea();
    },

    /**
     * deactivates event handler
     * and removes area from dom. will be executed
     * on the start of the replacing procedure
     */
    onPlaceStart: function() {
        //remove drag and drop functionality
        if(this.dnd) this.dnd.destroy();

        //get area node and destroy it if necessary
        var areaNode = dojo.byId(this.areaId);
        if(areaNode) dojo.destroy(areaNode);
    },

    /**
     * activates each event handler and
     * sets the scroll position
     */
    activate: function() {
        this.inherited(arguments);

        //set scroll position
        var contentNode = dojo.byId(this.htmlId);
        var areaNode = dojo.byId(this.areaId);
        //x axis
        if(contentNode && areaNode && this.scrollX) {
            contentNode.scrollLeft = this.scrollX;
        }
        //y axis
        if(contentNode && areaNode && this.scrollY) {
            contentNode.scrollTop = this.scrollY;
        }
    },

    /**
     * creates a new scrollable content area
     */
    createArea: function() {
        var contentNode = dojo.byId(this.htmlId);

        if(contentNode && !dojo.byId(this.areaId)) {
            var contentNode = dojo.byId(this.htmlId);
            //place area
            dojo.place(
                '<div class="area" id="' + this.areaId + '"></div>',
                dojo.byId(this.htmlId)
            );

            //show scroll bars
            dojo.style(contentNode, "overflow", "scroll");

            //TODO calculate size
            var areaNode = dojo.byId(this.areaId);
            dojo.style(areaNode, "width", "100000px");
            dojo.style(areaNode, "height", "100000px");
            dojo.style(areaNode, "background", "#ffffff");
            dojo.style(areaNode, "cursor", "pointer");

            //make area movable
            this.dnd = new dojo.dnd.Moveable(this.areaId);

            //set scroll functionality
            this.dnd.onMove = dojo.hitch(this, function(mover, leftTop) {
                if(!mover["ScrollableArea"]) mover["ScrollableArea"] = this.htmlId;
                if(!this.scrollX) this.scrollX = 0;
                if(!this.scrollY) this.scrollY = 0;
                this.isScrolling = true;

                //calculate new position
                if(!this.lockAxisX) this.vectorX = this.scrollX - leftTop.l;
                if(!this.lockAxisY) this.vectorY = this.scrollY - leftTop.t;

                //set max scroll area TODO use the dynamic size of the area
                var xMax = 100000;
                var yMax = 100000;

                if(this.vectorX < 0) this.vectorX = 0;
                else if(this.vectorX > xMax) this.vectorX = xMax;

                if(this.vectorY < 0) this.vectorY = 0;
                else if(this.vectorY > yMax) this.vectorY = yMax;

                //set scroll bar
                contentNode.scrollLeft = this.vectorX;
                contentNode.scrollTop = this.vectorY;
            });

            //on move stop set new position
            this.subscribe({
                event: "/dnd/move/stop",
                method: function(mover) {
                    if(mover.ScrollableArea == this.htmlId) {
                        this.scrollX = this.vectorX;
                        this.scrollY = this.vectorY;
                        this.isScrolling = false;
                    }
                }
            });

            //listen for scroll events
            this.connect({
                nodeId: this.htmlId,
                event: "scroll",
                method: function(event) {
                    //TODO test scrolling
                    //set only if the user is scrolling with the
                    //mouse wheel or the scroll bar
                    if(!this.isScrolling) {
                        var contentNode = dojo.byId(this.htmlId);
                        this.scrollX = contentNode.scrollLeft;
                        this.scrollY = contentNode.scrollTop;
                    }
                }
            })
        }


    }
});


