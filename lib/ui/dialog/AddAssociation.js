/**
 * User: Christoph Grundmann
 * Date: 15.07.11
 * Time: 00:53
 *
 */
dojo.provide("ui.dialog.AddAssociation");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddAssociation", ui.Dialog, {
    connector: null,
    diagram: null,

    leftClassCntId: null,
    leftClassId: null,
    leftClass: null,

    leftClassPropertiesId: null,
    leftRoleVisibilityCntId: null,
    leftRoleVisibility: null,
    leftMultiplicityCntId: null,
    leftMultiplicity: null,
    leftRoleCntId: null,
    leftRole: null,

    leftDirCheckboxId: null,
    leftDirectionId: null,

    associationNameCntId: null,
    associationNameId: null,
    associationName: null,

    rightDirCheckboxId: null,
    rightDirectionId: null,

    rightClassPropertiesId: null,
    rightRoleVisibilityCntId: null,
    rightRoleVisibility: null,
    rightMultiplicityCntId: null,
    rightMultiplicity: null,
    rightRoleCntId: null,
    rightRole: null,

    rightClassCntId: null,
    rightClassId: null,
    rightClass: null,

    //selected classes
    _super: null,
    _sub: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   diagram: ui.content.ClassDiagram
     *   connector: ui.classDiagram.Connector
     *   superclass: ui.classDiagram.Class
     *   subclass: ui.classDiagram.Class
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.diagram = args.diagram;
        this._super = args.superclass;
        this._sub = args.subclass;
        this.connector = args.connector;
    },

    /**
     * creates dialog
     */
    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //add preview
        this.superclassPreviewId = this.htmlId + "SuperclassPreview";
        this.subclassPreviewId = this.htmlId + "SubclassPreview";
        this.addTablePreview(
            '<div class="row">' +
                '<div class="class" id="' + this.superclassPreviewId + '"></div>' +
                '<div class="association west"></div>' +
                '<div class="line"></div>' +
                '<div class="association east"></div>' +
                '<div class="class" id="' + this.subclassPreviewId + '"></div>' +
            '</div>'
        );

        //add rows
        this.leftClassRow();
        this.leftClassPropertiesRow();
        this.leftDirectionRow();
        this.associationNameRow();
        this.rightDirectionRow();
        this.rightClassPropertiesRow();
        this.rightClassRow();
    },

    onApprove: function() {
        //get classes
        var superclass = this.getClass(this.superclass.getValue());
        var subclass = this.getClass(this.subclass.getValue());

        //destroys existing connector
        if(this.connector) this.connector.destroy(true);

        //initialize connector
        var connector = new ui.classDiagram.Generalization({
            diagram: this.diagram,
            placeAt: this.diagram.areaId
        });

        //place connector
        connector.create();

        //register classes
        connector.registerClass(
            superclass, "p0",
            subclass, "p1"
        );

        //store connector
        this.diagram.connectors.push(connector);
    },

    /**
     * gets a specific class
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
     * gets a list of classes
     * @param exclude class names
     * @param onClick function
     */
    getClasses: function(exclude, onClick) {
        var options = [];
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name != exclude) {
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

    leftClassRow: function() {
        //create unique identifier
        this.leftClassCntId = this.htmlId + "LeftClassContent";
        this.leftClassId = this.htmlId + "LeftClass";

        //add new table row
        this.addTableRow({id: this.leftClassId});

        //add content into row
        this.addContent("Class", '<span id="' + this.leftClassCntId + '"></span>', this.leftClassId);

        //create modifier input field
        this.leftClass = new ui.TextInput({
            placeAt: this.leftClassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.leftClass.clearOptions();
                //get each possible class
                var classes = this.getClasses(this.rightClass.value);
                //generate new class list
                this.leftClass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.leftClass.create();

        /*
        //set pre-configured class
        if(this.connector) {
            this.leftClass.setValue(this.connector.p0Class.name);
        } else if(this._super) {
            this.leftClass.setValue(this._super.name);
        }*/
    },

    leftClassPropertiesRow: function() {
        //create unique identifier
        this.leftRoleVisibilityCntId = this.htmlId + "LeftRoleVisibilityContent";
        this.leftRoleCntId = this.htmlId + "LeftRoleContent";
        this.leftMultiplicityCntId = this.htmlId + "LeftMultiplicityContent";
        this.leftClassPropertiesId = this.htmlId + "LeftClassProperties";

        //add new table row
        this.addTableRow({id: this.leftClassPropertiesId});

        //add content into row
        this.addContent("Role Visibility", '<span id="' + this.leftRoleVisibilityCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftRoleVisibility = new ui.TextInput({
            placeAt: this.leftRoleVisibilityCntId,
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

        this.leftRoleVisibility.create();

        //add content into row
        this.addContent("Role", '<span id="' + this.leftRoleCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftRole = new ui.TextInput({
            placeAt: this.leftRoleCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.leftRole.create();

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.leftMultiplicityCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftMultiplicity = new ui.TextInput({
            placeAt: this.leftMultiplicityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                //remove special characters
                if(value) value = value.replace(/\[/g, "").replace(/\]/g, "");
                //return value
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "[1]",
                    value: "[1]"
                },
                {
                    title: "[0..*]",
                    value: "[0..*]"
                }
            ]
        });

        this.leftMultiplicity.create();
    },

    leftDirectionRow: function() {
        //create unique identifier
        this.leftDirectionId = this.htmlId + "LeftDirection";
        this.leftDirCheckboxId = this.htmlId + "LeftDirCheckbox";

        //add new table row
        this.addTableRow({id: this.leftDirectionId});

        //add content into row
        this.addContent(
            '<span style="font-family: serif;">&larr;</span>',
            '<span>' +
                '<input type="checkbox" id="' + this.leftDirCheckboxId + '">' +
            '</span>',
            this.leftDirectionId
        );
    },

    associationNameRow: function() {
        //create unique identifier
        this.associationNameCntId = this.htmlId + "AssociationNameContent";
        this.associationNameId = this.htmlId + "AssociationName";

        //add new table row
        this.addTableRow({id: this.associationNameId});

        //add content into row
        this.addContent("Name", '<span id="' + this.associationNameCntId + '"></span>', this.associationNameId);

        //create modifier input field
        this.associationName = new ui.TextInput({
            placeAt: this.associationNameCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.associationName.create();
    },

    rightDirectionRow: function() {
        //create unique identifier
        this.rightDirectionId = this.htmlId + "RightDirection";
        this.rightDirCheckboxId = this.htmlId + "RightDirCheckbox";

        //add new table row
        this.addTableRow({id: this.rightDirectionId});

        //add content into row
        this.addContent(
            '<span style="font-family: serif;">&rarr;</span>',
            '<span>' +
                '<input type="checkbox" id="' + this.rightDirCheckboxId + '">' +
            '</span>',
            this.rightDirectionId
        );
    },

    rightClassPropertiesRow: function() {
        //create unique identifier
        this.rightRoleVisibilityCntId = this.htmlId + "RightRoleVisibilityContent";
        this.rightRoleCntId = this.htmlId + "RightRoleContent";
        this.rightMultiplicityCntId = this.htmlId + "RightMultiplicityContent";
        this.rightClassPropertiesId = this.htmlId + "RightClassProperties";

        //add new table row
        this.addTableRow({id: this.rightClassPropertiesId});

        //add content into row
        this.addContent("Role Visibility", '<span id="' + this.rightRoleVisibilityCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightRoleVisibility = new ui.TextInput({
            placeAt: this.rightRoleVisibilityCntId,
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

        this.rightRoleVisibility.create();

        //add content into row
        this.addContent("Role", '<span id="' + this.rightRoleCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightRole = new ui.TextInput({
            placeAt: this.rightRoleCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.rightRole.create();

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.rightMultiplicityCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightMultiplicity = new ui.TextInput({
            placeAt: this.rightMultiplicityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                //remove special characters
                if(value) value = value.replace(/\[/g, "").replace(/\]/g, "");
                //return value
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "[1]",
                    value: "[1]"
                },
                {
                    title: "[0..*]",
                    value: "[0..*]"
                }
            ]
        });

        this.rightMultiplicity.create();
    },

    rightClassRow: function() {
        //create unique identifier
        this.rightClassCntId = this.htmlId + "RightClassContent";
        this.rightClassId = this.htmlId + "RightClass";

        //add new table row
        this.addTableRow({id: this.rightClassId});

        //add content into row
        this.addContent("Class", '<span id="' + this.rightClassCntId + '"></span>', this.rightClassId);

        //create modifier input field
        this.rightClass = new ui.TextInput({
            placeAt: this.rightClassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.rightClass.clearOptions();
                //get each possible class
                var classes = this.getClasses(this.leftClass.value);
                //generate new class list
                this.rightClass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.rightClass.create();

        /*
        //set pre-configured class
        if(this.connector) {
            this.rightClass.setValue(this.connector.p3Class.name);
        } else if(this._sub) {
            this.rightClass.setValue(this._sub.name);
        }*/
    },

    /**
     * renders the preview
     */
    renderPreview: function() {
        /*
        var superclass = dojo.byId(this.superclassPreviewId);
        var subclass = dojo.byId(this.subclassPreviewId);

        superclass.innerHTML = (this.superclass && this.superclass.value != "") ? this.superclass.value : "superclass";
        subclass.innerHTML = (this.subclass && this.subclass.value != "") ? this.subclass.value : "subclass"; */
    }
});