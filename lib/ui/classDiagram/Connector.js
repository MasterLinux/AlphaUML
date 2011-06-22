/**
 * User: Christoph Grundmann
 * Date: 20.06.11
 * Time: 14:38
 */

dojo.provide("ui.classDiagram.Connector");

dojo.require("ui.Object");
dojo.require("ui.classDiagram.connector.Point");

dojo.declare("ui.classDiagram.Connector", ui.Object, {
    //the two classes who
    //connects to each other
    parents: null,

    //connector points
    p0: null,
    p1: null,
    p2: null,
    p3: null,

    //todo create special subclasses for other types
    //association, aggregation, composition
    type: null,

    dnd: null,

    constructor: function(args) {
        //this.dnd = {};
        //this.p0 = new ui.classDiagram.connector.Point();
        //this.p0.x = args.x0;
        //this.p0.y = args.y0;
        //this.p3.x = args.x1;
        //this.p3.y = args.y1;
    },

    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //create connector points TODO set parentId
        this.p0 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            order: 0,
            x: 60,
            y: 20
        });

        this.p1 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            order: 1,
            x: 80,
            y: 20
        });

        this.p2 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            order: 2,
            x: 80,
            y: 40
        });
        
        this.p3 = new ui.classDiagram.connector.Point({
            placeAt: this.placeAt,
            order: 3,
            x: 100,
            y: 40
        });


/*
        this.p0.create();
        this.p1.create();
        this.p2.create();
        this.p3.create();

        this.p0.registerPoints([this.p1]);
        this.p1.registerPoints([this.p0, this.p2]);
        this.p2.registerPoints([this.p1, this.p3]);
        this.p3.registerPoints([this.p2]); */

        /*
        this.calcPos(false);
        
        //draw points
        this.setPoint("p0", "test");
        this.setPoint("p1", "test");
        this.setPoint("p2", "test");
        this.setPoint("p3", "test");

        //set lines
        this.setLine("p0", "p1", "test");
        this.setLine("p1", "p2", "test");
        this.setLine("p2", "p3", "test");
        */
    },

    /*
    destroy: function() {
        //remove drag and drop handler
        for(n in this.dnd) {
            this.dnd[n].destroy;
            delete this.dnd[n];
        } delete this.dnd;

        //call method from superclass
        this.inherited(arguments);
    }, */

    /**
     * places html
     */
    draw: function() {

    },

    /**
     * removes html
     */
    clear: function() {

    },

    /**
     * calculates the position of each point
     * @param {Boolean} vertical
     * @return {Array} positions
     */
    calcPos: function(args) {
        //get each argument
        var vertical = args.vertical || false;
        var p0 = args.start;
        var p3 = args.end;
        var p1, p2;

        //get direction
        var n0, n1;
        if(vertical) {
            n0 = "x";
            n1 = "y";
        } else {
            n0 = "y";
            n1 = "x"
        }

        //get max and min value
        var max = Math.max(p0[n1], p3[n1]);
        var min = Math.min(p0[n1], p3[n1]);
        var mid = (max - min)/2+min;

        //calculate points
        p1[n0] = p0[n0];
        p1[n1] = mid;
        p2[n0] = p3[n0];
        p2[n1] = mid;

        return {
            p0: p0,
            p1: p1,
            p2: p2,
            p3: p3
        }
    },

    setPoint: function(id, refNode) {
        //place point node
        dojo.place('<div id="' + id + '" class="point"></div>', refNode);

        //set position
        dojo.style(id, "left", this[id].x + "px");
        dojo.style(id, "top", this[id].y + "px");

        //set drag and drop handler
        this.dnd[id] = new dojo.dnd.Moveable(dojo.byId(id));

        //overwritten method
        //calculate position of the neighbour point
        this.dnd[id].onMoving = dojo.hitch(this, function(e) {
            //get current position
            this[id].x = dojo.style(id, "left");
            this[id].y = dojo.style(id, "top");

            if(id == "p0") {
                //get position
                this.p1.x = this[id].x;
                //update position
                this.updatePos("p1");
                //update lines
                this.updateLine("p0", "p1", "test");
                this.updateLine("p1", "p2", "test");

            } else if(id == "p1") {
                //get position
                this.p0.x = this[id].x;
                this.p2.y = this[id].y;
                //update position
                this.updatePos("p0");
                this.updatePos("p2");
                //update lines
                this.updateLine("p0", "p1", "test");
                this.updateLine("p1", "p2", "test");
                this.updateLine("p2", "p3", "test");

            } else if(id == "p2") {
                //get position
                this.p3.x = this[id].x;
                this.p1.y = this[id].y;
                //update position
                this.updatePos("p1");
                this.updatePos("p3");
                //update lines
                this.updateLine("p0", "p1", "test");
                this.updateLine("p1", "p2", "test");
                this.updateLine("p2", "p3", "test");

            } else if(id == "p3") {
                //get position
                this.p2.x = this[id].x;
                //update position
                this.updatePos("p2");
                //update lines
                this.updateLine("p1", "p2", "test");
                this.updateLine("p2", "p3", "test");
            }
        });
    },

    updatePos: function(id) {
        dojo.style(id, "left", this[id].x + "px");
        dojo.style(id, "top", this[id].y + "px");
    },

    setLine: function(id0, id1, refNode) {
        //place line node
        var id = "line_" + id0 + "_" + id1;
        dojo.place('<div id="' + id + '" class="line"></div>', refNode);

        //get positions
        var x0 = dojo.style(id0, "left");
        var y0 = dojo.style(id0, "top");
        var x1 = dojo.style(id1, "left");
        var y1 = dojo.style(id1, "top");

        if(x0 != x1) {
            //calculate diff
            var max = Math.max(x0, x1);
            var min = Math.min(x0, x1);
            var diff = max - min;

            //add class and additional style
            dojo.addClass(id, "horizontal");
            dojo.style(id, "width", diff + "px");

        } else if(y0 != y1) {
            //calculate diff
            var max = Math.max(y0, y1);
            var min = Math.min(y0, y1);
            var diff = max - min;

            //add class and additional style
            dojo.addClass(id, "vertical");
            dojo.style(id, "height", diff + "px");

        }

        //get position
        var x = Math.min(x0, x1) + dojo.style(id0, "width")/2-1;
        var y = Math.min(y0, y1) + dojo.style(id0, "width")/2-1;
        
        //set position
        dojo.style(id, "left", x + "px");
        dojo.style(id, "top", y + "px");
    },

    updateLine: function(id0, id1, refNode) {
        //get id
        var id = "line_" + id0 + "_" + id1;

        //remove line
        dojo.destroy(id);

        //draw new one
        this.setLine(id0, id1, refNode);
    }

});
