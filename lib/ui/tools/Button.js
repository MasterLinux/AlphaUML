/**
 * User: Christoph Grundmann
 * Date: 15.06.11
 * Time: 16:50
 *
 * A button for
 * the tool menu
 */
dojo.provide("ui.tools.Button");
dojo.require("ui.Object");

dojo.declare("ui.tools.Button", ui.Object, {
    title: null,
    icon: null,
    onClick: null,
    
    constructor: function(args) {
        this.title = args.title;
        this.icon = args.icon;
        this.onClick = args.onClick;

        this.create();
    },

    /**
     * creates and places the menu button
     */
    create: function() {
        this.inherited(arguments);

        dojo.place(
            '<li class="button" id="' + this.htmlId + '"></li>',
            dojo.byId(this.placeAt)
        );

        //listen for onClick events
        this.connect({
            nodeId: this.htmlId,
            event: "onclick",
            method: function() {
                //execute onClick function
                if(this.onClick) this.onClick();
            }
        });

        //TODO create tooltip
    }
});
