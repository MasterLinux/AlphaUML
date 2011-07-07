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
dojo.require("lib.JavaGenerator");

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
     * starts a specific connector tool
     * properties: {
     *   startIcon: string mouse info icon
     *   startTitle: string mouse info title
     *   endIcon: string mouse info icon
     *   endTitle: string mouse info title
     *   type: string connector type
     *   direction: string "p0", "p1" or "both"
     * }
     * @param properties
     */
    addConnector: function(properties) {
        //if another tool process is running destroy it
        if(this.mouseInfo) this.mouseInfo.destroy(true);

        //create new mouse info
        this.mouseInfo = new ui.MouseInfo({
            title: properties.startTitle,
            icon: properties.startIcon,
            onClickUiType: "class",
            onClick: dojo.hitch(this, function(event, uiObject) {
                //set superclass
                var superclass = uiObject;

                //destroy mouse info
                this.mouseInfo.destroy();
                this.mouseInfo = null;

                //create mouse info for the subclass
                this.mouseInfo = new ui.MouseInfo({
                    title: properties.endTitle,
                    icon: properties.endIcon,
                    onClickUiType: "class",
                    onClick: dojo.hitch(this, function(event, uiObject) {
                        //set subclass
                        var subclass = uiObject;

                        //initialize connector
                        var connector = new ui.classDiagram.Connector({
                            placeAt: this.areaId,
                            type: properties.type,
                            direction: properties.direction
                        });

                        //place connector
                        connector.create();

                        //register classes
                        connector.registerClass(superclass, "p0", subclass, "p1");

                        //store connector
                        this.connectors.push(connector);

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
    },

    /**
     * enables the "add generalization" tool
     */
    addGeneralization: function() {
        this.addConnector({
            startIcon: "generalization",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "generalization",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Generalization"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addComposition: function() {
        this.addConnector({
            startIcon: "composition",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "composition",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Composition"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addAggregation: function() {
        this.addConnector({
            startIcon: "aggregation",
            startTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUPER,
            endIcon: "aggregation",
            endTitle: this.language.DIAGRAM_ADD_GENERALIZATION_SUB,
            type: "Aggregation"
        });
    },

    /**
     * enables the "add generalization" tool
     */
    addAssociation: function() {
        this.addConnector({
            startIcon: "association",
            startTitle: this.language.DIAGRAM_ADD_ASSOCIATION_FIRST,
            endIcon: "association",
            endTitle: this.language.DIAGRAM_ADD_ASSOCIATION_SECOND
            //type: "Association"
        });
    },

    generateJavaCode: function() {
        var gen = new lib.JavaGenerator({
            connectors: this.connectors,
            classes: this.classes
        });

        gen.generator(gen.analyzer());
    }
});
