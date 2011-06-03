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
dojo.require("ui.Content");
dojo.require("ui.content.Editor");
dojo.require("ui.Window");

//main loop
dojo.ready(function() {
    //air.Introspector.Console.log("init");

    
    //var win = new ui.Window();
    

        var tabs = {
            tab1: new ui.Tab({
                title: "tab1",
                onClick: function() {
                    //console.debug("tab1 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab1</div>'
                })
            }),
            tab2: new ui.Tab({
                title: "tab2",
                onClick: function() {
                    //console.debug("tab2 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab2!</div>'
                })
            }),
            auto: new ui.Tab({
                title: "ClassDiagram3",
                onClick: function() {
                    //console.debug("tab auto clicked!");
                },
                content: new ui.Content({
                    content: '<div>ClassDiagram3</div>'
                })
            }),
            editor: new ui.Tab({
                title: "Editor",
                content: new ui.content.Editor({})
            })
        }

        var tabs2 = {
            tab1: new ui.Tab({
                title: "tab5",
                onClick: function() {
                    //console.debug("tab1 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab5</div>'
                })
            }),
            tab2: new ui.Tab({
                title: "tab6",
                onClick: function() {
                    //console.debug("tab2 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab6</div>'
                })
            }),
            tab4: new ui.Tab({
                title: "ClassDiagram- 7",
                onClick: function() {
                    //console.debug("tab4 clicked!");
                },
                content: new ui.Content({
                    content: '<div>ClassDiagram- 7</div>'
                })
            }),
            auto: new ui.Tab({
                title: "ClassDiagram8",
                onClick: function() {
                    //console.debug("tab auto clicked!");
                },
                content: new ui.Content({
                    content: '<div>ClassDiagram8</div>'
                })
            })
        }

        var tabBar = new ui.Frame({
            placeAt: "testTabBarDiv",
            title: "Source",
            tabs: tabs
        });

        var tabBar2 = new ui.Frame({
            placeAt: "testTabBarDiv",
            title: "Source",
            tabs: tabs2
        });


        tabBar.create();
        tabBar2.create();

    tabBar2.setPosition(500, 0);
});
