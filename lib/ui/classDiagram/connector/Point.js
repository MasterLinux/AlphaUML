/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:39
 */
dojo.provide("ui.classDiagram.connector.Point");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.connector.Point", ui.Object, {
    MOVE_EVENT: null,
    connectSide: null,
    moveRange: null,
    parentId: null,
    offset: null,
    lockX: null,
    lockY: null,
    dnd: null,
    x: null,
    y: null,

    constructor: function(args) {
        this.parentId = args.parentId;
        this.offset = args.offset || 0;
        this.x = args.x || 0;
        this.y = args.y || 0;
    },

    create: function() {
        this.inherited(arguments);

        //create event names
        this.MOVE_EVENT = "_pos_" + this.htmlId;

        //place point
        dojo.place(
            '<div class="point" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //set initial position
        this.setPosition(this.x, this.y, false);

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
        x = x || this.x || 0;
        y = y || this.y || 0;
        this.x = x;
        this.y = y;

        //replace point
        var pointNode = dojo.byId(this.htmlId);
        dojo.style(pointNode, "left", this.x + "px");
        dojo.style(pointNode, "top", this.y + "px");

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
    }
});