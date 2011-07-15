/**
 * User: Christoph Grundmann
 * Date: 14.07.11
 * Time: 15:05
 *
 */
dojo.provide("ui.dialog.AddGeneralization");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddGeneralization", ui.Dialog, {
    superclassPreviewId: null,
    subclassPreviewId: null,
    connector: null,
    diagram: null,

    superclassCntId: null,
    superclassId: null,
    superclass: null,

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
                '<div class="generalization"></div>' +
                '<div class="line"></div>' +
                '<div class="class" id="' + this.subclassPreviewId + '"></div>' +
            '</div>'
        );

        //add rows
        this.superclassRow();
        this.spacerRow();
        this.subclassRow();
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
     * destroys dialog
     * @param del
     */
    destroy: function(del) {
        this.superclass.destroy(true);
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

    superclassRow: function() {
        //create unique identifier
        this.superclassCntId = this.htmlId + "SuperclassContent";
        this.superclassId = this.htmlId + "Superclass";

        //add new table row
        this.addTableRow({id: this.superclassId});

        //add content into row
        this.addContent("Superclass", '<span id="' + this.superclassCntId + '"></span>', this.superclassId);

        //create modifier input field
        this.superclass = new ui.TextInput({
            placeAt: this.superclassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.superclass.clearOptions();
                //get each possible class
                var classes = this.getClasses(this.subclass.value);
                //generate new class list
                this.superclass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.superclass.create();

        //set pre-configured class
        if(this.connector) {
            this.superclass.setValue(this.connector.p0Class.name);
        } else if(this._super) {
            this.superclass.setValue(this._super.name);
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
        this.addContent("Subclass", '<span id="' + this.subclassCntId + '"></span>', this.subclassId);

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
                var classes = this.getClasses(this.superclass.value);
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
        var superclass = dojo.byId(this.superclassPreviewId);
        var subclass = dojo.byId(this.subclassPreviewId);

        superclass.innerHTML = (this.superclass && this.superclass.value != "") ? this.superclass.value : "superclass";
        subclass.innerHTML = (this.subclass && this.subclass.value != "") ? this.subclass.value : "subclass";
    }
});
