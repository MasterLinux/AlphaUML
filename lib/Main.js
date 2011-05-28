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
dojo.require("ui.Window");
//dojo.require("ui.FileTree");
dojo.require("ui.HMenu");

//main loop
dojo.ready(function() {
    /*
    var fileBrowser = new ui.FileTree({
        path: "C:/AirTest/"
    });

    fileBrowser.create(); */

    var btn1 = {
        title: "New Project",
        menu: null,
        onClick: function() {
            console.debug(1);
        }
    }

    var btn2 = {
        title: "Open Project",
        menu: null,
        onClick: function() {
            console.debug(2);
        }
    }

    var menu1 = {
        title: "File",
        buttons: [btn1, btn2],
        onClick: function(){}
    }

    var btn3 = {
        title: "Find",
        menu: null,
        onClick: function() {
            console.debug(3);
        }
    }

    var btn4 = {
        title: "Replace",
        menu: null,
        onClick: function() {
            console.debug(4);
        }
    }

    var menu2 = {
        title: "Search",
        buttons: [btn3, btn4],
        onClick: function(){}
    }

    var structure = [menu1, menu2];

    /*
    var structure = {
        "File": {
            "New Project": {
                onClick: function() {
                    console.debug(1);
                    //air.trace("New Project");
                }
            },
            "Open Project": {
                onClick: function() {
                    console.debug(2);
                    //air.trace("Open Project");
                }
            }
        },
        "Search": {
            "Find": {
                onClick: function() {
                    console.debug(3);
                    //air.trace("Fine");
                }
            },
            "Replace": {
                onClick: function() {
                    console.debug(4);
                    //air.trace("Replace");
                }
            }
        }
    };*/

    var menu = new ui.HMenu({
        placeAt: "main",
        structure: structure
    });

    //menu.create();
    
    //var win = new ui.Window();

    //win.create();
    

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

        //console.debug(editor);

        tabBar.create();
        //tabBar2.create();
});
