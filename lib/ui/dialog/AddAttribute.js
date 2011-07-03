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
    visibility: null,
    visibilityId: null,
    name: null,
    nameId: null,
    dataType: null,
    dataTypeId: null,
    multiplicity: null,
    multiplicityId: null,
    defaultValue: null,
    defaultValueId: null,
    property: null,
    propertyId: null,

    //init values
    visibilityValue: null,
    nameValue: null,
    dataTypeValue: null,
    multiplicityValue: null,
    defaultValueValue: null,
    propertyValue: null,


    /**
     * args: {
     *   placeAt: string parent id
     *   onExecute: function(properties) will be executed if the ok button will press
     *   visibility: string init value
     *   name: string init value
     *   dataType: string init value
     *   multiplicity: string init value
     *   defaultValue: string init value
     *   property: string init value
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.visibilityValue = args.visibility;
        this.nameValue = args.name;
        this.dataTypeValue = args.dataType;
        this.multiplicityValue = args.multiplicity;
        this.defaultValueValue = args.defaultValue;
        this.propertyValue = args.property;
        this.onExecute = args.onExecute;
    },

    /**
     * creats dialog
     */
    create: function() {
        this.inherited(arguments);

        //create content
        this.addVisibility(this.visibilityValue);
        this.addName(this.nameValue);
        this.addDataType(this.dataTypeValue);
        this.addMultiplicity(this.multiplicityValue);
        this.addDefaultValue(this.defaultValueValue);
        this.addProperty(this.propertyValue);
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
        if(this.property) this.property.destroy(true);

        this.inherited(arguments);
    },

    /**
     * creates a new operation if
     * the user approves the input
     * @param event mouse event
     */
    onApprove: function(event) {
        if(this.onExecute) this.onExecute({
            visibility: this.visibility.getValue(),
            name: this.name.getValue(),
            dataType: this.dataType.getValue(),
            multiplicity: undefined, //TODO implement parameter getValue
            defaultValue: this.defaultValue.getValue(),
            property: this.property.getValue()
        });
    },

    addVisibility: function(value) {
        this.visibilityId = this.htmlId + "Visibility";

        this.addContent(
            "Visibility",
            '<span id="' + this.visibilityId + '"></span>'
        );

        this.visibility = new ui.TextInput({
            placeAt: this.visibilityId,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
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
                },
                {
                    title: "package",
                    value: "package"
                }
            ]
        });

        this.visibility.create();
        if(value) this.visibility.setValue(value);
    },

    addName: function(value) {
        this.nameId = this.htmlId + "Name";

        this.addContent(
            "Attribute Name",
            '<span id="' + this.nameId + '"></span>'
        );

        this.name = new ui.TextInput({
            placeAt: this.nameId,
            value: "attribute",
            valueFilter: function(value) {
                if(value === "") value = "attribute"
                return value;
            },
            error: function(value) {
                //TODO allow error messages
                //if no name is set display an error
                if(value === "") return true;
                else return false;
            },
            warning: function(value) {
                //TODO if name already exists display warning
            }
        });

        this.name.create();
        if(value) this.name.setValue(value);
    },

    addDataType: function(value) {
        this.dataTypeId = this.htmlId + "ReturnType";

        this.addContent(
            "Data Type",
            '<span id="' + this.dataTypeId + '"></span>'
        );

        this.dataType = new ui.TextInput({
            placeAt: this.dataTypeId,
            valueFilter: function(value) {
                if(value !== "") {
                    //if the user have use a not allowed character remove it
                    value = value.replace(/:/g, "");
                } else {
                    //on empty string return null
                    value = null;
                }
                return value;
            },
            options: [
                {
                    title: ":void",
                    value: "void"
                },
                {
                    title: ":boolean",
                    value: "boolean"
                },
                {
                    title: ":string",
                    value: "string"
                },
                {
                    title: ":char",
                    value: "char"
                }
            ]
        });

        this.dataType.create();
        if(value) this.dataType.setValue(value);
    },

    addMultiplicity: function(value) {
        //TODO implement
    },

    addDefaultValue: function(value) {
        this.defaultValueId = this.htmlId + "DefaultValue";

        this.addContent(
            "Default Value",
            '<span id="' + this.defaultValueId + '"></span>'
        );

        this.defaultValue = new ui.TextInput({
            placeAt: this.defaultValueId,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.defaultValue.create();
        if(value) this.defaultValue.setValue(value);
    },

    addProperty: function(value) {
        this.propertyId = this.htmlId + "Property";

        this.addContent(
            "Property",
            '<span id="' + this.propertyId + '"></span>'
        );

        this.property = new ui.TextInput({
            placeAt: this.propertyId,
            valueFilter: function(value) {
                if(value !== "") {
                    //if the user have use a not allowed character remove it
                    value = value.replace(/{/g, "").replace(/}/g, "");
                } else {
                    //on empty string return null
                    value = null;
                }

                return value;
            },
            options: [
                {
                    title: "{readOnly}",
                    value: "readOnly"
                },
                {
                    title: "{union}",
                    value: "union"
                },
                {
                    title: "{ordered}",
                    value: "ordered"
                },
                {
                    title: "{bag}",
                    value: "bag"
                }
            ]
        });

        this.property.create();
        if(value) this.property.setValue(value);
    }
});
