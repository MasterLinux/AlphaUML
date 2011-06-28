/**
 * User: Christoph Grundmann
 * Date: 19.06.11
 * Time: 16:05
 *
 * implementation of a class diagram area
 */
dojo.provide("ui.content.ClassDiagram");
dojo.require("ui.content.Scrollable");
dojo.require("ui.classDiagram.Class");
dojo.require("ui.classDiagram.Connector");

dojo.declare("ui.content.ClassDiagram", ui.content.Scrollable, {
    classes: null,
    connectors: null,

    constructor: function(args){
        args = args || {};
        this.classes = [];
        this.connectors = [];
    },

    create: function() {
        this.inherited(arguments);

        var p = new ui.classDiagram.Connector({
            placeAt: this.areaId,
            x0: 20,
            y0: 40,
            x1: 60,
            y1: 80
        });

        p.create();

        var c = new ui.classDiagram.Class({
            placeAt: this.areaId,
            name: "ui.Class",
            isAbstract: true,
            stereotype: "enumeration",
            x: 20,
            y: 60
        });

        c.create();

        var c2 = new ui.classDiagram.Class({
            placeAt: this.areaId,
            name: "ui.Class2",
            isAbstract: true,
            stereotype: "dataType",
            x: 180,
            y: 60
        });

        c2.create();
        
        p.registerClass(c, "p0", c2, "p1");

        this.classes.push(c);
        this.classes.push(c2);
        this.connectors.push(p);
    },

    activate: function() {
        dojo.forEach(this.classes, function(c) {
           c.activate();
        });

        dojo.forEach(this.connectors, function(c) {
           c.activate();
        });

        this.inherited(arguments);
    },

    deactivate: function() {
        this.inherited(arguments);

        dojo.forEach(this.classes, function(c) {
           c.deactivate();
        });

        dojo.forEach(this.connectors, function(c) {
           c.deactivate();
        });
    }


});
