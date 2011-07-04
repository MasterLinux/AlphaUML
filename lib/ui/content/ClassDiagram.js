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
dojo.require("ui.Language");
dojo.require("ui.MouseInfo");

dojo.declare("ui.content.ClassDiagram", ui.content.Scrollable, {
    classes: null,
    connectors: null,
    mouseInfo: null,
    language: null,

    constructor: function(args){
        args = args || {};
        this.classes = [];
        this.connectors = [];
        this.language = new ui.Language();
    },

    create: function() {
        this.inherited(arguments);
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
    },

    /**
     * activates the routine for
     * adding a new class into the
     * diagram. a mouse info will
     * show and after a click at
     * the working area the class
     * will be drawn
     */
    addClass: function() {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //create new mouse info
        this.mouseInfo = new ui.MouseInfo({
            title: this.language.DIAGRAM_ADD_CLASS,
            icon: "class",
            onClickArea: this.areaId,
            onClick: dojo.hitch(this, function(event) {
                //add new class into the workspace area of this content
                if(this.areaId == event.target.id) {
                    //init class
                    var _class = new ui.classDiagram.Class({
                        placeAt: this.areaId,
                        name: "NewClass",
                        x: event.offsetX,
                        y: event.offsetY
                    });

                    //place new class
                    _class.create();

                    //store class
                    this.classes.push(_class);

                    //destroy mouse info
                    this.mouseInfo.destroy(true);
                    this.mouseInfo = null;
                }
            })
        });

        //place mouse info
        this.mouseInfo.create();
    },

    /**
     * enables the "add generalization" tool
     */
    addGeneralization: function() {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //create new mouse info
        this.mouseInfo = new ui.MouseInfo({
            title: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            icon: "generalization",
            onClickUiType: "class",
            onClick: dojo.hitch(this, function(event, uiObject) {
                //set superclass
                var superclass = uiObject;

                //destroy mouse info
                this.mouseInfo.destroy();
                this.mouseInfo = null;

                //create mouse info for the subclass
                this.mouseInfo = new ui.MouseInfo({
                    title: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
                    icon: "generalization",
                    onClickUiType: "class",
                    onClick: dojo.hitch(this, function(event, uiObject) {
                        //set subclass
                        var subclass = uiObject;

                        //TODO change Connector to Generalization
                        //initialize generalization
                        var generalization = new ui.classDiagram.Connector({
                            placeAt: this.areaId
                        });

                        //place generalization
                        generalization.create();

                        //register classes
                        generalization.registerClass(superclass, "p0", subclass, "p1");

                        //store generalization
                        this.connectors.push(generalization);

                        //destroy mouse info
                        this.mouseInfo.destroy();
                        this.mouseInfo = null;
                    })
                });

                //place mouse info
                this.mouseInfo.create();
            })
        });

        //place mouse info
        this.mouseInfo.create();
    }
});
