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
dojo.require("dojo.dnd.Moveable");

dojo.declare("ui.Frame", ui.Object, {
    contentId: null,
    tabBar: null,
    tabs: null,
    width: null,
    height: null,
    posX: null,
    posY: null,
    name: null,
    frameNode: null,
    contentNode: null,
    border: null,
    borderNode: null,
    borderThickness: null,

    /**
     * initializes frame
     * @param args
     */
    constructor: function(args) {
        this.uiType = "frame";
        this.tabs = args.tabs;
        this.width = args.width;
        this.height = args.height;
        this.posX = args.x;
        this.posY = args.y;
        this.border = args.border;
        this.name = args.name;
    },

    /**
     * creates and places the frame
     */
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


        this.tabBar = new ui.TabBar({
            frameId: this.htmlId,
            placeAt: this.htmlId,
            tabs: this.tabs
        });

        this.tabBar.create();
        
        this.setSize(this.width, this.height);
        this.setPosition(this.posX, this.posY);
        this.setResizeBorder(this.border, 6);
    },

    /**
     * sets the size of the frame
     * @param width integer
     * @param height integer
     * @param throwEvent boolean if true it throws a FrameResize event. default value is false
     */
    setSize: function(width, height, throwEvent) {
        width = (typeof width == "number") ? width : 500;
        height = (typeof height == "number") ? height : 400;

        //set as css properties
        dojo.style(this.frameNode, "width", width + "px");
        dojo.style(this.frameNode, "height", height + "px");

        //get tab bar height
        var tabBarHeight = this.tabBar.height();
        var contentHeight = height - tabBarHeight;

        //set content div
        dojo.style(this.contentNode, "width", width + "px");
        dojo.style(this.contentNode, "height", contentHeight + "px");

        this.tabBar.setSize(width);

        //set content width
        for(var tabName in this.tabBar.tabs) {
            var tab = this.tabBar.tabs[tabName];
            tab.content.setSize(width, contentHeight);
        }

        //update border size/position
        this.setResizeBorder();

        if(throwEvent) dojo.publish("FrameResize", [{
            name: this.name,
            width: width,
            height: height
        }])
    },

    /**
     * sets the position of this frame
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        this.posX = x;
        this.posY = y;

        //get frame node
        var node = dojo.byId(this.htmlId);

        //set new position
        dojo.style(node, "left", this.posX + "px");
        dojo.style(node, "top", this.posY + "px");
    },

    /**
     * creates border for the resizing of a frame
     * @param border array sets which border will create ["top", "right", "bottom", "left"]
     * @param thickness integer
     */
    setResizeBorder: function(border, thickness) {
        if(!thickness) thickness = this.borderThickness || 6;

        //get current set border sides
        if(!border) for(var side in this.borderNode) {
            if(!border) border = [];
            border.push(side);
        }

        //get position and size of the frame node
        var pos = dojo.position(this.frameNode, true);
        var posOffset = Math.floor(thickness/2);
        var sizeOffset = thickness - posOffset;

        //creates the border
        var createBorder = dojo.hitch(this, function(properties, htmlId) {
            if(!this.borderNode) this.borderNode = {};
            var side = properties.s;
            
            //create a new one
            if(!this.borderNode[side]) {
                this.borderNode[side] = new ui.FrameBorder({
                    width: properties.w,
                    height: properties.h,
                    x: properties.x,
                    y: properties.y,
                    frameId: htmlId,
                    side: side
                });
            }

            //update the old node
            else {
                var border = this.borderNode[side];
                border.setPosition(properties.x, properties.y);
                border.setSize(properties.w, properties.h);
            }
        });

        //create border
        dojo.forEach(border, dojo.hitch(this, function(b) {
            //create top border
            if(b == "top") {
                var top = {
                    s: "top",
                    x: pos.x + sizeOffset,
                    y: pos.y - posOffset,
                    w: pos.w - sizeOffset - posOffset,
                    h: thickness
                };

                createBorder(top, this.htmlId);
            }

            //create right border
            else if(b == "right") {
                var right = {
                    s: "right",
                    x: pos.x + pos.w - posOffset,
                    y: pos.y + sizeOffset,
                    w: thickness,
                    h: pos.h - sizeOffset - posOffset
                };

                createBorder(right, this.htmlId);
            }

            //create bottom border
            else if(b == "bottom") {
                var bottom = {
                    s: "bottom",
                    x: pos.x + sizeOffset,
                    y: pos.y + pos.h - posOffset,
                    w: pos.w - sizeOffset - posOffset,
                    h: thickness
                };

                createBorder(bottom, this.htmlId);
            }

            //create left border
            if(b == "left") {
                var left = {
                    s: "left",
                    x: pos.x - posOffset,
                    y: pos.y + sizeOffset,
                    w: thickness,
                    h: pos.h - sizeOffset - posOffset
                };

                createBorder(left, this.htmlId);
            }
        }));
    }
});

/**
 * border for resizing a frame
 */
dojo.declare("ui.FrameBorder", ui.Object, {
    borderNode: null,
    frameId: null,
    side: null,
    width: null,
    height: null,
    posX: null,
    posY: null,

    //resize vars
    resizeX: null,
    resizeY: null,
    dnd: null,

    /**
     * initializes the border
     * and creates it
     * @param args
     */
    constructor: function(args) {
        this.frameId = args.frameId;
        this.side = args.side;
        this.width = args.width;
        this.height = args.height;
        this.posX = args.x;
        this.posY = args.y;

        //create border
        this.create();
    },

    /**
     * creates the border
     */
    create: function() {
        this.inherited(arguments);

        //create border node
        this.borderNode = dojo.create("div",{
            "class": "FrameBorder",
            "id": this.htmlId,
            "style": {
                "width": this.width + "px",
                "height": this.height + "px",
                "left": this.posX + "px",
                "top": this.posY + "px"
            }
        }, dojo.body());

        //make border movable
        this.dnd = new dojo.dnd.Moveable(dojo.byId(this.htmlId));

        //store old position for calculating the new frame size
        this.dnd.onMoveStart =  dojo.hitch(this, function(mover) {
            this.resizeX = this.posX;
            this.resizeY = this.posY;

            dojo.addClass(this.borderNode, "active");
        });

        //allow specific move directions
        this.dnd.onMove = dojo.hitch(this, function(mover, position, event) {
            if(this.side == "left" || this.side == "right") {
                this.setPosition(position.l, this.posY);
            } else if(this.side == "top" || this.side == "bottom") {
                this.setPosition(this.posX, position.t);
            }
        });

        //calculates the new frame size
        this.dnd.onMoveStop =  dojo.hitch(this, function(mover) {
            var widthVec = 0, heightVec = 0;

            //get parent frame
            var frame = this.getGlobal("frame", this.frameId);
            var framePos = dojo.position(frame.htmlId);

            //calculate new width
            if(this.side == "right") widthVec = this.posX - this.resizeX;
            else if(this.side == "left") widthVec = this.resizeX - this.posX;
            var resizeWidth = framePos.w + widthVec;

            //calculate new height
            if(this.side == "bottom") heightVec = this.posY - this.resizeY;
            if(this.side == "top") heightVec = this.resizeY - this.posY;
            var resizeHeight = framePos.h + heightVec;

            //TODO set frame position if top or left border is used

            //set new frame size
            frame.setSize(resizeWidth, resizeHeight, true);

            //update border size/position
            //frame.setResizeBorder();

            dojo.removeClass(this.borderNode, "active");
        });
    },

    /**
     * sets the specific resize cursor
     */
    setCursor: function(side) {
        this.side = side;
        
        //TODO implement
        if(this.side == "left" || this.side == "right") {

        } else if(this.side == "top" || this.side == "bottom") {
            
        }
    },

    /**
     * sets the size of the border
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        this.width = width;
        this.height = height;

        dojo.style(this.borderNode, "width", this.width + "px");
        dojo.style(this.borderNode, "height", this.height + "px");
    },

    /**
     * sets the position of the border
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        this.posX = x;
        this.posY = y;
        
        dojo.style(this.borderNode, "left", this.posX + "px");
        dojo.style(this.borderNode, "top", this.posY + "px");
    }
});