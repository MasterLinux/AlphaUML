/**
 * User: Christoph Grundmann
 * Date: 05.07.11
 * Time: 12:01
 *
 */
dojo.provide("ui.dialog.AddParameter");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddParameter", ui.Dialog, {
    editableParameter: null,
    parentOperation: null,

    name: null,
    nameId: null,
    nameCntId: null,

    modifier: null,
    modifierId: null,
    modifierCntId: null,

    dataType: null,
    dataTypeId: null,
    dataTypeCntId: null,

    multiplicity: null,
    multiplicityId: null,
    multiplicityCntId: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   editableParameter:
     *   parentOperation:
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.editableParameter = args.editableParameter;
        this.parentOperation = args.parentOperation;
    },

    /**
     * creats dialog
     */
    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //add preview
        this.javaPreviewId = this.htmlId + "JavaPreview";
        this.umlPreviewId = this.htmlId + "UMLPreview";
        this.addTablePreview(
            '<div class="row" id="' + this.umlPreviewId + '"></div>' +
            '<div class="row" id="' + this.javaPreviewId + '"></div>'
        );

        //add rows
        this.modifierRow();
        this.dataTypeRow();
        this.multiplicityRow();
        this.nameRow();

        //set preview position
        dojo.publish("PreviewUpdate");
    },

    /**
     * destroys the dialog with
     * each content like text inputs
     * @param del
     */
    destroy: function(del) {
        if(this.modifier) this.modifier.destroy(true);
        if(this.name) this.name.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);

        this.inherited(arguments);
    },

    /**
     * creates a new parameter if
     * the user approves the input
     * or updates a given one
     * @param event mouse event
     */
    onApprove: function(event) {
        var modifier = this.modifier.getValue();
        var dataType = this.dataType.getValue();
        var multiplicity = this.multiplicity.getValue();
        var name = this.name.getValue();

        //is attribute final
        var _isFinal = modifier ? modifier.search(/final/g) : -1;
        var property = null;
        if(_isFinal !== -1) {
            //attribute is final
            property = "readOnly";
        }

        //edit parameter
        if(this.editableParameter) {
            this.editableParameter.setName(name);
            this.editableParameter.setDataType(dataType);
            this.editableParameter.setMultiplicity(multiplicity);
            this.editableParameter.setProperty(property);
            this.editableParameter.setModifier(modifier);
        }

        //otherwise create new parameter
        else {
            this.parentOperation.addParameter({
                name: name,
                dataType: dataType,
                multiplicity: multiplicity,
                property: property,
                modifier: modifier
            });
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
                    title: "final",
                    value: "final"
                }
            ]
        });

        this.modifier.create();

        //get configured value
        if(this.editableParameter) {
            //TODO implement modifier correct
            this.modifier.setValue(this.editableParameter.modifier);
        }
    },

    /**
     * creates data type row
     */
    dataTypeRow: function() {
        //create unique identifier
        this.dataTypeCntId = this.htmlId + "DataTypeContent";
        this.dataTypeId = this.htmlId + "DataType";

        //add new table row
        this.addTableRow({id: this.dataTypeId});

        //add content into row
        this.addContent("Data Type", '<span id="' + this.dataTypeCntId + '"></span>', this.dataTypeId);

        //create modifier input field
        this.dataType = new ui.TextInput({
            placeAt: this.dataTypeCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            warning: function(value) {
                //TODO if data type doesn't exists display warning
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "boolean",
                    value: "boolean"
                },
                {
                    title: "byte",
                    value: "byte"
                },
                {
                    title: "char",
                    value: "char"
                },
                {
                    title: "double",
                    value: "double"
                },
                {
                    title: "float",
                    value: "float"
                },
                {
                    title: "int",
                    value: "int"
                },
                {
                    title: "long",
                    value: "long"
                },
                {
                    title: "short",
                    value: "short"
                }
            ]
        });

        //TODO add names of existing classes as options

        this.dataType.create();

        //get configured value
        if(this.editableParameter) {
            //get value if exists
            var value = "";
            if(this.editableParameter.dataType)
                value = this.editableParameter.dataType.value;

            //set value
            this.dataType.setValue(value);
        }
    },

    /**
     * creates multiplicity row
     */
    multiplicityRow: function() {
        //create unique identifier
        this.multiplicityCntId = this.htmlId + "MultiplicityContent";
        this.multiplicityId = this.htmlId + "Multiplicity";

        //add new table row
        this.addTableRow({id: this.multiplicityId});

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.multiplicityCntId + '"></span>', this.multiplicityId);

        //create modifier input field
        this.multiplicity = new ui.TextInput({
            placeAt: this.multiplicityCntId,
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

        this.multiplicity.create();

        //get configured value
        if(this.editableParameter) {
            //get value if exists
            var value = "";
            if(this.editableParameter.multiplicity)
                value = this.editableParameter.multiplicity.value;

            //set value
            this.multiplicity.setValue(value);
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
            onChange: dojo.hitch(this, this.renderPreview),
            error: function(value) {
                //TODO allow error messages
                //if no data type is set display an error
                if(value === "") return true;
                else return false;
            },
            warning: function(value) {
                //TODO if data type doesn't exists display warning
            },
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "parameter";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableParameter) {
            //get value if exists
            var value = "";
            if(this.editableParameter.name)
                value = this.editableParameter.name.value;

            //set value
            this.name.setValue(value);
        }

        //select name input
        this.name.select();
    },

    /**
     * renders the preview
     */
    renderPreview: function() {
        var javaPreview = dojo.byId(this.javaPreviewId);
        var umlPreview = dojo.byId(this.umlPreviewId);

        var modifier = this.modifier ? this.modifier.getValue() : null;
        var dataType = this.dataType ? this.dataType.getValue() : null;
        var multiplicity = this.multiplicity ? this.multiplicity.getValue() : null;
        var name = this.name ? this.name.getValue() : null;

        var uml =
            '<span class="title">UML Notation: </span>' +
            '<span class="sample">' +
            name +
            (dataType ? " : " + dataType : "") +
            (multiplicity ? " [" + multiplicity.replace(/\[/g, "").replace(/\]/g, "") + "] " : "") +
            (dojo.hitch(this, function(){
                //get property
                var _isFinal = modifier ? modifier.search(/final/g) : -1;
                if(_isFinal !== -1) return " {readOnly}";
                else return "";
            }))() +
            '</span>';

        //set uml preview
        umlPreview.innerHTML = uml;

        var java =
            '<span class="title">Java Notation: </span>' +
            '<span class="sample">' +
            (modifier ? modifier + " " : "") +
            (dataType ? dataType : "") +
            (multiplicity && multiplicity.search(/[(\.\.)\*]/g) !== -1  ? "[ ] " : " ") +
            name +
            '</span>';

        //set java preview
        javaPreview.innerHTML = java;

        //update preview position
        dojo.publish("PreviewUpdate");
    }
});
