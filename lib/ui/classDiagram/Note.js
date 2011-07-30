/**
 * User: Christoph Grundmann
 * Date: 28.07.11
 * Time: 13:22
 *
 */
dojo.provide("ui.classDiagram.Note");
dojo.require("ui.Language");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.Note", ui.Object, {
    connectors: null,
    language: null,
    comment: null,
    dnd: null,

    //ids
    textAreaId: null,
    dragIconId: null,

    constructor: function(args) {
        args = args || {};
        this.x = args.x;
        this.y = args.y;
        this.comment = args.comment;
        this.language = new ui.Language();
    },

    create: function() {
        this.inherited(arguments);

        //create ids
        this.textAreaId = this.htmlId + "TextArea";
        this.dragIconId = this.htmlId + "DragIcon";

        dojo.place(
            '<div class="Note" id="' + this.htmlId + '">' +
                '<div class="header">' +
                    '<div class="icon drag" id="' + this.dragIconId + '"></div>' +
                    '<div class="title">' + this.language.NOTE_TITLE + '</div>' +
                '</div>' +
                '<textarea class="comment" id="' + this.textAreaId + '"></textarea>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //setup note
        this.setComment(this.comment);
        this.setPosition(this.x, this.y);

        //make note draggable
        this.dnd = new dojo.dnd.Moveable(this.htmlId, {
            handle: this.dragIconId
        });

        this.connect({
            event: "onmousedown",
            nodeId: this.htmlId,
            method: function(event) {
                if(event.target.id !== this.textAreaId) {
                    //event.target.blur(); TODO find a solution for deselecting the textarea http://de.selfhtml.org/javascript/objekte/htmlelemente.htm#textarea
                    dojo.stopEvent(event);
                }
            }
        });

        this.connect({
            event: "onclick",
            nodeId: this.textAreaId,
            method: function(event) {
                //event.target.select();
                console.debug(event);
            }
        });
    },

    /**
     * destroys note
     * @param del boolean
     */
    destroy: function(del) {
        if(this.dnd) this.dnd.destroy();
    },

    /**
     * sets a new comment
     * @param comment
     */
    setComment: function(comment) {
        this.comment = comment || "";
        var textArea = dojo.byId(this.textAreaId);
        textArea.innerHTML = this.comment;
    },

    /**
     * registers a connector
     * @param ui.classDiagram.Connector
     */
    registerConnector: function(connector) {
        if(!this.connectors) this.connectors = {};
        this.connectors[connector.htmlId] = connector;
    }
});