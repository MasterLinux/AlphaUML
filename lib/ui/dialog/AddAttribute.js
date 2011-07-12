/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 16:21
 *
 */
dojo.provide("ui.dialog.AddAttribute");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddAttribute", ui.Dialog, {
    editableAttribute: null,
    parentClass: null,
    
    visibility: null,
    visibilityId: null,
    visibilityCntId: null,

    modifier: null,
    modifierId: null,
    modifierCntId: null,

    name: null,
    nameId: null,
    nameCntId: null,

    dataType: null,
    dataTypeId: null,
    dataTypeCntId: null,

    multiplicity: null,
    multiplicityId: null,
    multiplicityCntId: null,

    defaultValue: null,
    defaultValueId: null,
    defaultValueCntId: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   editableAttribute:
     *   parentClass:
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.editableAttribute = args.editableAttribute;
        this.parentClass = args.parentClass;
    },

    /**
     * creats dialog
     */
    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //add rows
        this.visibilityRow();
        this.modifierRow();
        this.dataTypeRow();
        this.multiplicityRow();
        this.nameRow();
        this.defaultValueRow();
    },

    /**
     * destroys the dialog with
     * each content like text inputs
     * @param del
     */
    destroy: function(del) {
        if(this.visibility) this.visibility.destroy(true);
        if(this.name) this.name.destroy(true);
        if(this.dataType) this.dataType.destroy(true);
        if(this.multiplicity) this.multiplicity.destroy(true);
        if(this.defaultValue) this.defaultValue.destroy(true);


        this.inherited(arguments);
    },

    /**
     * creates a new attribute if
     * the user approves the input
     * or updates a current one
     * @param event mouse event
     */
    onApprove: function(event) {
        //edit attribute
        if(this.editableAttribute) {

        }

        //create new attribute
        else {
            //get property
            var property;
            if(this.modifier.value == "final" || this.modifier.value == "final static") {
                property = "readOnly";
            }

            //add a new attribute
            this.parentClass.addAttribute({
                visibility: this.visibility.value,
                name: this.name.value,
                dataType: this.dataType.value,
                multiplicity: this.multiplicity.value,
                defaultValue: this.defaultValue.value,
                property: property,
                modifier: this.modifier.value
            });
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
        if(this.editableAttribute) {
            this.visibility.setValue(this.editableAttribute.visibility);
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
                    title: "final",
                    value: "final"
                },
                {
                    title: "final static",
                    value: "final static"
                }
            ]
        });

        this.modifier.create();

        //get configured value
        if(this.editableAttribute) {
            this.modifier.setValue(this.editableAttribute.modifier);
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
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            error: function(value) {
                //TODO allow error messages
                //if no data type is set display an error
                if(value === "") return true;
                else return false;
            },
            warning: function(value) {
                //TODO if data type doesn't exists display warning
            },
            options: [
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
        if(this.editableAttribute) {
            this.dataType.setValue(this.editableAttribute.modifier);
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
        if(this.editableAttribute) {
            this.multiplicity.setValue(this.editableAttribute.multiplicity);
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
                if(value === "") value = "";
                return value;
            }
        });

        this.name.create();

        //get configured value
        if(this.editableAttribute) {
            this.name.setValue(this.editableAttribute.name);
        }
    },

    /**
     * creates name row
     */
    defaultValueRow: function() {
        //create unique identifier
        this.defaultValueCntId = this.htmlId + "DefaultValueContent";
        this.defaultValueId = this.htmlId + "DefaultValue";

        //add new table row
        this.addTableRow({id: this.defaultValueId});

        //add content into row
        this.addContent("Default Value", '<span style="float: left;">=</span><span style="float: left;" id="' + this.defaultValueCntId + '"></span>', this.defaultValueId);

        //create name input field
        this.defaultValue = new ui.TextInput({
            placeAt: this.defaultValueCntId,
            dynamicSize: true,
            minSize: 5,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "";
                return value;
            }
        });

        this.defaultValue.create();

        //get configured value
        if(this.editableAttribute) {
            this.defaultValue.setValue(this.editableAttribute.name);
        }
    }
});
