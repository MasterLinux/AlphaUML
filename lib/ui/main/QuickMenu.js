/**
 *
 * User: MasterLinux
 * Date: 01.03.11
 * Time: 21:18
 */
dojo.provide("ui.main.QuickMenu");

dojo.declare("ui.main.QuickMenu", lib.Obj, {
    buttons: {},
    
    constructor: function() {

        //initialize buttons
        this.buttons["NewClass"] = new ui.main.QuickMenuButton({
            refNode: this.htmlId,
            title: "Class"
        });
    },

    create: function() {
        //call method from superclass
        this.inherited(arguments);

        dojo.place('<div id="' + this.htmlId + '"></div>', "body");

        //create each button
        for(n in this.buttons) {
            this.buttons[n].create();
        }
    },

    destroy: function() {
        //destroy buttons
        for(n in this.buttons) {
            this.buttons[n].destroy();
        } this.buttons = {};

        //call method from superclass
        this.inherited(arguments);
    }
});

/**
 *
 */
dojo.declare("ui.main.QuickMenuButton", lib.Obj, {
    position: null,
    refNode: null,
    title: null,

    constructor: function(args) {
        this.position = args.position;
        this.refNode = args.refNode;
        this.title = args.title;
    },

    create: function() {
        //call method from superclass
        this.inherited(arguments);

        //place button
        dojo.place(
            '<div id="' + this.htmlId + '" class="QuickMenuButton">' +
                '<div class="title">' + this.title + '</div>' +
            '</div>',
            this.refNode
        );
    }
});
