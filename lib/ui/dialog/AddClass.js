/**
 * User: Christoph Grundmann
 * Date: 12.07.11
 * Time: 19:08
 *
 */
dojo.provide("ui.dialog.AddClass");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");
dojo.require("ui.Defaults");
dojo.require("ui.classDiagram.Class");
dojo.require("ui.MouseInfo");
dojo.require("ui.Language");

dojo.declare("ui.dialog.AddClass", ui.Dialog, {
    classX: null,
    classY: null,
    language: null,
    mouseInfo: null,
    diagram: null,
    editableClass: null,
    defaults: null,

    //visibility vars
    visibilityCntId: null,
    visibilityId: null,
    visibility: null,

    modifierCntId: null,
    modifierId: null,
    modifier: null,

    instanceCntId: null,
    instanceId: null,
    instance: null,

    nameCntId: null,
    nameId: null,
    name: null,

    /**
     * editableClass: ui.classDiagram.Class
     * diagram: ui.content.ClassDiagram
     * classX: integer
     * classY: integer
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.editableClass = args.editableClass;
        this.diagram = args.diagram;
        this.defaults = new ui.Defaults();
        this.language = new ui.Language();
        this.classX = args.classX;
        this.classY = args.classY;
    },

    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //add rows
        this.visibilityRow();
        this.modifierRow();
        this.instanceRow();
        this.nameRow();
    },

    /**
     * destroys dialog
     * @param del
     */
    destroy: function(del) {
        this.name.destroy(true);
        this.instance.destroy(true);
        this.modifier.destroy(true);
        this.visibility.destroy(true);
        this.inherited(arguments);
    },

    /**
     * creates a new class if
     * the user approves the input
     * or updates the class
     * @param event mouse event
     */
    onApprove: function(event) {
        //update class properties
        if(this.editableClass) {
            this.editableClass.visibility = this.visibility.getValue();
            this.editableClass.visibility
        }

        //create a new class
        else {
            //init class
            var _class = new ui.classDiagram.Class({
                placeAt: this.diagram.areaId,
                name: this.name.value,
                x: this.classX, //TODO
                y: this.classY
            });

            //set stereotype
            if(this.instance.value == "enum") {
                _class.setStereotype("enumeration");
            } else if(this.instance.value == "interface") {
                _class.setStereotype("interface");
            } else {
                _class.setStereotype();
            }

            //set abstract
            if(this.modifier.value == "abstract") {
                _class.setAbstract(true);
                _class.modifier = this.modifier.value;
            } else {
                _class.setAbstract(false);
                _class.modifier = this.modifier.value;
            }

            //set visibility
            _class.visibility = this.visibility.value;

            //place new class
            _class.create();

            //select class
            _class.select(true);

            //store class
            this.diagram.classes.push(_class);
        }
    },

    /**
     * creates visibility row
     */
    visibilityRow: function() {
        //create unique identifier
        this.visibilityCntId = this.htmlId + "VisibilityContent";
        this.visibilityId = this.htmlId + "Visibility";

        //add new table row
        this.addTableRow({id: this.visibilityId});

        //add content into row
        this.addContent("Visibility", '<span id="' + this.visibilityCntId + '"></span>', this.visibilityId);

        //create visibility input field
        this.visibility = new ui.TextInput({
            placeAt: this.visibilityCntId,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "public",
                    value: "public"
                },
                {
                    title: "protected",
                    value: "protected"
                },
                {
                    title: "private",
                    value: "private"
                }
            ]
        });

        this.visibility.create();

        //get configured value
        if(this.editableClass) {
            this.visibility.setValue(this.editableClass.visibility);
        }
    },

    /**
     * creates modifier row
     */
    modifierRow: function() {
        //create unique identifier
        this.modifierCntId = this.htmlId + "ModifierContent";
        this.modifierId = this.htmlId + "Modifier";

        //add new table row
        this.addTableRow({id: this.modifierId});

        //add content into row
        this.addContent("Modifier", '<span id="' + this.modifierCntId + '"></span>', this.modifierId);

        //create modifier input field
        this.modifier = new ui.TextInput({
            placeAt: this.modifierCntId,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "static",
                    value: "static"
                },
                {
                    title: "abstract",
                    value: "abstract"
                },
                {
                    title: "final",
                    value: "final"
                }
            ]
        });

        this.modifier.create();

        //get configured value
        if(this.editableClass) {
            this.modifier.setValue(this.editableClass.modifier);
        }
    },

    /**
     * creates instance type row
     */
    instanceRow: function() {
        //create unique identifier
        this.instanceCntId = this.htmlId + "InstanceContent";
        this.instanceId = this.htmlId + "Instance";

        //add new table row
        this.addTableRow({id: this.instanceId});

        //add content into row
        this.addContent("&nbsp;", '<span id="' + this.instanceCntId + '"></span>', this.instanceId);

        //create instance input field
        this.instance = new ui.TextInput({
            placeAt: this.instanceCntId,
            value: "class",
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "class";
                return value;
            },
            options: [
                {
                    title: "class",
                    value: "class"
                },
                {
                    title: "interface",
                    value: "interface"
                },
                {
                    title: "enum",
                    value: "enum"
                }
            ]
        });

        this.instance.create();

        //get configured value
        if(this.editableClass) {
            var value = "class";
            if(this.editableClass.stereotype == "enumeration") {
                value = "enum";
            } else if(this.editableClass.stereotype == "interface") {
                value = "interface";
            }
            this.instance.setValue(value);
        }
    },

    /**
     * creates name row
     */
    nameRow: function() {
        //create unique identifier
        this.nameCntId = this.htmlId + "NameContent";
        this.nameId = this.htmlId + "Name";

        //add new table row
        this.addTableRow({id: this.nameId});

        //add content into row
        this.addContent("Name", '<span id="' + this.nameCntId + '"></span>', this.nameId);

        //create name input field
        this.name = new ui.TextInput({
            placeAt: this.nameCntId,
            dynamicSize: true,
            minSize: 5,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableClass) {
            this.instance.setValue(this.editableClass.name);
        }

        //select name input as default
        this.name.select();
    }
});