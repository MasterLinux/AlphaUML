/**
 * User: Christoph Grundmann
 * Date: 27.06.11
 * Time: 16:50
 *
 */
dojo.provide("ui.classDiagram.connector.Line");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.Object");
dojo.require("ui.util.Math");

dojo.declare("ui.classDiagram.connector.Line", ui.Object, {
    name: null,
    nameLabel: null,
    thickness: null,
    side: null,
    math: null,
    width: null,
    height: null,
    onClick: null,
    onMouseOver: null,
    onMouseOut: null,
    isSelected: null,
    isHovered: null,
    dashed: null,
    x: null,
    y: null,
    p0: null,
    p1: null,

    constructor: function(args) {
        args = args || {};
        this.math = new ui.util.Math();
        this.dashed = args.dashed;
        this.thickness = args.thickness;
        this.uiType = "line";
        this.name = args.name;
        this.onClick = args.onClick;
        this.onMouseOver = args.onMouseOver;
        this.onMouseOut = args.onMouseOut;
    },

    create: function() {
        this.inherited(arguments);

        dojo.place(
            '<div class="Line" id="' + this.htmlId + '"></div>',
            dojo.byId(this.placeAt)
        );

        //set dashed line
        if(this.dashed) dojo.addClass(this.htmlId, "dashed");

        //setup line
        this.setThickness(this.thickness);
        this.setName(this.name);

        //register onclick event
        this.connect({
            event: "onclick",
            nodeId: this.htmlId,
            method: function(event) {
                if(this.onClick) {
                    dojo.stopEvent(event);
                    this.onClick(event);
                }
            }
        });

        //mouse hover
        this.connect({
            event: "onmouseover",
            nodeId: this.htmlId,
            method: function() {
                if(this.onMouseOver) this.onMouseOver();
            }
        });

        //mouse out
        this.connect({
            event: "onmouseout",
            nodeId: this.htmlId,
            method: function() {
                if(this.onMouseOut) this.onMouseOut();
            }
        });
    },

    /**
     * destroys line
     * @param del
     */
    destroy: function(del) {
        if(this.nameLabel) this.nameLabel.destroy(true);
        this.inherited(arguments);
    },

    /**
     * sets association name
     * @param name
     * @param direction
     */
    setName: function(name, direction) {
        this.name = name || this.name || "Name";

        //set label
        if(name && !this.nameLabel) {
            this.nameLabel = new ui.classDiagram.AssociationName({
                placeAt: this.placeAt,
                parent: this,
                name: this.name,
                side: "above",
                offsetX: 3,
                offsetY: 3
            });

            this.nameLabel.create();
        }

        //activate existing role label
        else if(name && this.nameLabel) {
            this.nameLabel.activate();
        }

        else if(!name && this.nameLabel) {
            this.nameLabel.deactivate();
        }
    },

    /**
     * selects this point
     * @param select
     */
    select: function(select) {
        select = select || !this.isSelected;
        this.isSelected = select;
        var node = dojo.byId(this.htmlId);

        if(select) dojo.addClass(node, "selected");
        else dojo.removeClass(node, "selected");
    },

    /**
     * makes line thicker
     * @param hover boolean
     */
    hover: function(hover) {
        hover = hover || !this.isHovered;
        this.isHovered = hover;
        var node = dojo.byId(this.htmlId);

        //hover line
        if(hover) {
            dojo.addClass(node, "hovered");
            //set new thickness
            this.setThickness(6);
        }

        //reset line
        else {
            dojo.removeClass(node, "hovered");
            //set new thickness
            this.setThickness(2);
        }

        //update line
        this.update(this.p0, this.p1);
    },

    /**
     * sets line type
     * @param type string "dashed" or "solid"
     */
    setType: function(type) {

    },

    /**
     * updates the size and position
     * @param p0 ui.classDiagram.connector.Point
     * @param p1 ui.classDiagram.connector.Point
     */
    update: function(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
        var width, height, x, y;
        var node = dojo.byId(this.htmlId);
        var side = this.math.position(p0, p1);
        this.side = side;

        //get origin
        var p0Origin = this.math.origin(p0);
        var p1Origin = this.math.origin(p1);

        //0 = p1 is beside p0
        if(side === 0) {
            width = this.math.deltaX(p0Origin, p1Origin);
            height = this.thickness;

            //get position
            if(p0Origin.x < p1Origin.x) {
                x = p0Origin.x;
                y = p0Origin.y - this.thickness/2;
            } else {
                x = p1Origin.x;
                y = p0Origin.y - this.thickness/2;
            }
        }

        //1 = p1 is above/below p0
        else {
            width = this.thickness;
            height = this.math.deltaY(p0Origin, p1Origin);

            //get position
            if(p0Origin.y < p1Origin.y) {
                x = p0Origin.x - this.thickness/2;
                y = p0Origin.y;
            } else {
                x = p0Origin.x - this.thickness/2;
                y = p1Origin.y;
            }
        }

        //store size
        this.width = width;
        this.height = height;

        //set size
        dojo.style(node, "width", width + "px");
        dojo.style(node, "height", height + "px");

        //update position
        this.setPosition(x, y);

        //update label
        if(this.nameLabel)
            this.nameLabel.update();
    },

    setPosition: function(x, y) {
        var node = dojo.byId(this.htmlId);
        x = x || this.x || 0;
        y = y || this.y || 0;
        this.x = x;
        this.y = y;

        if(node) {
            dojo.style(node, "left", this.x + "px");
            dojo.style(node, "top", this.y + "px");
        }
    },

    setThickness: function(thickness) {
        this.thickness = thickness || this.thickness || 2;
    }
});
