/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.FileBrowser");
dojo.require("ui.Object");
dojo.require("ui.util.Size");

dojo.declare("ui.FileBrowser", ui.Object, {
    folder: null,
    files: null,
    path: null,

    constructor: function(args) {
        args = args || {};
        this.path = args.path;
    },

    create: function() {
        var file = new air.File(this.path);
        this.getDirectory(file);

        air.Introspector.Console.log(this.folder);

        this.folder.create("main");
    },

    /**
     * creates an object with each info
     * about the given file btw. folder
     * {
     *  root: {
     *
     *  }
     * }
     * @param file air.File
     * @param folder object
     */
            /*
    getDirectory: function(file, folder) {
        if(!this.files) this.files = {};

        //create root directory
        var rootName = this.getFileName(file);
        if(!this.files[rootName]) this.files[rootName] = {
            name: rootName,
            type: "folder",
            url: file.url,
            files: {}
        };

        //set root folder if folder isn't set
        if(!folder) folder = this.files[rootName];

        //get list of files
        var fileList = file.getDirectoryListing();

        //read file list and add it into the files object
        dojo.forEach(fileList, dojo.hitch(this, function(f, index) {
            var fileName = this.getFileName(f);

            if(f.isDirectory) {
                //create new folder
                folder.files[fileName] = {
                    name: this.getFileName(f),
                    type: "folder",
                    url: f.url,
                    files: {}
                };
                
                this.getDirectory(f, folder.files[fileName]);
            }
            else {
                //add file into folder
                folder.files[fileName] = {
                    name: fileName,
                    url: f.url,
                    type: this.getFileType(f)
                }
            }
        }));
    }, */

    getDirectory: function(file, folder, index) {
        if(!index) index = 0;
        
        //create root directory
        if(!this.folder) this.folder = new ui.Folder({
            name: this.getFileName(file),
            path: file.url,
            index: index
        });

        //set root folder if folder isn't set
        if(!folder) folder = this.folder;

        //get list of files
        var fileList = file.getDirectoryListing();

        //read file list and add it into the files object
        dojo.forEach(fileList, dojo.hitch(this, function(f) {
            var fileName = this.getFileName(f);

            if(f.isDirectory) {
                var newIndex = index + 1;
                
                //create new folder
                var newFolder = new ui.Folder({
                    index: newIndex,
                    name: fileName,
                    path: f.url
                });

                //add folder into the parent folder
                folder.addFolder(newFolder);

                //recursive
                this.getDirectory(f, newFolder, newIndex);
            }
            else {
                //create new file
                var newFile = new ui.File({
                    type: this.getFileType(f),
                    index: folder.index,
                    name: fileName,
                    path: f.url
                });

                //add file into folder
                folder.addFile(newFile);
            }
        }));
    },

    getFileName: function(file) {
        //get file url
        var url = file.url.split("/");

        //return the name
        return url[url.length-1];
    },

    getFileType: function(file) {
        //get file name
        var name = this.getFileName(file).split(".");

        //return file type
        return name[name.length-1];
    }
});

/**
 * folder data type
 */
dojo.declare("ui.Folder", ui.Object, {
    sizeUtil: null,
    name: null,
    path: null,
    type: null,
    index: null,
    files: null,
    folder: null,
    iconId: null,
    titleId: null,
    folderId: null,
    childrenId: null,
    expandBtnId: null,
    childrenTreeId: null,
    isOpen: null,
    height: null,

    constructor: function(args) {
        this.sizeUtil = new ui.util.Size();
        this.index = args.index;
        this.name = args.name;
        this.path = args.path;
        this.type = "folder";
        this.isOpen = false;
        this.folder = [];
        this.files = [];
    },

    create: function(placeAt) {
        if(placeAt) this.placeAt = placeAt;

        //create unique id
        this.inherited(arguments);

        //create each necessary id
        this.iconId = this.htmlId + "Icon";
        this.titleId = this.htmlId + "Title";
        this.folderId = this.htmlId + "Folder";
        this.childrenId = this.htmlId + "Children";
        this.expandBtnId = this.htmlId + "ExpandBtn";
        this.childrenTreeId = this.htmlId + "ChildrenTree";

        //place folder
        dojo.place(
            '<ul class="tree" id="' + this.htmlId + '">' +
                '<li class="Folder" id="' + this.folderId + '">' +
                    '<div class="expand" id="' + this.expandBtnId + '"></div>' +
                    '<div class="icon" id="' + this.iconId + '"></div>' +
                    '<div class="title">' + this.name + '</div>' +
                '</li>' +
                '<li class="node" style="opacity: 0; display: none;" id="' + this.childrenId + '">' +
                    '<ul class="tree" id="' + this.childrenTreeId + '"></ul>' +
                '</li>' +
            '</ul>',
            dojo.byId(this.placeAt)
        );

        //TODO create event listener
        this.connect({
            name: "FolderClick",
            nodeId: this.expandBtnId,
            event: "onclick",
            method: function() {
                //close folder
                if(this.isOpen) this.close();
                //open folder
                else this.open();
            }
        });

        this.connect({
            name: "FolderDblClick",
            nodeId: this.iconId,
            event: "ondblclick",
            method: function() {
                //close folder
                if(this.isOpen) this.close();
                //open folder
                else this.open();
            }
        });

        //create folder
        dojo.forEach(this.folder, dojo.hitch(this, function(f) {
            f.create(this.childrenTreeId);
        }));

        //create files
        dojo.forEach(this.files, dojo.hitch(this, function(f) {
            f.create(this.childrenTreeId);
        }));
    },

    open: function(duration) {
        duration = (typeof duration == "number") ? duration : 300;
        this.isOpen = true;

        dojo.removeClass(this.expandBtnId, "expand");
        dojo.addClass(this.expandBtnId, "fold");

        this.show(300, this.childrenId);

        /*
        //animate fade animation
        dojo.animateProperty({
            node: this.childrenId,
            duration: 300,
            properties: {
                height: {
                    start: "0%",
                    end: "100%"
                }
            }
        }).play();*/
    },

    close: function(duration) {
        duration = (typeof duration == "number") ? duration : 300;
        this.isOpen = false;

        dojo.removeClass(this.expandBtnId, "fold");
        dojo.addClass(this.expandBtnId, "expand");

        this.hide(300, this.childrenId);

        /*
        //get list height
        this.height = this.sizeUtil.height(this.childrenId);

        //animate fade animation
        dojo.animateProperty({
            node: this.childrenId,
            duration: 300,
            properties: {
                height: {
                    start: "100%",
                    end: "0%"
                }
            }
        }).play();*/
    },

    /**
     * adds a file into this folder
     * @param file ui.File
     */
    addFile: function(file) {
        this.files.push(file);
    },

    /**
     * adds a folder into this folder
     * @param folder ui.Folder
     */
    addFolder: function(folder) {
        this.folder.push(folder);
    },

    getHeight: function() {
        return this.sizeUtil.height(this.folderId);
    }
});

/**
 * file data type
 */
dojo.declare("ui.File", ui.Object, {
    sizeUtil: null,
    index: null,
    name: null,
    path: null,
    type: null,
    iconId: null,
    titleId: null,

    constructor: function(args) {
        this.sizeUtil = new ui.util.Size();
        this.index = args.index;
        this.name = args.name;
        this.path = args.path;
        this.type = args.type;
    },

    create: function(placeAt) {
        if(placeAt) this.placeAt = placeAt;

        //create unique id
        this.inherited(arguments);

        //create each necessary id
        this.iconId = this.htmlId + "Icon";
        this.titleId = this.htmlId + "Title";

        //place file
        dojo.place(
            '<li class="File" id="' + this.htmlId + '">' +
                '<div class="icon java"></div>' +
                '<div class="title">' + this.name + '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );
    },

    getHeight: function() {
        return this.sizeUtil.height(this.htmlId);
    }
});
