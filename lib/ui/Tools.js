/**
 * User: Christoph Grundmann
 * Date: 14.06.11
 * Time: 10:27
 *
 * A menu that contains a collection
 * of necessary uml tools
 */
dojo.provide("ui.Tools");
dojo.require("ui.Object");
dojo.require("ui.tools.Button");

dojo.declare("ui.Tools", ui.Object, {
    buttonStore: null,
    buttons: null,

    /**
     * type string -> menu type like "sequence" or "class"
     * @param args
     */
    constructor: function(args) {
        this.buttons = args.buttons;
        this.uiType = "tools";
    },

    create: function(placeAt) {
        if(placeAt) this.placeAt = placeAt;
        this.inherited(arguments);

        dojo.place(
            '<ul class="Tools" uitype="' + this.uiType + '" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //add each set buttons
        if(this.buttons) {
            this.addButton(this.buttons);
        }
    },

    /**
     * adds a new button or a
     * collection of buttons
     * {
     *   title: "string",
     *   type: "button.class",
     *   onClick: function(){}
     * }
     * @param buttons array
     */
    addButton: function(buttons) {
        //TODO destroy it on tab close
        if(!this.buttonStore) this.buttonStore = [];
        dojo.forEach(buttons, dojo.hitch(this, function(button) {
            var btn = null;

            air.trace(this.placeAt);

            //create specific button
            if(button.type) {
                var btnTypeArr = button.type.split(".");
                var btnClass = btnTypeArr[0];
                var btnType = btnTypeArr[1];

                //get button class
                btnClass = ui.tools[btnClass];
                btnType = btnClass[btnType];

                //create new button
                btn = new btnType({
                    title: button.title,
                    onClick: button.onClick,
                    placeAt: this.htmlId
                });

                //store button
                this.buttonStore.push(btn);
            }

            //TODO remove
            else {
                btn = new ui.tools.Button({
                    title: button.title,
                    onClick: button.onClick,
                    placeAt: this.htmlId
                });

                this.buttonStore.push(btn);
            }
        }));
    },

    //TODO implement
    setSize: function(width, height) {

    },

    /**
     * creates a menu for
     * the editor
     */
    createEditorMenu: function() {
            
    },

    /**
     * creates a menu for
     * class diagrams
     */
    createClassDiaMenu: function() {
        
    },

    /**
     * creates a menu for
     * sequence diagrams
     */
    createSequenceDiaMenu: function() {
        
    }
});

