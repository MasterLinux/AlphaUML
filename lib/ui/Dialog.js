/**
 * User: Christoph Grundmann
 * Date: 30.06.11
 * Time: 13:52
 *
 */
dojo.provide("ui.Dialog");
dojo.require("ui.Object");

dojo.declare("ui.Dialog", ui.Object, {
    isSelected: null,
    title: null,
    dnd: null,

    onCancel: null,
    onApprove: null,
    onSelect: null,
    onDestroy: null,

    titleId: null,
    closeBtnId: null,
    cancelBtnId: null,
    okBtnId: null,
    bodyId: null,

    constructor: function(args) {
        args = args || {};
        this.title = args.title;
        this.onSelect = args.onSelect;
        this.onApprove = args.onApprove || this.onApprove;
        this.onDestroy = args.onDestroy;
    },

    create: function() {
        this.inherited(arguments);

        //create ids
        this.titleId = this.htmlId + "Title";
        this.closeBtnId = this.htmlId + "CloseBtn";
        this.cancelBtnId = this.htmlId + "CancelBtn";
        this.okBtnId = this.htmlId + "OkBtn";
        this.bodyId = this.htmlId + "Body";
        this.headerId = this.htmlId + "Header";

        //place dialog
        dojo.place(
            '<div class="Dialog" style="opacity: 0; display: none;" id="' + this.htmlId + '">' +
                '<div class="inner">' +
                    '<div class="header" id="' + this.headerId + '">' +
                        '<div class="title" id="' + this.titleId + '"></div>' +
                        '<div class="close" id="' + this.closeBtnId + '"></div>' +
                    '</div>' +
                    '<div class="body" id="' + this.bodyId + '"></div>' +
                    '<div class="footer">' +
                        '<div class="button left" id="' + this.cancelBtnId + '">Cancel</div>' +
                        '<div class="button right" id="' + this.okBtnId + '">OK</div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );

        //set up dialog
        this.setTitle(this.title);

        this.connect({
            name: "CloseBtn",
            event: "onclick",
            nodeId: this.closeBtnId,
            method: this.close
        });

        this.connect({
            name: "CancelBtn",
            event: "onclick",
            nodeId: this.cancelBtnId,
            method: function(event) {
                //if(this.onCancel) this.onCancel(event);
                this.close();
            }
        });

        this.connect({
            name: "OkBtn",
            event: "onclick",
            nodeId: this.okBtnId,
            method: function(event) {
                if(this.onApprove) this.onApprove(event);
                this.close();
            }
        });

        //select dialog
        this.connect({
            name: "SelectDialog",
            event: "onclick",
            nodeId: this.htmlId,
            method: function() {
                //if(!this.isSelected) {
                    this.select(true);
                //}
            }
        });

        //deselect dialog if another is activated
        this.subscribe({
            event: "DialogSelected",
            method: function(id) {
                if(this.htmlId != id && this.isSelected) {
                    this.select(false);
                }
            }
        });

        //make dialog draggable
        this.dnd = dojo.dnd.Moveable(this.htmlId, {
            handle: this.headerId
        });

        //select class on first move
        this.dnd.onFirstMove = dojo.hitch(this, function() {
            this.select(true);
        });

        //open dialog
        this.open();
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        this.inherited(arguments);
        if(this.onDestroy) this.onDestroy();
    },

    /**
     * opens the dialog
     */
    open: function() {
        this.show();
        this.select(true);
    },

    /**
     * closes the dialog
     */
    close: function() {
        //fade ui object out
        this.fade({
            duration: 500,
            nodeId: this.htmlId,
            start: 1,
            end: 0,
            onEnd: dojo.hitch(this, function() {
                this.isVisible = false;
                this.destroy(true);
            })
        });
    },

    setTitle: function(title) {
        this.title = title || this.title || "";

        var node = dojo.byId(this.titleId);
        node.innerHTML = this.title;
    },

    /**
     * selects or deselects the class
     * @param select boolean if it is set to false class will be deactivated
     */
    select: function(select) {
        //get class node
        var node = dojo.byId(this.htmlId);

        //select dialog
        if(select) {
            this.isSelected = true;
            dojo.addClass(node, "selected");
            dojo.style(node, "zIndex", 250);
            if(this.onSelect) this.onSelect();
            dojo.publish("DialogSelected", [this.htmlId]);
        }

        //deselect dialog
        else {
            dojo.removeClass(node, "selected");
            dojo.style(node, "zIndex", 200);
            this.isSelected = false;
        }
    },

    /**
     * adds new content into the dialog
     * @param title string
     * @param content string
     */
    addContent: function(title, content) {
        //place new content
        dojo.place(
            '<div class="content">' +
                '<div class="cntHeader">' + title + '</div>' +
                '<div class="cntBody">' + content + '</div>' +
            '</div>',
            dojo.byId(this.bodyId)
        );
    }
});
