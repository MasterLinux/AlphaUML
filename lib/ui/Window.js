/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 00:25
 *
 */
dojo.provide("ui.Window");
dojo.require("ui.Object");
dojo.require("ui.util.Node");
dojo.require("ui.Frame");
dojo.require("ui.Tab");
dojo.require("ui.content.FileTree");
dojo.require("ui.content.Editor");
dojo.require("ui.content.Menu");
dojo.require("ui.content.Console");
dojo.require("ui.content.Scrollable");
dojo.require("ui.content.ClassDiagram");
dojo.require("ui.Tools");
dojo.require("ui.tools.ClassDiagram");

dojo.declare("ui.Window", ui.Object, {
    nodeUtil: null,
    window: null,
    stage: null,
    name: null,

    //frames
    menuFrame: null,
    menuFrameProps: null,
    leftFrame: null,
    leftFrameProps: null,
    topFrame: null,
    topFrameProps: null,
    bottomFrame: null,
    bottomFrameProps: null,
    bottomHeight: null,
    leftWidth: null,

    /**
     * initializes window
     * @param args
     */
    constructor: function(args) {
        this.nodeUtil = new ui.util.Node();
        this.name = "MainWindow";

        //get air specific window properties
        this.window = window.nativeWindow;
        this.stage = this.window.stage;
        
        this.readConfig();
    },

    /**
     * creates window with each
     * necessary frame
     */
    create: function(cfg) {
        this.inherited(arguments);

        //set global
        this.setGlobal("window");

        //set window size
        this.window.width = cfg.resolution.width;
        this.window.height = cfg.resolution.height;

        //get each necessary info for size calculation
        this.bottomHeight = cfg.frames.bottomHeight;
        this.leftWidth = cfg.frames.leftWidth;

        //set the size of each frame
        this.setSize(this.leftWidth, this.bottomHeight);

        //update frame sizes if another frame is resize
        this.subscribe({
            event: "FrameResize",
            method: function(event) {
                if(event.name == "Left") {
                    this.leftWidth = event.width;
                } else if(event.name == "Bottom") {
                    this.bottomHeight = event.height;
                }

                this.setSize(this.leftWidth, this.bottomHeight);
            }
        });

        //resize window on stage resize
        this.window.addEventListener(air.Event.RESIZE, dojo.hitch(this, function() {
            this.setSize(this.leftWidth, this.bottomHeight);
        }));

        /*

        //resize window on stage resize
        this.window.addEventListener(air.Event.RESIZE, dojo.hitch(this, function() {
            this.setSize(this.stage.stageWidth, this.stage.stageHeight);
        }));

        //resize frames
        this.subscribe({
            event: "FileTreeResize",
            method: function(width) {
                this.setFileTreeSize(width);
            }
        });

        this.subscribe({
            event: "EditorResize",
            method: function(height) {
                this.setEditorSize(height);
            }
        });*/
    },

    /**
     * sets the size of each registered frame if no
     * frame is already registered, it also will creates each frame
     * @param leftWidth integer width of the frame on the left side
     * @param bottomHeight integer height of the frame on the bottom side
     */
    setSize: function(leftWidth, bottomHeight) {
        var stageWidth = this.stage.stageWidth - 1;
        var stageHeight = this.stage.stageHeight - 1;

        //calculate frame size/position
        this.menuFrameProps = {
            w: stageWidth,
            h: 30,
            x: 0,
            y: 0
        };

        this.leftFrameProps = {
            w: leftWidth,
            h: stageHeight - this.menuFrameProps.h,
            x: 0,
            y: this.menuFrameProps.h
        };

        this.topFrameProps = {
            w: stageWidth - this.leftFrameProps.w,
            h: this.leftFrameProps.h - bottomHeight,
            x: this.leftFrameProps.w,
            y: this.leftFrameProps.y
        };

        this.bottomFrameProps = {
            w: stageWidth - this.leftFrameProps.w,
            h: bottomHeight,
            x: this.topFrameProps.x,
            y: this.topFrameProps.y + this.topFrameProps.h
        };

        var tabs = {
            tab1: new ui.Tab({
                title: "tab1",
                onClick: function() {
                    //console.debug("tab1 clicked!");
                },
                content: new ui.Content({
                    content: '<div>tab1</div>'
                })
            })
        }

        //create menu frame
        if(!this.menuFrame) this.createMenuFrame(
            this.menuFrameProps.w,
            this.menuFrameProps.h,
            this.menuFrameProps.x,
            this.menuFrameProps.y
        );

        //otherwise update the position and size
        else this.updateFrame("menuFrame",
            this.menuFrameProps.w,
            this.menuFrameProps.h,
            this.menuFrameProps.x,
            this.menuFrameProps.y
        );

        //create left frame
        if(!this.leftFrame) this.createLeftFrame(
            this.leftFrameProps.w,
            this.leftFrameProps.h,
            this.leftFrameProps.x,
            this.leftFrameProps.y, tabs
        );

        //otherwise update the position and size
        else this.updateFrame("leftFrame",
            this.leftFrameProps.w,
            this.leftFrameProps.h,
            this.leftFrameProps.x,
            this.leftFrameProps.y
        );

        //create top frame
        if(!this.topFrame) this.createTopFrame(
            this.topFrameProps.w,
            this.topFrameProps.h,
            this.topFrameProps.x,
            this.topFrameProps.y
        );

        //otherwise update the position and size
        else this.updateFrame("topFrame",
            this.topFrameProps.w,
            this.topFrameProps.h,
            this.topFrameProps.x,
            this.topFrameProps.y
        );

        //create top frame
        if(!this.bottomFrame) this.createBottomFrame(
            this.bottomFrameProps.w,
            this.bottomFrameProps.h,
            this.bottomFrameProps.x,
            this.bottomFrameProps.y
        );

        //otherwise update the position and size
        else this.updateFrame("bottomFrame",
            this.bottomFrameProps.w,
            this.bottomFrameProps.h,
            this.bottomFrameProps.x,
            this.bottomFrameProps.y
        );
    },

    /**
     * creates the menu frame
     * @param w integer width
     * @param h integer height
     * @param x integer position on x-axis
     * @param y integer position on y-axis
     */
    createMenuFrame: function(w, h, x, y) {
        var menu = new ui.content.Menu();

        this.menuFrame = new ui.Frame({
            placeAt: "main",
            name: "Menu",
            content: menu,
            width: w,
            height: h,
            x: x,
            y: y
        });

        this.menuFrame.create();
    },

    /**
     * creates the frame on the left
     * @param w integer width
     * @param h integer height
     * @param x integer position on x-axis
     * @param y integer position on y-axis
     * @param tabs array of tabs
     */
    createLeftFrame: function(w, h, x, y, tabs) {
        var fileTree = new ui.content.FileTree({
            id: "master"
        });

        this.leftFrame = new ui.Frame({
            border: ["right"],
            placeAt: "main",
            name: "Left",
            content: fileTree,
            width: w,
            height: h,
            x: x,
            y: y
        });

        this.leftFrame.create();
    },

    /**
     * creates the frame on the top
     * @param w integer width
     * @param h integer height
     * @param x integer position on x-axis
     * @param y integer position on y-axis
     * @param tabs array of tabs
     */
    createTopFrame: function(w, h, x, y, tabs) {
        var dia = new ui.Tab({
            title: "Class Diagram",
            content: new ui.content.ClassDiagram(),
            menu: new ui.tools.ClassDiagram()
        });

        this.topFrame = new ui.Frame({
            id: "top",
            placeAt: "main",
            name: "Top",
            tabs: [dia],
            width: w,
            height: h,
            x: x,
            y: y
        });

        this.topFrame.create();
    },

    /**
     * creates the frame on the bottom
     * @param w integer width
     * @param h integer height
     * @param x integer position on x-axis
     * @param y integer position on y-axis
     * @param tabs array of tabs
     */
    createBottomFrame: function(w, h, x, y, tabs) {
        var console = new ui.Tab({
            title: "Console",
            content: new ui.content.Console()
        });

        this.bottomFrame = new ui.Frame({
            id: "bottom",
            border: ["top"],
            placeAt: "main",
            name: "Bottom",
            tabs: [console],
            width: w,
            height: h,
            x: x,
            y: y
        });

        this.bottomFrame.create();
    },

    /**
     * updates the size and position of
     * the frame with the given name
     * @param name string
     * @param w integer
     * @param h integer
     * @param x integer
     * @param y integer
     */
    updateFrame: function(name, w, h, x, y) {
        this[name].setPosition(x, y);
        this[name].setSize(w, h);
    },

    /**
     * reads the config and creates
     * the window on success
     */
    readConfig: function() {
        dojo.xhrGet({
            url: "config.json",
            handleAs: "json",
            load: dojo.hitch(this, function(cfg) {
                //on success create window
                this.create(cfg);
                //air.Introspector.Console.log(cfg);
            }),
            error: function(error) {
                //TODO create new config?
            }
        });
    }
});

