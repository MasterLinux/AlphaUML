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
dojo.require("ui.TabBar");
dojo.require("ui.TabContent");

//main loop
dojo.ready(function() {
    var tabs = {
        tab1: new ui.Tab({
            title: "tab1",
            onClick: function() {
                console.debug("tab1 clicked!");
            },
            content: new ui.TabContent({
                content: '<div>Muh!</div>'
            })
        }),
        tab2: new ui.Tab({
            title: "tab2",
            onClick: function() {
                console.debug("tab2 clicked!");
            },
            content: new ui.TabContent({
                content: '<div>Wuff!</div>'
            })
        }),
        tab3: new ui.Tab({
            title: "Editor",
            onClick: function() {
                console.debug("tab3 clicked!");
            },
            content: new ui.TabContent({
                content: '<div>Editor!</div>'
            })
        }),
        tab4: new ui.Tab({
            title: "ClassDiagram- 2",
            onClick: function() {
                console.debug("tab4 clicked!");
            },
            content: new ui.TabContent({
                content: '<div>Diagram!</div>'
            })
        })
    }

    var tabBar = new ui.TabBar({
        placeAt: "testTabBarDiv",
        title: "Source",
        tabs: tabs
    });

    tabBar.create();
});
