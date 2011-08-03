/**
 * User: Christoph Grundmann
 * Date: 15.06.11
 * Time: 16:50
 *
 * A button for
 * the tool menu
 */
dojo.provide("ui.tools.Button");
dojo.require("ui.Tooltip");
dojo.require("ui.Object");

dojo.declare("ui.tools.Button", ui.Object, {
    title: null,
    icon: null,
    onClick: null,
    tooltip: null,
    
    constructor: function(args) {
        this.title = args.title;
        this.icon = args.icon;
        this.onClick = args.onClick;
        this.uiType = "toolsbutton";

        this.create();
    },

    /**
     * creates and places the menu button
     */
    create: function() {
        this.inherited(arguments);

        dojo.place(
            '<li class="button ' + this.icon + '" id="' + this.htmlId + '"></li>',
            dojo.byId(this.placeAt)
        );

        //listen for onClick events
        this.connect({
            nodeId: this.htmlId,
            event: "onclick",
            method: function(event) {
                dojo.stopEvent(event);
                //execute onClick function
                if(this.onClick) this.onClick();
            }
        });

        //create tooltip
        if(this.title) {
            this.tooltip = new ui.Tooltip({
                title: this.title,
                ids: [this.htmlId]
            });
        }
    },

    /**
     * destroys the button
     * @param del boolean
     */
    destroy: function(del) {
        if(this.tooltip) this.tooltip.destroy(true);
        this.inherited(arguments);
    }
});
