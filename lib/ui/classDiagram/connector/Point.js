/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:39
 */
dojo.provide("ui.classDiagram.connector.Point");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.connector.Point", ui.Object, {
    parentId: null,
    points: null,
    order: null,
    dnd: null,
    posX: null,
    posY: null,

    constructor: function(args) {
        this.parentId = args.parentId;
        this.order = args.order;
        this.posX = args.x || 0;
        this.posY = args.y || 0;

        this.create();
    },

    create: function() {
        this.inherited(arguments);

        //place point
        dojo.place(
            '<div class="point" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        this.setPosition();

        //make point draggable
        this.dnd = new dojo.dnd.Moveable(this.htmlId);

        //backup the old onMoveStop function
        if(!this.dnd["_OnMoveStop"]) {
            this.dnd["_OnMoveStop"] = this.dnd.onMoveStop;
        }

        //overwrite onMoveStop event handler
        this.dnd.onMoveStop = dojo.hitch(this, function(mover) {
            //execute old onMoveStop function
            this.dnd._OnMoveStop(mover);

            //store new position
            var pointNode = dojo.byId(this.htmlId);
            this.posX = dojo.style(pointNode, "left");
            this.posY = dojo.style(pointNode, "top");
        });

        //throw change event
        this.dnd.onMoved = dojo.hitch(this, function(mover, leftTop) {
            dojo.publish("_pos_" + this.htmlId, [this]);
        });
    },

    /**
     * registers points to this point, so
     * this point can react on position changes
     * @param points array of points
     */
    registerPoints: function(points) {
        /*
        this.points = points;

        //listen to each point
        dojo.forEach(points, dojo.hitch(this, function(p) {
            this.subscribe({
                event: "_pos_" + p.htmlId,
                method: function(point) {
                    //get current position of the dragged point
                    var pointNode = dojo.byId(point.htmlId);
                    var pointX = dojo.style(pointNode, "left");
                    var pointY = dojo.style(pointNode, "top");

                    var vecX = Math.abs(pointX - this.posX);
                    var vecY = Math.abs(pointY - this.posY);

                    if(vecX > vecY) {
                        //p is beside this point
                        //console.debug("beside");
                        this.setPosition(this.posX, pointY);
                    } else {
                        //p is above or below this point
                        //console.debug("below/above");
                        this.setPosition(pointX, this.posY);
                    }
                }
            })
        }));*/
    },

    registerClass: function(classId) {

    },

    /**
     * sets new position
     * @param x integer
     * @param y integer
     */
    setPosition: function(x, y) {
        x = x || this.posX || 0;
        y = y || this.posY || 0;
        this.posX = x;
        this.posY = y;

        //replace point
        var pointNode = dojo.byId(this.htmlId);
        dojo.style(pointNode, "left", this.posX + "px");
        dojo.style(pointNode, "top", this.posY + "px");

        //throw change event
        dojo.publish("_pos_" + this.htmlId, [this]);
    }
});