/**
 * User: Christoph Grundmann
 * Date: 02.05.11
 * Time: 16:14
 *
 */
dojo.provide("ui.textinput.Button");
dojo.require("ui.Object");

dojo.declare("ui.textinput.Button", ui.Object, {
    onClick: null,
    title: null,
    icon: null,

    /**
     * initializes button with
     * the following properties
     *
     * args: {
     *  onClick: function -> executes on an onClick event
     *  title: string -> [optional] button title
     *  icon: string -> [optional] css-class like "arrow"
     * }
     * 
     * @param args
     */
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title || "";
        this.icon = args.icon;
    },

    /**
     * creates a button with a title or an icon.
     * in addition it sets the onClick handle.
     */
    create: function() {
        //call method of super class
        this.inherited(arguments);

        //place button node
        dojo.place(
            '<div id="' + this.htmlId + '" class="button">' + this.title + '</div>',
            dojo.byId(this.placeAt)
        );

        //set icon class if given
        if(this.icon) dojo.addClass(dojo.byId(this.htmlId), this.icon);

        //set event handler for an onClick event
        dojo.connect(dojo.byId(this.htmlId), "onclick", this.onClick);
    }
});