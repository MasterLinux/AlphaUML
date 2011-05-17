/**
 * User: Christoph Grundmann
 * Date: 17.05.11
 * Time: 22:24
 *
 */
dojo.provide("ui.util.DragAndDrop");
dojo.require("lib.Obj");

dojo.declare("ui.util.DragAndDrop", lib.Obj, {
    isDragging: null,
    movableId: null,
    onMove: null,
    onStart: null,
    onStop: null,

    /**
     * movableId string id of the ui object that will be movable
     * @param args
     */
    constructor: function(args) {
        this.movableId = args.movableId;
        this.onMove = args.onMove;
        this.onStart = args.onStart;
        this.onStop = args.onStop;

        //create dnd object
        this.create();

        //set drag and drop functionality
        this.connect({
            name: "Start",
            node: dojo.byId(this.movableId),
            event: "onmousedown",
            lock: true,
            method: this.start
        });

        this.connect({
            name: "Stop",
            node: dojo.body(),
            event: "onmouseup",
            lock: true,
            method: this.stop
        });

        this.connect({
            name: "Move",
            node: dojo.body(),
            event: "onmousemove",
            lock: true,
            method: this.move
        });
    },

    start: function(mouse) {
        console.debug("start dragging");
        //enable dragging
        this.isDragging = true;
    },

    stop: function(mouse) {
        console.debug("stop dragging");
        //disable dragging
        this.isDragging = false;
    },

    move: function(mouse) {
        if(this.isDragging) {
            //get ui object of the hovered dom node
            var obj = this.getObject(mouse.target);

            //target = target.parentNode;
            console.debug(obj);
        }
    },

    /**
     * gets ui object of the
     * given node
     * @param node
     * @return lib.Obj
     */
    getObject: function(node) {
        //max search iterations
        var maxSearchLoops = 5;
        var curSearchLoops = 0;
        var nodeId = null;
        var uiType = null;

        //search ui type of the given node
        while(!uiType && curSearchLoops < maxSearchLoops) {
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
