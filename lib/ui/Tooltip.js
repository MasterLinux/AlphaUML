/**
 * User: Christoph Grundmann
 * Date: 02.08.11
 * Time: 22:06
 *
 */
dojo.provide("ui.Tooltip");
dojo.require("ui.Object");

dojo.declare("ui.Tooltip", ui.Object, {
    offsetX: null,
    offsetY: null,
    isOpen: null,
    title: null,
    ids: null,

    constructor: function(args) {
        args = args || {};
        this.placeAt = args.placeAt || "main";
        this.title = args.title;
        this.offsetX = args.offsetX || -15;
        this.offsetY = args.offsetY || 15;
        this.ids = args.ids;

        this.create();
    },

    create: function() {
        this.inherited(arguments);

        //register nodes
        this.register(this.ids);
    },

    /**
     * places the tooltip
     */
    place: function() {
        dojo.place(
            '<div class="Tooltip" id="' + this.htmlId + '">' +
                '<div class="connector"></div>' +
                '<div class="body">' + this.title + '</div>' +
            '</div>',
            dojo.byId(this.placeAt)
        );
    },

    /**
     * registers a list of ui elements by id
     * @param ids array of htmlId
     */
    register: function(ids) {
        ids = ids || this.ids || [];
        this.ids = ids;

        //set event listener
        dojo.forEach(ids, dojo.hitch(this, function(id) {
            //hide tooltip
            this.connect({
                name: "MouseOut_" + id,
                nodeId: id,
                event: "onmouseout",
                method: function(event) {
                    this.close();
                }
            });

            //show tooltip
            this.connect({
                name: "MouseOver_" + id,
                nodeId: id,
                event: "onmouseover",
                method: function(event) {
                    this.open(event.clientX + this.offsetX, event.clientY + this.offsetY);
                }
            });

            this.connect({
                name: "MouseMove_" + id,
                nodeId: id,
                event: "onmousemove",
                method: function(event) {
                    if(this.isOpen) {
                        dojo.stopEvent(event);
                        this.setPosition(event.clientX + this.offsetX, event.clientY + this.offsetY);
                    }
                }
            })
        }));
    },

    /**
     * opens the tooltip
     * @param x integer
     * @param y integer
     */
    open: function(x, y) {
        this.place();
        this.setPosition(x, y);
        this.isOpen = true;
    },

    /**
     * closes the tooltip
     */
    close: function() {
        this.isOpen = false;
        dojo.destroy(this.htmlId);
    }
});
