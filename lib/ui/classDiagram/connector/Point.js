/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:39
 */
dojo.provide("ui.classDiagram.connector.Point");
dojo.require("ui.util.Math");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.connector.Point", ui.Object, {
    MOVE_EVENT: null,
    direction: null,
    connectSide: null,
    moveRange: null,
    parentId: null,
    offset: null,
    lockX: null,
    lockY: null,
    type: null,
    math: null,
    dnd: null,
    x: null,
    y: null,
    w: null,
    h: null,

    constructor: function(args) {
        this.direction = args.direction || "";
        this.parentId = args.parentId;
        this.offset = args.offset || 0;
        this.type = args.type || "Point";
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.math = new ui.util.Math();
        this.uiType = "point";
    },

    create: function() {
        this.inherited(arguments);

        //create event names
        this.MOVE_EVENT = "_pos_" + this.htmlId;

        //place point
        dojo.place(
            '<div class="Point" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //set initial position and type
        this.setPosition(this.x, this.y, false);
        this.setType(this.type, this.direction);
        this.getSize();

        //make point draggable
        this.dnd = new dojo.dnd.Moveable(this.htmlId);

        //throw change event
        this.dnd.onMoving = dojo.hitch(this, function(mover, leftTop) {
            this.x = leftTop.l;
            this.y = leftTop.t;

            dojo.publish(this.MOVE_EVENT);
        });
    },

    registerClass: function(classId) {

    },

    /**
     * sets new position
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        x = x || this.x || 0;
        y = y || this.y || 0;
        this.x = x;
        this.y = y;

        //replace point
        dojo.style(node, "left", this.x + "px");
        dojo.style(node, "top", this.y + "px");

        //throw change event
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * sets on which side of the parent
     * class this point is connected.
     * furthermore it locks a specific
     * move direction by interpreting
     * the connected side
     * @param side string "top", "right", "bottom" or "left"
     */
    setConnectSide: function(side) {
        side = side || "top";
        this.connectSide = side;

        //lock move direction
        if(side == "right" || side == "left") {
            this.lockX = true;
            this.lockY = false;
        } else {
            this.lockX = false;
            this.lockY = true;
        }
    },

    /**
     * sets the move range
     * range: {
     *   x0: integer,
     *   y0: integer,
     *   x1: integer,
     *   y1: integer
     * }
     * @param range object
     * @param side string
     */
    setMoveRange: function(range, side) {
        side = side || this.connectSide;
        if(side) this.setConnectSide(side);
        this.moveRange = range;
    },

    setOffset: function(offset) {
        this.offset = offset || 0;
    },

    /**
     * gets the direction in which
     * the point is looking
     * @param c0 ui.classDiagram.Class
     * @param c1 ui.classDiagram.Class
     * @return string "north", "east", "south" or "west"
     */
    getDirection: function(c0, c1) {
        var pos = this.math.calcSide(c0, c1);
        if(pos == "top") this.direction = "north";
        else if(pos == "right") this.direction = "east";
        else if(pos == "bottom") this.direction = "south";
        else if(pos == "left") this.direction = "west";
        return this.direction;
    },

    /**
     * sets the point type like a generalization
     * @param type string "Generalization", "Aggregation" ...
     * @param direction string "north", "east", "south" or "west"
     */
    setType: function(type, direction) {
        this.direction = direction || this.direction || "";
        this.type = type || this.type || "Point";
        var node = dojo.byId(this.htmlId);

        dojo.attr(node, "class", this.type + " " + this.direction)
    },

    /**
     * gets the points size
     */
    getSize: function() {
        var node = dojo.byId(this.htmlId);
        this.w = dojo.style(node, "width");
        this.h = dojo.style(node, "height");
        return {
            x: this.x,
            y: this.y
        }
    }
});