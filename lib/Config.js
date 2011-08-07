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
                    this.write();
                })
            );
        }

        //this.javac = "C:\\Programme\\Java\\jdk1.6.0_25\\bin\\";
    },

    /**
     * stores each configuration into the config json
     * @param init boolean initializes config file if true
     * @param onSuccess function if init process is successful it will be executed
     */
    write: function(init, onSuccess) {
        var projectPath = null;
        var fileTree = this.getGlobal("filetree", null, "master");
        if(fileTree) projectPath = fileTree.getProjectPath(true);

        //get window properties
        var winWidth = window && window.nativeWindow ? window.nativeWindow.width : 1024;
        var winHeight = window && window.nativeWindow ? window.nativeWindow.height : 768;
        var leftWidth = _window ? _window.leftWidth : 180;
        var bottomHeight = _window ? _window.bottomHeight : 180;

        //set init values
        if(init) {
            winWidth = 1024;
            winHeight = 768;
            leftWidth = 180;
            bottomHeight = 180;
            projectPath = null;
        }
        
        var config = {
            resolution: {
                width: winWidth,
                height: winHeight
            },
            frames: {
                leftWidth: leftWidth,
                bottomHeight: bottomHeight
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

        //create file if it doesn't exists
        if(!file.exists) {
            //TODO create console output
        }

        //select file
        file = new air.File(file.nativePath);

        //create a new file stream
        var fileStream = new air.FileStream();

        //open a new file stream
        fileStream.open(file, air.FileMode.WRITE);

        //write new source into stream
        fileStream.writeUTFBytes(config);

        //close file
        fileStream.close();

        //init process successful
        if(init && onSuccess) this.read(onSuccess);
    },

    /**
     * reads the config file
     * @param onSuccess function which will be executed if the config file is be read successful
     */
    read: function(onSuccess) {
        dojo.xhrGet({
            url: "config.json",
            handleAs: "json",
            load: dojo.hitch(this, function(cfg) {
                //execute onSuccess function
                if(onSuccess && cfg) onSuccess(cfg);

                //if no file is found
                else if(!cfg) this.write(true, onSuccess);
            }),
            error: dojo.hitch(this, function(error) {
                if(air) air.trace(error);
            })
        });
    }
});