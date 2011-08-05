/**
 *
 * User: MasterLinux
 * Date: 24.02.11
 * Time: 20:01
 */
dojo.registerModulePath("lib", "../../lib");
dojo.registerModulePath("ui", "../../lib/ui");

dojo.require("ui.Tab");
if(air) dojo.require("ui.Window");
dojo.require("lib.Config");
dojo.require("ui.Frame");
dojo.require("ui.content.ClassDiagram");
dojo.require("ui.tools.ClassDiagram");

//declare config file
config = new lib.Config();
_window = null;

//main loop
dojo.ready(function() {
    //air.Introspector.Console.log(air);

    //initialize browser mode
    if(air) {
        _window = new ui.Window();
    } else {
        var console = new ui.Tab({
            title: "Class Diagram",
            content: new ui.content.ClassDiagram(),
            menu: new ui.tools.ClassDiagram()
        });

        var bottomFrame = new ui.Frame({
            border: ["top"],
            placeAt: "main",
            name: "Bottom",
            tabs: [console],
            width: 1000,
            height: 800,
            id: "bottom",
            x: 0,
            y: 0
        });

        bottomFrame.create();
    }
});
