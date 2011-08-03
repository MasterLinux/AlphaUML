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
dojo.require("ui.tools.TextInput");

dojo.declare("ui.Tools", ui.Object, {
    inputStorage: null,
    inputs: null,
    buttonStorage: null,
    buttons: null,
    frameId: null,
    tab: null,

    /**
     * type string -> menu type like "sequence" or "class"
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.buttons = args.buttons;
        this.inputs = args.inputs;
        this.uiType = "tools";
    },

    create: function(placeAt) {
        if(placeAt) this.placeAt = placeAt;
        this.inherited(arguments);

        //place menu
        this.place();
    },

    /**
     * adds an input or a collection of inputs
     * inputs: [
     *   {
     *      onApprove: function(value, event){}
     *   }
     * ]
     * @param inputs array
     */
    addTextInput: function(inputs) {
        inputs = inputs || this.inputs;
        this.inputs = inputs;

        if(!this.inputStorage) this.inputStorage = [];
        dojo.forEach(inputs, dojo.hitch(this, function(input) {
            var _input = new ui.tools.TextInput({
                placeAt: this.htmlId,
                onApprove: input.onApprove
            });

            this.inputStorage.push(_input);
        }));
    },

    /**
     * removes each registered input
     */
    clearInputs: function() {
        if(this.inputStorage) {
            //destroy buttons
            dojo.forEach(this.inputStorage, function(input) {
                input.destroy(true);
            });

            //clear store
            this.inputStorage = [];
        }
    },

    /**
     * adds a new button or a
     * collection of buttons
     * {
     *   title: "string",
     *   icon: "css class",
     *   onClick: function(){}
     * }
     * @param buttons array
     */
    addButton: function(buttons) {
        buttons = buttons || this.buttons;
        this.buttons = buttons;
        
        //TODO destroy it on tab close
        if(!this.buttonStorage) this.buttonStorage = [];
        dojo.forEach(buttons, dojo.hitch(this, function(button) {
            //create specific button
            var btn = new ui.tools.Button({
                title: button.title,
                icon: button.icon,
                onClick: button.onClick,
                placeAt: this.htmlId
            });

            //store button
            this.buttonStorage.push(btn);
        }));
    },

    /**
     * destroys each registered button
     */
    clearButtons: function() {
        if(this.buttonStorage) {
            //destroy buttons
            dojo.forEach(this.buttonStorage, function(btn) {
                btn.destroy(true);
            });

            //clear store
            this.buttonStorage = [];
        }
    },

    /**
     * sets the size of this menu
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        var menuNode = dojo.byId(this.htmlId);
        dojo.style(menuNode, "width", width + "px");
        dojo.style(menuNode, "height", height + "px");
    },

    /**
     * registers the parent frame
     * @param frame ui.Frame
     */
    register: function(frame, tab) {
        this.placeAt = frame.menuId;
        this.frameId = frame.htmlId;
        this.tab = tab;
    },

    /**
     * activates each event handler and
     * shows the menu
     */
    activate: function() {
        this.inherited(arguments);

        //show menu
        var node = dojo.byId(this.htmlId);
        if(node) dojo.style(node, "display", "");
    },

    /**
     * deactivates each event handler and
     * hides the menu
     */
    deactivate: function() {
        this.inherited(arguments);
        
        //hide menu
        var node = dojo.byId(this.htmlId);
        if(node) dojo.style(node, "display", "none");
    },

    place: function(frame) {
        this.clearButtons();
        
        //remove content if already exists
        var node = dojo.byId(this.htmlId);
        if(node) dojo.destroy(node);

        //place into the given frame
        if(frame) {
            //deactivate current content
            this.deactivate();

            //refresh register vars
            this.placeAt = frame.menuId;
            this.frameId = frame.htmlId;
        }

        dojo.place(
            '<ul class="Tools" uitype="' + this.uiType + '" id="' + this.htmlId + '"></ul>',
            dojo.byId(this.placeAt)
        );

        //add each set buttons
        if(this.buttons) {
            this.addButton(this.buttons);
        }

        if(this.inputs) {
            this.addTextInput(this.inputs);
        }

        //activate content
        if(frame) this.activate();
    },

    /**
     * destroys this menu
     * @param del boolean
     */
    destroy: function(del) {
        this.clearButtons();
        this.clearInputs();
        this.tab = null;
        this.inherited(arguments);
    }
});

