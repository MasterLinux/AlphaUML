/**
 * User: Christoph Grundmann
 * Date: 14.07.11
 * Time: 15:05
 *
 */
dojo.provide("ui.dialog.AddProvidedInterface");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddProvidedInterface", ui.Dialog, {
    interfacesPreviewId: null,
    subclassPreviewId: null,
    connector: null,
    diagram: null,

    interfacesCntId: null,
    interfacesId: null,
    interfaces: null,

    subclassCntId: null,
    subclassId: null,
    subclass: null,

    //selected classes
    _super: null,
    _sub: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   diagram: ui.content.ClassDiagram
     *   connector: ui.classDiagram.Connector
     *   interfaces: ui.classDiagram.Class
     *   subclass: ui.classDiagram.Class
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.diagram = args.diagram;
        this._super = args.interfaces;
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
        this.interfacesPreviewId = this.htmlId + "InterfacePreview";
        this.subclassPreviewId = this.htmlId + "SubclassPreview";
        this.addTablePreview(
            '<div class="row">' +
                '<div class="class" id="' + this.interfacesPreviewId + '"></div>' +
                '<div class="generalization"></div>' +
                '<div class="line dashed"></div>' +
                '<div class="class" id="' + this.subclassPreviewId + '"></div>' +
            '</div>'
        );

        //add rows
        this.interfacesRow();
        this.spacerRow();
        this.subclassRow();
    },

    onApprove: function() {
        //get classes
        var interfaces = this.getClass(this.interfaces.getValue());
        var subclass = this.getClass(this.subclass.getValue());

        //destroys existing connector
        if(this.connector) this.connector.destroy(true);

        //initialize connector
        var connector = new ui.classDiagram.Generalization({
            isInterface: true,
            diagram: this.diagram,
            placeAt: this.diagram.areaId
        });

        //place connector
        connector.create();

        //register classes
        connector.registerClass(
            interfaces, "p0",
            subclass, "p1"
        );

        //store connector
        this.diagram.connectors.push(connector);
    },

    /**
     * destroys dialog
     * @param del
     */
    destroy: function(del) {
        this.interfaces.destroy(true);
        this.subclass.destroy(true);
        this.inherited(arguments);
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

    interfacesRow: function() {
        //create unique identifier
        this.interfacesCntId = this.htmlId + "InterfaceContent";
        this.interfacesId = this.htmlId + "Interface";

        //add new table row
        this.addTableRow({id: this.interfacesId});

        //add content into row
        this.addContent("Interface", '<span id="' + this.interfacesCntId + '"></span>', this.interfacesId);

        //create modifier input field
        this.interfaces = new ui.TextInput({
            placeAt: this.interfacesCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.interfaces.clearOptions();
                //get each possible class
                var classes = this.getInterfaces();
                //generate new class list
                this.interfaces.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.interfaces.create();

        //clear old options
        this.interfaces.clearOptions();
        //get each possible class
        var classes = this.getInterfaces();
        //generate new class list
        this.interfaces.addOptions(classes);

        //set pre-configured class
        if(this.connector) {
            this.interfaces.setValue(this.connector.p0Class.name);
        } else if(this._super) {
            this.interfaces.setValue(this._super.name);
        }
    },

    spacerRow: function() {
        //create unique identifier
        this.spacerId = this.htmlId + "Spacer";

        //add new table row
        this.addTableRow({id: this.spacerId});

        //add content into row
        this.addContent("&nbsp;", '<div style="width: 150px; height: 5px;">&nbsp;</div>', this.spacerId);
    },

    subclassRow: function() {
        //create unique identifier
        this.subclassCntId = this.htmlId + "SubclassContent";
        this.subclassId = this.htmlId + "Subclass";

        //add new table row
        this.addTableRow({id: this.subclassId});

        //add content into row
        this.addContent("Class", '<span id="' + this.subclassCntId + '"></span>', this.subclassId);

        //create modifier input field
        this.subclass = new ui.TextInput({
            placeAt: this.subclassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.subclass.clearOptions();
                //get each possible class
                var classes = this.getClasses();
                //generate new class list
                this.subclass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.subclass.create();

        //clear old options
        this.subclass.clearOptions();
        //get each possible class
        var classes = this.getClasses();
        //generate new class list
        this.subclass.addOptions(classes);

        //set pre-configured class
        if(this.connector) {
            this.subclass.setValue(this.connector.p3Class.name);
        } else if(this._sub) {
            this.subclass.setValue(this._sub.name);
        }
    },

    /**
     * renders the preview
     */
    renderPreview: function() {
        var interfaces = dojo.byId(this.interfacesPreviewId);
        var subclass = dojo.byId(this.subclassPreviewId);

        interfaces.innerHTML = (this.interfaces && this.interfaces.value != "") ? this.interfaces.value : "interface";
        subclass.innerHTML = (this.subclass && this.subclass.value != "") ? this.subclass.value : "class";
    }
});
