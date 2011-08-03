/**
 * User: Christoph Grundmann
 * Date: 02.08.11
 * Time: 18:28
 *
 */
dojo.provide("ui.tools.TextInput");
dojo.require("ui.Object");

dojo.declare("ui.tools.TextInput", ui.Object, {
    onApprove: null,
    inputId: null,

    constructor: function(args) {
        args = args || {};
        this.onApprove = args.onApprove;
        this.uiType = "toolstextinput";

        this.create();
    },

    create: function() {
        this.inherited(arguments);

        //create ids
        this.inputId = this.htmlId + "Input";

        dojo.place(
            '<li class="textInput" id="' + this.htmlId + '">' +
                '<input type="text" id="' + this.inputId + '" />' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        this.connect({
            nodeId: this.inputId,
            event: "onkeyup",
            method: function(event) {
                //execute on enter
                if(event.keyCode === 13) {
                    dojo.stopEvent(event);
                    if(this.onApprove) this.onApprove(event.target.value, event);
                }
            }
        });
    }
});
