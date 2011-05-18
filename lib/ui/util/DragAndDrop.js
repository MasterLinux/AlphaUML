/**
 * User: Christoph Grundmann
 * Date: 17.05.11
 * Time: 22:24
 *
 */
dojo.provide("ui.util.DragAndDrop");
dojo.require("ui.Object");
dojo.require("ui.Tab");

dojo.declare("ui.util.DragAndDrop", ui.Object, {
    isDragging: null,
    movable: null,
    handle: null,
    onMove: null,
    onStart: null,
    onStop: null,
    obj: null,

    /**
     * handle string id of the node that will be used as a handle
     * movable ui.Object object that will be movable
     * @param args
     */
    constructor: function(args) {
        this.movable = args.movable;
        this.handle = args.handle;
        this.onMove = args.onMove;
        this.onStart = args.onStart;
        this.onStop = args.onStop;

        //create dnd object
        this.create();

        //set drag and drop functionality
        this.connect({
            name: "Start",
            nodeId: this.handle,
            event: "onmousedown",
            lock: true,
            method: this.start
        });

        this.connect({
            name: "Stop",
            body: true,
            event: "onmouseup",
            lock: true,
            method: this.stop
        });

        this.connect({
            name: "Move",
            body: true,
            event: "onmousemove",
            lock: true,
            method: this.move
        });
    },

    start: function(mouse) {
        console.debug("start dragging");
        //add dnd class
        dojo.addClass(dojo.body(), "dnd");

        //enable dragging
        this.isDragging = true;
    },

    stop: function(mouse) {
        console.debug("stop dragging");
        //disable dragging
        this.isDragging = false;

        /* TODO create tab after dropping
        tab1: new ui.Tab({
            title: "tab1",
            onClick: function() {
                console.debug("tab1 clicked!");
            },
            content: new ui.Content({
                content: '<div>puff</div>'
            })
        })
         */

        //if hovered object is a tab
        if(this.obj && this.obj.uiType == "tab") {
            //get parent frame of the tab
            var frame = this.getGlobal("frame", this.obj.frameId);

            //replace tab node
            this.movable.place(frame, this.obj.index);

            console.debug(this.obj.index);

            //remove old ui object
            this.obj = null;
        }

        //remove dnd class
        dojo.removeClass(dojo.body(), "dnd");
    },

    move: function(mouse) {
        if(this.isDragging) {
            //get ui object of the hovered dom node
            this.obj = this.getObject(mouse.target);
        }
    },

    /**
     * gets ui object of the
     * given node
     * @param node
     * @return ui.Object
     */
    getObject: function(node) {
        //max search iterations
        var maxSearchLoops = 5;
        var curSearchLoops = 0;
        var nodeId = null;
        var uiType = null;

        //search ui type of the given node
        while(!uiType && curSearchLoops < maxSearchLoops && node) {
            //get uitype property of the current node
            uiType = dojo.getNodeProp(node, "uitype");
            //get next parent node if no type is found
            if(!uiType) node = node.parentNode;
            //otherwise get the nodes id
            else nodeId = node.id;
            //increment loop counter
            curSearchLoops++;
        }

        //return founded ui object
        return this.getGlobal(uiType, nodeId);
    }
});
