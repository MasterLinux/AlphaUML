/**
 * User: Christoph Grundmann
 * Date: 27.07.11
 * Time: 19:17
 *
 */
dojo.provide("lib.Config");
dojo.require("ui.Object");

dojo.declare("lib.Config", ui.Object, {
    //program paths
    javac: null,
    javadoc: null,

    //window properties
    windowHeight: null,
    windowWidth: null,

    //JavaDoc info
    ignore: null,
    main: null,
    root: null,

    constructor: function(args) {
        args = args || {};
        this.ignore = args.ignore;
        this.main = args.main;
        this.root = args.root;

        //program paths
        this.javac = args.javac;
        this.javadoc = args.javadoc;

        //listen for window close event
        if(air) {
            window.nativeWindow.addEventListener(air.Event.CLOSING,
                dojo.hitch(this, function() {
                    this.store();
                })
            );
        }

        //this.javac = "C:\\Programme\\Java\\jdk1.6.0_25\\bin\\";
    },

    /**
     * stores each configuration into the config json
     */
    store: function() {
        var projectPath = null;
        var fileTree = this.getGlobal("filetree", null, "master");
        if(fileTree) projectPath = fileTree.getProjectPath(true);

        var config = {
            resolution: {
                width: window.nativeWindow.width,
                height: window.nativeWindow.height
            },
            frames: {
                leftWidth: _window.leftWidth,
                bottomHeight: _window.bottomHeight
            },
            javac: this.javac || null,
            javadoc: this.javadoc || null,
            project: projectPath
        };

        //convert to string
        config = dojo.toJson(config);

        //get currently open file
        var file = air.File.applicationDirectory;
        file = file.resolvePath("config.json");
        file = new air.File(file.nativePath);

        //create a new file stream
        var fileStream = new air.FileStream();

        //open a new file stream
        fileStream.open(file, air.FileMode.WRITE);

        //write new source into stream
        fileStream.writeUTFBytes(config);

        //close file
        fileStream.close();
    }
});