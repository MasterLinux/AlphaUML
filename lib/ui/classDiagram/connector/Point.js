/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:39
 */
dojo.provide("ui.classDiagram.connector.Point");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.connector.Point", ui.Object, {
    MOVE_EVENT: null,
    parentId: null,
    dnd: null,
    x: null,
    y: null,

    constructor: function(args) {
        this.parentId = args.parentId;
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
    }
});