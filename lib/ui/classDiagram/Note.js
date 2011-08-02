/**
 * User: Christoph Grundmann
 * Date: 28.07.11
 * Time: 13:22
 *
 */
dojo.provide("ui.classDiagram.Note");
dojo.require("ui.ContextMenu");
dojo.require("ui.Language");
dojo.require("ui.Object");

dojo.declare("ui.classDiagram.Note", ui.Object, {
    toolbarIsVisible: null,
    isSelected: null,
    connectors: null,
    language: null,
    comment: null,
    diagram: null,
    isNote: null,
    menu: null,
    dnd: null,

    //ids
    textAreaId: null,
    dragIconId: null,

    constructor: function(args) {
        args = args || {};
        this.x = args.x;
        this.y = args.y;
        this.diagram = args.diagram;
        this.comment = args.comment;
        this.language = new ui.Language();
        this.uiType = "class";
        this.isNote = true;
    },

    create: function() {
        this.inherited(arguments);

        //set class global
        this.setGlobal(this.uiType);

        //create ids
        this.textAreaId = this.htmlId + "TextArea";
        this.dragIconId = this.htmlId + "DragIcon";
        this.innerId = this.htmlId + "Inner";
        this.toolsId = this.htmlId + "Tools";
        this.nameId = this.htmlId + "Name";

        //create event names
        this.MOVE_EVENT = "_pos_" + this.htmlId;

        dojo.place(
            '<div class="Note" uitype="' + this.uiType + '" id="' + this.htmlId + '">' +
                '<div class="inner" id="' + this.innerId + '">' +
                    '<div class="toolbar" style="display: none;" id="' + this.toolsId + '">' +
                        '<div class="icon drag" id="' + this.dragIconId + '"></div>' +
                    '</div>' +
                    '<div class="title">' +
                        '<div class="name" id="' + this.nameId + '">' + this.language.NOTE_TITLE + '</div>' +
                    '</div>' +
                    '<div class="body">' +
                        '<textarea class="comment" cols="15" rows="5" id="' + this.textAreaId + '"></textarea>' +
                    '</div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //setup note
        this.setComment(this.comment);
        this.setPosition(this.x, this.y);

        //create note menu
        this.menu = new ui.ContextMenu({
            title: "Note",
            buttons: [
            {
                title: "Remove",
                onClick: dojo.hitch(this, function() {
                    this.destroy(true);
                })
            }
            ]
        });

        this.menu.create();
        this.menu.register([this.nameId]);

        //make note draggable
        this.dnd = new dojo.dnd.Moveable(this.htmlId, {
            handle: this.dragIconId
        });

        //select class on first move
        this.dnd.onFirstMove = dojo.hitch(this, function() {
            this.select(true);
        });

        //throw class specific move event
        this.dnd.onMoved = dojo.hitch(this, function(mover, leftTop) {
            this.x = leftTop.l;
            this.y = leftTop.t;
            dojo.publish(this.MOVE_EVENT);
        });

        //deselect if another class is selected
        this.subscribe({
            event: "ClassSelected",
            method: function(id) {
                if(this.htmlId != id) {
                    this.select(false);
                }
            }
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

        /*
        this.connect({
            event: "onclick",
            nodeId: this.textAreaId,
            method: function(event) {
                //event.target.select();
                console.debug(event);
            }
        });*/

        //select class
        this.connect({
            name: "Select",
            nodeId: this.htmlId,
            event: "onclick",
            method: function(event) {
                this.select(true);
            }
        });

        //deselect dialog
        this.connect({
            name: "DeselectClass",
            event: "onclick",
            body: true,
            method: function(event) {
                if(this.isSelected && !this.isUiType(event.target)) {
                    var textArea = dojo.byId(this.textAreaId);
                    if(textArea) textArea.blur();
                    this.select(false);
                }
            }
        });

        //show toolbar on hover
        this.connect({
            nodeId: this.htmlId,
            event: "onmouseover",
            method: function(event) {
                this.showToolbar();
            }
        });

        //hide toolbar on mouse out
        this.connect({
            nodeId: this.htmlId,
            event: "onmouseout",
            method: function(event) {
                if(!this.isSelected) {
                    this.hideToolbar();
                }
            }
        });
    },

    /**
     * destroys note
     * @param del boolean
     */
    destroy: function(del) {
        if(this.dnd) this.dnd.destroy();

        //destroy menu
        if(this.menu) this.menu.destroy(true);

        //destroy connectors
        if(this.connectors) for(var id in this.connectors) {
            this.connectors[id].destroy(true);
        } this.connectors = {};

        this.diagram.removeNote(this.htmlId);
        this.inherited(arguments);
    },

    /**
     * selects or deselects the note
     * @param select boolean if it is set to false class will be deactivated
     */
    select: function(select) {
        //get class node
        var node = dojo.byId(this.htmlId);

        //select class
        if(select) {
            this.isSelected = true;
            this.showToolbar();
            dojo.addClass(node, "selected");
            dojo.style(node, "zIndex", 100);
            dojo.publish("ClassSelected", [this.htmlId]);
        }

        //deselect class
        else {
            this.hideToolbar();
            dojo.removeClass(node, "selected");
            dojo.style(node, "zIndex", 99);
            this.isSelected = false;
        }
    },

    /**
     * shows the toolbar
     */
    showToolbar: function() {
        //TODO don't use a hard coded value like 29
        if(!this.toolbarIsVisible) {
            this.setPosition(this.x, this.y - 27);
            this.toolbarIsVisible = true;
        }

        //get toolbar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show toolbar
        if(toolBarNode) dojo.style(toolBarNode, "display", "");
        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
    },

    /**
     * hides the toolbar
     */
    hideToolbar: function() {
        //TODO don't use a hard coded value like 29
        if(this.toolbarIsVisible) {
            this.setPosition(this.x, this.y + 27);
            this.toolbarIsVisible = false;
        }

        //get tool bar node
        var toolBarNode = dojo.byId(this.toolsId);
        //show tool bar
        if(toolBarNode) dojo.style(toolBarNode, "display", "none");
        //update position of the connected point
        dojo.publish(this.MOVE_EVENT);
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
     * gets the comment
     */
    getComment: function() {
        var textArea = dojo.byId(this.textAreaId);
        if(textArea) {
            return textArea.value;
        } else {
            return "";
        }
    },

    /**
     * registers a connector
     * @param ui.classDiagram.Connector
     */
    registerConnector: function(connector) {
        if(!this.connectors) this.connectors = {};
        this.connectors[connector.htmlId] = connector;
    },

    /**
     * removes a specific connector by id
     * @param id string htmlId
     */
    removeConnector: function(id) {
        if(this.connectors && this.connectors[id]) {
            delete this.connectors[id];
        }
    },

    /**
     * gets the position range for the given point
     * and calculates a possible position for the point
     *
     * returns {
     *   side: "left",
     *   x: integer,
     *   y: integer,
     *   range: {
     *      x0: integer,
     *      y0: integer,
     *      x1: integer,
     *      y1: integer
     *   }
     * }
     *
     * @param point ui.classDiagram.connector.Point
     * @return object
     */
    getConnectRange: function(point) {
        //var size = dojo.position(this.htmlId, true);
        var node = dojo.byId(this.htmlId);
        var size = {
            x: dojo.style(node, "left"),
            y: dojo.style(node, "top"),
            w: dojo.style(node, "width"),
            h: dojo.style(node, "height")
        }
        var side = point.connectSide;
        var x0, y0, x1, y1;
        var x, y;

        if(side == "top") {
            //calculate position
            //TODO calculate offset as percentual value
            x = size.x + point.offset;
            y = size.y - dojo.style(point.htmlId, "height"); //dojo.position(point.htmlId, true).h;
        } else if(side == "right") {
            //calculate position
            x = size.x + size.w;
            y = size.y + point.offset;
        } else if(side == "bottom") {
            //calculate position
            x = size.x + point.offset;
            y = size.y + size.h;
        } else if(side == "left") {
            //calculate position
            x = size.x - dojo.style(point.htmlId, "width"); //dojo.position(point.htmlId, true).w;
            y = size.y + point.offset;
        }

        //calculate range
        if(side == "right" || side == "left") {
            x0 = x;
            y0 = size.y;
            x1 = x;
            y1 = size.y + size.h;
        } else {
            x0 = size.x;
            y0 = y;
            x1 = size.x + size.w;
            y1 = y;
        }

        return {
            side: side,
            x: x,
            y: y,
            range: {
               x0: x0,
               y0: y0,
               x1: x1,
               y1: y1
            }
        }
    }
});