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
dojo.require("dojo.dnd.Moveable");
dojo.require("ui.util.Math");
dojo.require("ui.Console");
dojo.require("ui.content.ClassDiagram");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.classDiagram.Class");

//main loop
dojo.ready(function() {
    var p = new ui.classDiagram.Connector({placeAt: "main"});
    var c = new ui.classDiagram.Class({
        placeAt: "main",
        name: "ui.Class",
        isAbstract: true,
        stereotype: "enumeration"
    });

    var c2 = new ui.classDiagram.Class({
        placeAt: "main",
        name: "ui.Class2",
        isAbstract: true,
        stereotype: "dataType"
    });

    var c3 = new ui.classDiagram.Class({
        placeAt: "main",
        name: "ui.Class3",
        isAbstract: false,
        stereotype: "dataType"
    });


    p.create();

    c.create();
    c.addOperation({});

    c2.create();
    c3.create();
    /**
    air.Introspector.Console.log(dojo);

    dojo.place(
        '<div style="height: 20px; width: 20px; background: #11aeFF;" id="p1">1</div> ',
        dojo.byId("main")
    );

    dojo.place(
        '<div style="height: 20px; width: 20px; background: #11aeFF;" id="p2">2</div> ',
        dojo.byId("main")
    );

    var p1 = new dojo.dnd.Moveable("p1");
    var p2 = new dojo.dnd.Moveable("p2");
    maths = new ui.util.Math();

    p2.onMoveStop = function() {
        var p1Pos = dojo.position(dojo.byId("p1"));
        var p2Pos = dojo.position(dojo.byId("p2"));

        console.debug(maths.position(p1Pos, p2Pos));
    }*/

    //var win = new ui.Window();

/*
        var console = new ui.Tab({
            title: "Console",
            content: new ui.content.ClassDiagram()
        });

        var editor = new ui.Tab({
            title: "Editor",
            content: new ui.content.Editor(),
            menu: new ui.Tools({
                buttons: [
                    {
                        title: "muh",
                        onClick: function() {
                            air.trace("click me!");
                        }
                    },
                    {
                        title: "muh2",
                        onClick: function() {
                            air.trace("click me, 2!");
                        }
                    }
                ]
            })
        });

        var bottomFrame = new ui.Frame({
            border: ["top"],
            placeAt: "main",
            name: "Bottom",
            tabs: [editor, console],
            width: 500,
            height: 400,
            x: 0,
            y: 0
        });

        bottomFrame.create();

    var console2 = new ui.Tab({
            title: "Console",
            content: new ui.content.Scrollable()
        });

        var editor2 = new ui.Tab({
            title: "Editor",
            content: new ui.content.Editor(),
            menu: new ui.Tools({
                buttons: [
                    {
                        title: "muh",
                        onClick: function() {
                            air.trace("click me!");
                        }
                    },
                    {
                        title: "muh2",
                        onClick: function() {
                            air.trace("click me, 2!");
                        }
                    }
                ]
            })
        });

        var bottomFrame2 = new ui.Frame({
            border: ["top"],
            placeAt: "main",
            name: "Bottom",
            tabs: [editor2, console2],
            width: 500,
            height: 400,
            x: 500,
            y: 0
        });

        bottomFrame2.create();


        //hide on timeout
        //window.setTimeout(dojo.hitch(this, function(){
            //throw RefreshWindow event
            //dojo.publish("RefreshWindow");
        //}), 1000);


        //bottomFrame.create();
        //tabBar2.create();

    //tabBar2.setPosition(500, 0); */
});
