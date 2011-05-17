/**
 *
 * User: MasterLinux
 * Date: 24.02.11
 * Time: 20:01
 */
dojo.registerModulePath("lib", "../../lib");
dojo.registerModulePath("ui", "../../lib/ui");
dojo.registerModulePath("parser", "../../lib/parser");

dojo.require("ui.Tab");
dojo.require("ui.Frame");
dojo.require("ui.Content");
dojo.require("ui.content.Editor");

//main loop
dojo.ready(function() {
    var tabs = {
        tab1: new ui.Tab({
            title: "tab1",
            onClick: function() {
                console.debug("tab1 clicked!");
            },
            content: new ui.Content({
                content: '<div>puff</div>'
            })
        }),
        tab2: new ui.Tab({
            title: "tab2",
            onClick: function() {
                console.debug("tab2 clicked!");
            },
            content: new ui.Content({
                content: '<div>Wuff!</div>'
            })
        }),
        tab4: new ui.Tab({
            title: "ClassDiagram- 2",
            onClick: function() {
                console.debug("tab4 clicked!");
            },
            content: new ui.Content({
                content: '<div>Diagram!</div>'
            })
        })
    }

    var tabBar = new ui.Frame({
        placeAt: "testTabBarDiv",
        title: "Source",
        tabs: tabs
    });

    //console.debug(editor);

    tabBar.create();
});
