/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.FileTree");
dojo.require("ui.Object");
dojo.require("ui.util.Size");

dojo.declare("ui.FileTree", ui.Object, {
    folder: null,
    path: null,

    constructor: function(args) {
        args = args || {};
        this.path = args.path;
    },

    /**
     * creates the file tree from
     * the given file path
     */
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
    },

    /**
     * destroys the file tree
     */
    destroy: function() {
        this.folder.destroy();
        this.inherited(arguments);
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
                    '<div class="title" id="' + this.titleId + '">' + this.name + '</div>' +
                '</li>' +
                '<li class="node" style="opacity: 0; display: none;" id="' + this.childrenId + '">' +
                    '<ul class="tree" id="' + this.childrenTreeId + '"></ul>' +
                '</li>' +
            '</ul>',
            dojo.byId(this.placeAt)
        );

        //TODO create event listener
        this.connect({
            name: "FolderClickIcon",
            nodeId: this.iconId,
            event: "onclick",
            method: function() {
                this.select(true);
            }
        });

        this.connect({
            name: "FolderClickTitle",
            nodeId: this.titleId,
            event: "onclick",
            method: function() {
                this.select(true);
            }
        });

        this.connect({
            name: "ExpandFolderClick",
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

        this.connect({
            name: "TitleDblClick",
            nodeId: this.titleId,
            event: "ondblclick",
            method: function() {
                //close folder
                if(this.isOpen) this.close();
                //open folder
                else this.open();
            }
        });

        this.subscribe({
            event: "FileTreeEntrySelected",
            method: function(event) {
                //deselect other file entries
                if(this.htmlId != event.nodeId) {
                    this.select(false);
                }
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
    },

    close: function(duration) {
        duration = (typeof duration == "number") ? duration : 300;
        this.isOpen = false;

        dojo.removeClass(this.expandBtnId, "fold");
        dojo.addClass(this.expandBtnId, "expand");

        this.hide(300, this.childrenId);
    },

    /**
     * selects a folder entry
     * @param select boolean selects(deselects) this entry if it's set to true(false)
     */
    select: function(select) {
        select = (typeof select == "boolean") ? !select : this.selected;
        this.selected = select;

        if(this.selected) {
            this.selected = false;
            dojo.removeClass(this.folderId, "selected");
        } else {
            this.selected = true;
            dojo.addClass(this.folderId, "selected");

            //throw FileTreeEntrySelected event
            dojo.publish("FileTreeEntrySelected", [{
                nodeId: this.htmlId
            }]);
        }
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
    selected: null,

    constructor: function(args) {
        this.sizeUtil = new ui.util.Size();
        this.selected = false;
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
                '<div class="icon" id="' + this.iconId + '"></div>' +
                '<div class="title" id="' + this.titleId + '">' + this.name + '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //add icon
        this.addIcon();

        //register event handler
        this.connect({
            name: "FileClick",
            nodeId: this.htmlId,
            event: "onclick",
            method: function() {
                this.select(true);
            }
        });

        this.connect({
            name: "FileDblClick",
            nodeId: this.htmlId,
            event: "ondblclick",
            method: function() {
                //TODO only java files can be opened
                if(this.type == "java") {
                    this.open();
                    air.trace("open: " + this.name);
                }
            }
        });

        this.subscribe({
            event: "FileTreeEntrySelected",
            method: function(event) {
                //deselect other file entries
                if(this.htmlId != event.nodeId) {
                    this.select(false);
                }
            }
        });
    },

    /**
     * selects a file entry
     * @param select boolean selects(deselects) this entry if it's set to true(false)
     */
    select: function(select) {
        select = (typeof select == "boolean") ? !select : this.selected;
        this.selected = select;
        
        if(this.selected) {
            this.selected = false;
            dojo.removeClass(this.htmlId, "selected");
        } else {
            this.selected = true;
            dojo.addClass(this.htmlId, "selected");

            //throw FileTreeEntrySelected event
            dojo.publish("FileTreeEntrySelected", [{
                nodeId: this.htmlId
            }]);
        }
    },

    /**
     * throws an FileOpen event
     */
    open: function() {
        //throw FileTreeEntrySelected event
        dojo.publish("FileOpen", [{
            nodeId: this.htmlId,
            name: this.name,
            path: this.path,
            type: this.type
        }]);
    },

    /**
     * sets the file type icon
     * @param dataType string
     */
    addIcon: function(dataType) {
        dataType = dataType || this.type;

        //default icon
        var iconClass = "txt";

        //if it's a java file
        if(dataType == "java") {
            iconClass = "java";
        }

        //add css class
        dojo.addClass(this.iconId, iconClass);
    },

    /**
     * gets the height of the li element
     */
    getHeight: function() {
        return this.sizeUtil.height(this.htmlId);
    }
});