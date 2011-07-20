/**
 * User: Christoph Grundmann
 * Date: 13.07.11
 * Time: 23:04
 *
 */
dojo.provide("ui.List");
dojo.require("ui.Object");

dojo.declare("ui.List", ui.Object, {
    onAdd: null,
    entries: null,
    addBtnId: null,
    bodyId: null,
    extendable: null,

    /**
     * initializes a new list
     * args: {
     *   placeAt: string
     *   entries: array of ui.ListEntry,
     *   onAdd: function
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.entries = args.entries || [];
        this.onAdd = args.onAdd;
        this.extendable = typeof args.extendable == "boolean" ? args.extendable : true;
    },

    /**
     * creates and places a list
     */
    create: function() {
        this.inherited(arguments);

        //create ids
        this.addBtnId = this.htmlId + "AddButton";
        this.bodyId = this.htmlId + "Body";

        dojo.place(
            '<div class="List" id="' + this.htmlId + '">' +
                '<div class="button" style="display: none;" id="' + this.addBtnId + '"></div>' +
                '<div class="body" id="' + this.bodyId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        if(this.extendable) {
            var node = dojo.byId(this.addBtnId);
            dojo.style(node, "display", "");

            this.connect({
                name: "AddButton",
                event: "onclick",
                nodeId: this.addBtnId,
                method: function(event) {
                    if(this.onAdd) this.onAdd(event);
                }
            });
        }
    },

    /**
     * adds a new list entry
     * entry: {
     *   title: string,
     *   onEdit: function,
     *   removable: boolean,
     *   selectable: boolean,
     *   data: object
     * }
     * @param entry
     */
    addEntry: function(entry) {
        //create new entry
        var entry = new ui.ListEntry({
            placeAt: this.bodyId,
            title: entry.title,
            onEdit: entry.onEdit,
            removable: entry.removable,
            selectable: entry.selectable,
            data: entry.data
        });

        this.subscribe({
            event: entry.REMOVE_EVENT,
            method: function(id) {
                //remove entry from list
                this.removeEntry(id);
            }
        });

        //store entry
        this.entries.push(entry);
    },

    /**
     * removes a entry
     * @param htmlId id of the ui.ListEntry that has to removed
     */
    removeEntry: function(htmlId) {
        var _entry, arr = [];
        dojo.forEach(this.entries, dojo.hitch(this, function(entry) {
            if(entry.htmlId != htmlId) arr.push(entry);
            else _entry = entry;
        }));
        //set new created list
        this.entries = arr;
        //destroy founded entry
        _entry.destroy(true);
    }
});

dojo.declare("ui.ListEntry", ui.Object, {
    REMOVE_EVENT: null,
    onEdit: null,
    editable: null,
    removable: null,
    selectable: null,
    isSelected: null,
    title: null,
    selectedIconId: null,
    removeBtnId: null,
    editBtnId: null,
    titleId: null,
    data: null,

    /**
     * initializes a new list entry
     * args: {
     *  placeAt: string
     *  onEdit: function(){}
     *  removable: boolean
     *  selectable: boolean
     *  title: string
     *  data: storage of each necessary data
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.title = args.title;
        this.removable = args.removable;
        this.selectable = args.selectable;
        this.onEdit = args.onEdit;
        this.data = args.data;

        //set button editable
        if(this.onEdit) this.editable = true;

        this.create();
    },

    /**
     * creates and places a list entry
     */
    create: function() {
        this.inherited(arguments);

        //create event names
        this.REMOVE_EVENT = "_remove_" + this.htmlId;

        //create ids
        this.selectedIconId = this.htmlId + "SelectedIcon";
        this.removeBtnId = this.htmlId + "RemoveButton";
        this.editBtnId = this.htmlId + "EditButton";
        this.titleId = this.htmlId + "Title";

        //place entry
        dojo.place(
            '<div class="entry" id="' + this.htmlId + '">' +
                '<div class="select" style="display: none;" id="' + this.selectedIconId + '"></div>' +
                '<div class="title" id="' + this.titleId + '"></div>' +
                '<div class="remove" style="display: none;" id="' + this.removeBtnId + '"></div>' +
                '<div class="edit" style="display: none;" id="' + this.editBtnId + '"></div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //setup entry
        this.setTitle(this.title);

        //make entry selectable
        if(this.selectable) {
            var icon = dojo.byId(this.selectedIconId);
            dojo.style(icon, "display", "");

            this.connect({
                name: "SelectEntry",
                nodeId: this.htmlId,
                event: "onclick",
                method: function() {
                    var entry = dojo.byId(this.htmlId);
                    var icon = dojo.byId(this.selectedIconId);

                    //deselect entry
                    if(this.isSelected) {
                        dojo.removeClass(icon, "selected");
                        dojo.removeClass(entry, "selected");
                        this.isSelected = false;
                    }

                    //select entry
                    else {
                        dojo.addClass(icon, "selected");
                        dojo.addClass(entry, "selected");
                        this.isSelected = true;
                    }
                }
            });
        }

        //set edit button
        if(this.editable) {
            var node = dojo.byId(this.editBtnId);
            dojo.style(node, "display", "");
            //set onClick event listener
            this.connect({
                name: "EditButton",
                event: "onclick",
                nodeId: this.editBtnId,
                method: function(event) {
                    if(this.onEdit) this.onEdit(event, this);
                }
            });
        }

        //set remove button
        if(this.removable) {
            var node = dojo.byId(this.removeBtnId);
            dojo.style(node, "display", "");
            //set onClick event listener
            this.connect({
                name: "RemoveButton",
                event: "onclick",
                nodeId: this.removeBtnId,
                method: function(event) {
                    this.remove();
                }
            });
        }
    },

    /**
     * removes entry from list
     */
    remove: function() {
        dojo.publish(this.REMOVE_EVENT, [this.htmlId]);
    },

    /**
     * sets the title
     * @param title string
     */
    setTitle: function(title) {
        this.title = title || this.title;
        var node = dojo.byId(this.titleId);
        node.innerHTML = title;
    }
});

