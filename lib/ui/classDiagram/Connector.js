/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:38
 */

dojo.provide("ui.classDiagram.Connector");

dojo.require("ui.Object");
dojo.require("ui.util.Math");
dojo.require("ui.classDiagram.connector.Point");
dojo.require("ui.classDiagram.connector.Line");

dojo.declare("ui.classDiagram.Connector", ui.Object, {
    math: null,

    //the two classes who
    //connects to each other
    p0Class: null,
    p3Class: null,

    //connector points
    p0: null,
    p1: null,
    p2: null,
    p3: null,
    l0: null,
    l1: null,
    l2: null,

    //todo create special subclasses for other types
    //association, aggregation, composition
    type: null,

    dnd: null,

    /**
     * args: {
     *   x0: integer,
     *   y0: integer,
     *   x1: integer,
     *   y1: integer
     * }
     * @param args
     */
    constructor: function(args) {
        this.math = new ui.util.Math();

        //create start point
        this.p0 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x0,
            y: args.y0
        });

        //create end point
        this.p3 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            x: args.x1,
            y: args.y1
        });
    },

    /**
     * creates connector
     */
    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //create start and end point
        this.p0.create();
        this.p3.create();

        //listen to move events
        this.subscribe({
            event: this.p3.MOVE_EVENT,
            method: dojo.hitch(this, function() {
                this.update("p0");
            })
        });

        this.subscribe({
            event: this.p0.MOVE_EVENT,
            method: dojo.hitch(this, function() {
                this.update("p3");
            })
        });

        //update positions
        this.update();
    },

    /**
     * registers a class to
     * a specific point
     * @param c0 ui.classDiagram.Class
     * @param p0 string point name "p0" (start point) or "p1" (end point)
     * @param c1 ui.classDiagram.Class
     * @param p1 string point name "p0" (start point) or "p1" (end point)
     */
    registerClass: function(c0, p0, c1, p1) {
        //init connect side
        var c0Pos = dojo.position(c0.htmlId, true);
        var c1Pos = dojo.position(c1.htmlId, true);
        var p0Side = this.math.calcSide(c0Pos, c1Pos);
        var p1Side = this.math.calcSide(c1Pos, c0Pos);
        this.p0.setConnectSide(p0Side);
        this.p3.setConnectSide(p1Side);

        //store class
        this.p0Class = c0;
        this.p3Class = c1;

        //set initial position
        this.setPosition("p0");
        this.setPosition("p1");

        //TODO if p0Class changed remove old event listener
        //listen to move events
        this.subscribe({
            event: c0.MOVE_EVENT,
            method: function() {
                this.setPosition("p0");
            }
        });

        //listen to move events
        this.subscribe({
            event: c1.MOVE_EVENT,
            method: function() {
                this.setPosition("p1");
            }
        });
    },

    /**
     * sets new position of a specific point
     * @param string point name "p0" or "p1"
     */
    setPosition: function(point) {
        point = (point == "p1") ? "p3" : "p0";
        var pClass = point + "Class";

        //get new position and range of the point
        var range = this[pClass].getConnectRange(this[point]);

        //set move range
        this[point].setMoveRange(range.range, range.side);

        //set position
        this[point].setPosition(range.x, range.y);
    },

    /**
     * updates the position of
     * each point and line
     * @pointName string name of the point which class-position will be updated
     */
    update: function(pointName) {
        var c0Pos, c1Pos, p0Side, p1Side;
        var p1x = 0, p1y = 0, p2x = 0, p2y = 0;

        //get connect side and position of each class
        if(this.p0Class && this.p3Class) {
            var c0Pos = dojo.position(this.p0Class.htmlId, true);
            var c1Pos = dojo.position(this.p3Class.htmlId, true);
            //get class origin
            c0Pos = this.math.origin(c0Pos);
            c1Pos = this.math.origin(c1Pos);
            //get side
            var p0Side = this.math.calcSide(c0Pos, c1Pos) || "left";
            var p1Side = this.math.calcSide(c1Pos, c0Pos) || "right";
        }

        //p3 is beside p0
        if(p0Side == "left" || p0Side == "right") {
            //calculate the x-coordinate of p1 and p2
            var x = (this.math.deltaX(this.p0, this.p3)/2) + Math.min(this.p0.x, this.p3.x);

            //get positions
            p1x = x;
            p1y = this.p0.y;
            p2x = x;
            p2y = this.p3.y;
        }

        //p3 is above or below p0
        else {
            //calculate the y-coordinate of p1 and p2
            var y = (this.math.deltaY(this.p0, this.p3)/2) + Math.min(this.p0.y, this.p3.y);

            //get positions
            p1x = this.p0.x;
            p1y = y;
            p2x = this.p3.x;
            p2y = y;
        }

        //set position of p1 if already exists
        if(this.p1) this.p1.setPosition(p1x, p1y);

        //otherwise create new point
        else {
            this.p1 = new ui.classDiagram.connector.Point({
                placeAt: this.placeAt,
                x: p1x,
                y: p1y
            });

            this.p1.create();
        }

        //set position of p2 if already exists
        if(this.p2) this.p2.setPosition(p2x, p2y);

        //otherwise create new point
        else {
            this.p2 = new ui.classDiagram.connector.Point({
                placeAt: this.placeAt,
                x: p2x,
                y: p2y
            });

            this.p2.create();
        }

        //update position on side change
        if(p0Side && this.p0.connectSide != p0Side) {
            this.p0.setConnectSide(p0Side);
            this.setPosition("p0");
        }

        if(p1Side && this.p3.connectSide != p1Side) {
            this.p3.setConnectSide(p1Side);
            this.setPosition("p1");
        }

        //update lines
        if(this.l0) this.l0.update(this.p0, this.p1);
        else {
            //create new line
            this.l0 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l0.create();
        }

        if(this.l1) this.l1.update(this.p1, this.p2);
        else {
            //create new line
            this.l1 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l1.create();
        }

        if(this.l2) this.l2.update(this.p2, this.p3);
        else {
            //create new line
            this.l2 = ui.classDiagram.connector.Line({
                placeAt: this.placeAt
            });
            //place line
            this.l2.create();
        }
    }

});
