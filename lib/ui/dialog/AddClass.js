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

    extendCntId: null,
    extendId: null,
    extend: null,

    interfacesCntId: null,
    interfacesId: null,
    interfaces: null,

    //preview ids
    previewStereotypeId: null,
    previewAbstractId: null,
    previewTitleId: null,
    javaPreviewId: null,

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

        //add preview
        this.previewStereotypeId = this.htmlId + "StereotypePreview";
        this.previewAbstractId = this.htmlId + "AbstractPreview";
        this.previewTitleId = this.htmlId + "TitlePreview";
        this.javaPreviewId = this.htmlId + "JavaPreview";
        this.addTablePreview(
            '<div class="row">' +
                '<span class="title">UML Notation:</span>' +
            '</div>' +
            '<div class="row">' +
                '<div class="umlClass">' +
                    '<div class="stereotype" style="display: none;" id="' + this.previewStereotypeId + '"></div>' +
                    '<div class="className" id="' + this.previewTitleId + '"></div>' +
                    '<div class="abstract" style="display: none;" id="' + this.previewAbstractId + '">{abstract}</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<span class="title">Java Notation:</span>' +
            '</div>' +
            '<div class="row" id="' + this.javaPreviewId + '"></div>'
        );

        //add rows
        this.visibilityRow();
        this.modifierRow();
        this.instanceRow();
        this.nameRow();
        this.extendRow();
        this.interfacesRow();
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
        this.extend.destroy(true);
        this.inherited(arguments);
    },

    /**
     * gets a specific class by name
     * @param name
     */
    getClass: function(name) {
        var _class = null;
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name == name) {
                _class = c;
            }
        }));

        return _class;
    },

    /**
     * gets a list of possible class names
     * @param exclude class name
     * @param onClick function
     */
    getClasses: function(exclude, onClick) {
        var options = [];
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name != exclude && c.stereotype != "interface") {
                options.push({
                    title: c.name,
                    value: c.name,
                    onClick: onClick,
                    storage: c
                });
            }
        }));

        return options;
    },

    /**
     * gets a list of possible interface names
     * @param exclude class name
     * @param onClick function
     */
    getInterfaces: function(exclude, onClick) {
        var options = [];
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name != exclude && c.stereotype == "interface") {
                options.push({
                    title: c.name,
                    value: c.name,
                    onClick: onClick,
                    storage: c
                });
            }
        }));

        return options;
    },

    /**
     * checks whether the class name
     * is already given and creates
     * a new one if necessary
     */
    getName: function() {
        var lockRenaming = this.editableClass && this.editableClass.name === this.name.getValue() ? true : false;

        //rename class if class name already used
        var count = 0, name = this.name.getValue();
        while(!lockRenaming && this.getClass(name)) {
            ++count;
            name = this.name.getValue() + "_" + count;
        }

        return name;
    },

    /**
     * creates a new class if
     * the user approves the input
     * or updates the class
     * @param event mouse event
     */
    onApprove: function(event) {
        var visibility = this.visibility.getValue();
        var stereoType = this.instance.getValue();
        var modifier = this.modifier.getValue();
        var name = this.getName();

        //get stereotype
        if(stereoType == "enum") {
            stereoType = "enumeration";
        } else if(stereoType == "interface") {
            stereoType = "interface";
        } else {
            stereoType = null;
        }

        //get abstract
        var isAbstract = false;
        if(modifier && modifier.search(/abstract/g) !== -1) {
            isAbstract = true;
        } else {
            isAbstract = false;
        }

        //update class properties
        if(this.editableClass) {
            this.editableClass.visibility = visibility;
            this.editableClass.setStereotype(stereoType);
            this.editableClass.setAbstract(isAbstract);
            this.editableClass.modifier = modifier;
            this.editableClass.setName(name);
        }

        //create a new class
        else {
            //init class
            var _class = new ui.classDiagram.Class({
                placeAt: this.diagram.areaId,
                diagram: this.diagram,
                name: name,
                x: this.classX,
                y: this.classY
            });

            //set properties
            _class.visibility = visibility;
            _class.setStereotype(stereoType);
            _class.setAbstract(isAbstract);
            _class.modifier = modifier;

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
            onChange: dojo.hitch(this, this.renderPreview),
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
            onChange: dojo.hitch(this, this.renderPreview),
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
            onChange: dojo.hitch(this, this.renderPreview),
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
            onChange: dojo.hitch(this, this.renderPreview),
            warning: dojo.hitch(this, function(value) {
                //show warning if class name already used
                if(this.getClass(value)) return true;
                else return false;
            }),
            minSize: 5,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "NewClass";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableClass) {
            this.name.setValue(this.editableClass.name);
        }

        //select name input as default
        this.name.select();
    },

    /**
     * creates extends row
     */
    extendRow: function() {
        //create unique identifier
        this.extendCntId = this.htmlId + "ExtendContent";
        this.extendId = this.htmlId + "Extend";

        //add new table row
        this.addTableRow({id: this.extendId});

        //add content into row
        this.addContent("Extends", '<span id="' + this.extendCntId + '"></span>', this.extendId);

        //create extend input field
        this.extend = new ui.TextInput({
            placeAt: this.extendCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.extend.clearOptions();
                //get each possible class
                var classes = this.getClasses();
                //generate new class list
                this.extend.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "" && value === undefined) value = null;
                return value;
            }
        });

        this.extend.create();

        //init options
        //clear old options
        this.extend.clearOptions();
        //get each possible class
        var classes = this.getClasses();
        //generate new class list
        this.extend.addOptions(classes);

        //get configured value
        if(this.editableClass && this.editableClass.extend) {
            this.extend.setValue(this.editableClass.extend);
        }
    },

    /**
     * creates extends row
     */
    interfacesRow: function() {
        //create unique identifier
        this.interfacesCntId = this.htmlId + "InterfacesContent";
        this.interfacesId = this.htmlId + "Interfaces";

        //add new table row
        this.addTableRow({id: this.interfacesId});

        //add content into row
        this.addContent("Implements", '<span id="' + this.interfacesCntId + '"></span>', this.interfacesId);

        //create extend input field
        this.interfaces = new ui.List({
            placeAt: this.interfacesCntId,
            extendable: false
        });

        this.interfaces.create();

        //add options
        var opts = this.getInterfaces();
        dojo.forEach(opts, dojo.hitch(this, function(option) {
            this.interfaces.addEntry({
                title: option.title,
                selectable: true
            });
        }));

        //get configured value
        if(this.editableClass) {
            //this.interfaces.setValue(this.editableClass.extend);
        }
    },

    renderPreview: function() {
        //get class information
        var name = this.name ? this.getName() : "";
        var stereotype = null;
        var instanceVal = this.instance ? this.instance.getValue() : null;
        if(instanceVal && instanceVal.search(/interface/g) !== -1) {
            stereotype = "&lt;&lt;interface&gt;&gt;";
        } else if(instanceVal && instanceVal.search(/enum/g) !== -1) {
            stereotype = "&lt;&lt;enumeration&gt;&gt;";
        }
        var modifierVal = this.modifier ? this.modifier.getValue() : null;
        var abstract = modifierVal && modifierVal.search(/abstract/g) !== -1 ? true : false;

        //update uml preview
        var classNameNode = dojo.byId(this.previewTitleId);
        classNameNode.innerHTML = name;
        var stereotypeNode = dojo.byId(this.previewStereotypeId);
        if(stereotype) {
            stereotypeNode.innerHTML = stereotype;
            dojo.style(stereotypeNode, "display", "");
        } else {
            //hide stereotype
            dojo.style(stereotypeNode, "display", "none");
            stereotypeNode.innerHTML = "";
        }
        var abstractNode = dojo.byId(this.previewAbstractId);
        if(abstract) dojo.style(abstractNode, "display", "");
        else dojo.style(abstractNode, "display", "none");

        //update java preview
        var javaPreview = dojo.byId(this.javaPreviewId);
        var java = this.visibility && this.visibility.getValue() ? this.visibility.getValue() + " " : "";
        java += modifierVal ? modifierVal + " " : "";
        java += instanceVal ? instanceVal + " " : "class ";
        java += name !== "" ? name + " " : "NewClass ";
        java += this.extend && this.extend.getValue() ? "extends " + this.extend.getValue() + " " : "";
        //TODO implement interfaces
        javaPreview.innerHTML = java;

        //update preview position
        dojo.publish("PreviewUpdate");
    }
});