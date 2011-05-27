/**
 * User: Christoph Grundmann
 * Date: 27.05.11
 * Time: 17:04
 *
 * horizontal menu
 */
dojo.provide("ui.HMenu");

dojo.declare("ui.HMenu", ui.Object, {
    structure: null,

    constructor: function(args) {
        this.structure = args.structure;
        
    }
});

/**
 * button for horizontal menus
 */
dojo.declare("ui.HMenuButton", ui.Object, {
    onClick: null,
    title: null,
    menu: null,
    
    constructor: function(args) {
        this.onClick = args.onClick;
        this.title = args.title;
        this.menu = args.menu;
    }
});

/**
 * drop down menu for horizontal menus
 */
dojo.declare("ui.HMenuDropDown", ui.Object, {

});

