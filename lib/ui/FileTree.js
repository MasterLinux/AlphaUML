/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.FileTree");
dojo.require("ui.Object");
dojo.require("ui.util.Node");
dojo.require("ui.content.Editor");
dojo.require("ui.tools.Editor");
dojo.require("ui.ContextMenu");
dojo.require("ui.Dialog");
dojo.require("ui.dialog.NewFile");
dojo.require("ui.dialog.NewDirectory");
dojo.require("ui.Language");

//TODO remove
//dojo.require("ui.Tools");

dojo.declare("ui.FileTree", ui.Object, {
    _updateOpenDirectories: null,
    _updateIgnoredFiles: null,
    defaultProject: null,
    javaFiles: null,
    folder: null,
    path: null,
    file: null,

    constructor: function(args) {
        args = args || {};
        this.path = args.path;
        this.file = args.file;
        this.id = args.id;
        this.defaultProject = "ProjectExample/";
    },

    /**
     * creates the file tree from
     * the given file path
     */
    create: function() {
        this.inherited(arguments);

        var file = null;
        
        //store file tree global
        this.setGlobal("filetree");

        if(!this.file && this.path) {
            file = new air.File(this.path);
        } else if(!this.file && !this.path) {
            file = air.File.applicationDirectory;
            file = file.resolvePath(this.defaultProject);
        } else if(this.file) {
            file = this.file.resolvePath(this.defaultProject);
        }

        this.getDirectory(file);

        //create folder
        this.createView();

        //listen for update events
        this.subscribe({
            event: "FileTreeUpdated",
            method: function() {
                this.update();
            }
        });
    },

    /**
     * creates each file and folder
     */
    createView: function() {
        if(this.folder) this.folder.create(this.placeAt);
    },

    /**
     * gets the file path of the current opened project
     */
    getProjectPath: function(native) {
        if(this.folder) {
            if(!native) return this.folder.path;
            else return this.folder.nativePath;
        } else {
            return null;
        }
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
    getDirectory: function(file, folder, index, isUpdate) {
        if(!index) index = 0;
        file = file || this.file;

        //clear current file tree
        if(index === 0) {
            //clear old java files
            this.javaFiles = [];

            //remove folder and files
            if(this.folder) this.folder.destroy(true);
            this.folder = null;

            //store file
            this.file = file;
        }
        
        //create root directory
        if(!this.folder) this.folder = new ui.Folder({
            nativePath: file.nativePath.replace(/\\/g, "/"),
            name: this.getFileName(file),
            path: file.url,
            index: index
        });

        if(!folder) {
            //set root folder if folder isn't set
            folder = this.folder;

            //open folder if it's an update and necessary
            if(isUpdate && this._updateOpenDirectories[folder.nativePath]) {
                folder.isOpen = true;
            }
        }

        //get list of files
        var fileList = file.getDirectoryListing();

        //read file list and add it into the files object
        dojo.forEach(fileList, dojo.hitch(this, function(f) {
            var fileName = this.getFileName(f);

            if(f.isDirectory) {
                var newIndex = index + 1;
                
                //create new folder
                var newFolder = new ui.Folder({
                    nativePath: f.nativePath.replace(/\\/g, "/"),
                    index: newIndex,
                    name: fileName,
                    path: f.url
                });

                //add folder into the parent folder
                folder.addFolder(newFolder);

                //init folder as opened
                if(isUpdate && this._updateOpenDirectories[newFolder.nativePath]) {
                    newFolder.isOpen = true;
                }

                //recursive
                this.getDirectory(f, newFolder, newIndex, isUpdate);
            }
            else {
                //create new file
                var newFile = new ui.File({
                    nativePath: f.nativePath.replace(/\\/g, "/"),
                    type: this.getFileType(f),
                    index: folder.index,
                    name: fileName,
                    path: f.url
                });

                //catch java files
                if(newFile.type == "java") {
                    this.javaFiles.push(newFile);
                }

                //init file as ignored
                if(isUpdate && this._updateIgnoredFiles[newFile.nativePath]) {
                    newFile.isIgnored = true;
                }

                //add file into folder
                folder.addFile(newFile);
            }
        }));
    },

    /**
     * creates a new folder
     * @param name
     * @param path
     */
    createDirectory: function(name, path) {
        path = path || this.getProjectPath();
        var folder = new air.File(path + "/" + name);
        if(!folder.exists) {
            folder.createDirectory();
            return folder;
        } else {
            return false;
        }
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
     * gets each java file
     * of the opened project
     * @param ignored boolean if true all java files, which have to be ignored will be returned
     * @returns array of java file paths
     */
    getJavaFiles: function(native, ignored) {
        ignored = typeof ignored == "boolean" ? ignored : false;
        native = typeof native == "boolean" ? native : false;

        var _files = [];
        dojo.forEach(this.javaFiles, dojo.hitch(this, function(file) {
            var path = native ? file.nativePath : file.path;
            if(ignored && file.isIgnored) _files.push(path);
            else if(!ignored && !file.isIgnored) _files.push(path);
        }));

        return _files;
    },

    /**
     * destroys the file tree
     */
    destroy: function() {
        this.folder.destroy(true);
        this.inherited(arguments);
    },

    /**
     * sets the size of the tree
     * @param width
     * @param height
     */
    setSize: function(width, height) {
        this.folder.setSize(width, height);
    },

    /**
     * updates the current file tree
     */
    update: function() {
        this._updateOpenDirectories = {};
        this._updateIgnoredFiles = {};

        //get all necessary info to update the tree
        this.folder.iterate(
            //get open directories
            dojo.hitch(this, function(folder) {
                if(folder.isOpen) this._updateOpenDirectories[folder.nativePath] = true;
            }),
            //get ignored files
            dojo.hitch(this, function(file) {
                if(file.isIgnored) this._updateIgnoredFiles[file.nativePath] = true;
            })
        );

        //updates the current folder index
        this.getDirectory(null, null, null, true);
        //create new file tree
        this.createView();
    }
});

/**
 * folder data type
 */
dojo.declare("ui.Folder", ui.Object, {
    nativePath: null,
    nodeUtil: null,
    dialog: null,
    menu: null,
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
    language: null,
    isOpen: null,
    height: null,

    constructor: function(args) {
        this.nodeUtil = new ui.util.Node();
        this.nativePath = args.nativePath;
        this.language = new ui.Language();
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
                    '<div class="inner">' +
                        '<div class="expand" id="' + this.expandBtnId + '"></div>' +
                        '<div class="icon" id="' + this.iconId + '"></div>' +
                        '<div class="title" id="' + this.titleId + '">' + this.name + '</div>' +
                    '</div>' +
                '</li>' +
                '<li class="node" style="opacity: 0; display: none;" id="' + this.childrenId + '">' +
                    '<ul class="tree" id="' + this.childrenTreeId + '"></ul>' +
                '</li>' +
            '</ul>',
            dojo.byId(this.placeAt)
        );

        //air.Introspector.Console.log("test");

        //create context menu
        this.menu = new ui.ContextMenu({
            title: "Folder Menu",
            buttons: [
                {
                    title: "New Java File",
                    onClick: dojo.hitch(this, function(event) {
                        if(!this.dialog) {
                            this.dialog = new ui.dialog.NewFile({
                                title: "Create New Java File",
                                fileContent: null,
                                dataType: "java",
                                folder: this,
                                onDestroy: dojo.hitch(this, function() {
                                    //set instance var to null
                                    this.dialog = null;
                                })
                            });
                            this.dialog.create();
                        } else {
                            this.dialog.select(true);
                        }
                    })
                },
                {
                    title: "New Txt File",
                    onClick: dojo.hitch(this, function(event) {
                        if(!this.dialog) {
                            this.dialog = new ui.dialog.NewFile({
                                title: "Create New Txt File",
                                fileContent: null,
                                dataType: "txt",
                                folder: this,
                                onDestroy: dojo.hitch(this, function() {
                                    //set instance var to null
                                    this.dialog = null;
                                })
                            });
                            this.dialog.create();
                        } else {
                            this.dialog.select(true);
                        }
                    })
                },
                {
                    title: "New Directory",
                    onClick: dojo.hitch(this, function(event) {
                        if(!this.dialog) {
                            this.dialog = new ui.dialog.NewDirectory({
                                title: "Create New Directory",
                                folder: this,
                                onDestroy: dojo.hitch(this, function() {
                                    //set instance var to null
                                    this.dialog = null;
                                })
                            });
                            this.dialog.create();
                        } else {
                            this.dialog.select(true);
                        }
                    })
                },
                {
                    title: "Delete Directory",
                    onClick: dojo.hitch(this, function(event) {
                        if(!this.dialog) {
                            this.dialog = new ui.Dialog({
                                title: "Delete Directory (" + this.name + ")",
                                onApprove: dojo.hitch(this, function() {
                                    //removes folder with content
                                    this.removeDirectory(true);
                                }),
                                onDestroy: dojo.hitch(this, function() {
                                    //set instance var to null
                                    this.dialog = null;
                                })
                            });
                            this.dialog.create();

                            this.dialog.addContent(
                                this.language.WARNING,
                                '<div class="warning">' + this.language.REMOVE_FOLDER + '</div>'
                            );
                        } else {
                            this.dialog.select(true);
                        }
                    })
                }
            ]
        });

        this.menu.create();
        this.menu.register([this.iconId]);

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

        //open folder if necessary
        if(this.isOpen) this.open();
    },

    destroy: function(del) {
        if(this.menu) this.menu.destroy(true);
        if(this.dialog) this.dialog.close();
        
        //create folder
        dojo.forEach(this.folder, dojo.hitch(this, function(f) {
            f.destroy(true);
        })); this.folder = [];

        //create files
        dojo.forEach(this.files, dojo.hitch(this, function(f) {
            f.destroy(true);
        })); this.files = [];

        this.inherited(arguments);
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
     * creates a file in this folder
     * @param name string for example "test.java"
     * @param content string the document's content
     */
    createFile: function(name, content) {
        content = content || "";

        //get file
        var file = new air.File(this.nativePath + "/" + name);

        //create new file if doesn't exists
        if(!file.exists) {
            //select file
            file = new air.File(file.nativePath);

            //create a new file stream
            var fileStream = new air.FileStream();

            //open a new file stream
            fileStream.open(file, air.FileMode.WRITE);

            //write new source into stream
            fileStream.writeUTFBytes(content);

            //close file
            fileStream.close();

            //update the file tree
            dojo.publish("FileTreeUpdated");
        }
    },

    /**
     * creates a new folder
     * @param name
     * @param path
     */
    createDirectory: function(name) {
        var folder = new air.File(this.nativePath + "/" + name);
        if(!folder.exists) {
            folder.createDirectory();

            //update the file tree
            dojo.publish("FileTreeUpdated");
        }
    },

    /**
     * removes this folder
     * @param withContent if true a folder with content will also be removed
     */
    removeDirectory: function(withContent) {
        var folder = new air.File(this.nativePath);
        if(folder.exists) {
            folder.deleteDirectory(withContent);
            //update the file tree
            dojo.publish("FileTreeUpdated");
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
        return this.nodeUtil.height(this.folderId);
    },

    /**
     * sets the size of the tree
     * @param width
     * @param height
     */
    setSize: function(width, height) {
        this.nodeUtil.setSize(this.htmlId, width, height);
    },

    /**
     * iterates the folder and executes
     * its specific folder and file functions
     * @param folderFunc(folder)
     * @param fileFunc(file)
     */
    iterate: function(folderFunc, fileFunc) {
        if(folderFunc) folderFunc(this);
        dojo.forEach(this.folder, dojo.hitch(this, function(folder) {
            if(folderFunc) folderFunc(folder);
            folder.iterate(folderFunc, fileFunc);
        }));

        dojo.forEach(this.files, dojo.hitch(this, function(file) {
            if(fileFunc) fileFunc(file);
        }));
    }
});

/**
 * file data type
 */
dojo.declare("ui.File", ui.Object, {
    nativePath: null,
    nodeUtil: null,
    index: null,
    name: null,
    path: null,
    type: null,
    iconId: null,
    titleId: null,
    selected: null,
    isIgnored: null,
    language: null,
    dialog: null,
    menu: null,

    constructor: function(args) {
        this.nodeUtil = new ui.util.Node();
        this.language = new ui.Language();
        this.selected = false;
        this.isIgnored = args.ignore || false;
        this.nativePath = args.nativePath;
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
                '<div class="inner">' +
                    '<div class="icon" id="' + this.iconId + '"></div>' +
                    '<div class="title" id="' + this.titleId + '">' + this.name + '</div>' +
                '</div>' +
            '</li>',
            dojo.byId(this.placeAt)
        );

        //add icon
        this.addIcon();

        //menu buttons
        var buttons = null;

        //button for deleting the file
        var deleteFileBtn = {
            title: "Delete File",
            onClick: dojo.hitch(this, function(event) {
                if(!this.dialog) {
                    this.dialog = new ui.Dialog({
                        title: "Delete File (" + this.name + ")",
                        onApprove: dojo.hitch(this, function() {
                            //removes file
                            this.removeFile();
                        }),
                        onDestroy: dojo.hitch(this, function() {
                            //set instance var to null
                            this.dialog = null;
                        })
                    });
                    this.dialog.create();

                    this.dialog.addContent(
                        this.language.WARNING,
                        '<div class="warning">' + this.language.REMOVE_FILE + '</div>'
                    );
                } else {
                    this.dialog.select(true);
                }
            })
        };

        if(this.type == "java") {
            buttons = [
                {
                    title: dojo.hitch(this, function() {
                        if(this.isIgnored) return "Approve Java File";
                        else return "Ignore Java File"
                    }),
                    onClick: dojo.hitch(this, function(event) {
                        this.ignore();
                    })
                },
                deleteFileBtn
            ];
        } else {
            buttons = [deleteFileBtn];
        }

        //create context menu
        this.menu = new ui.ContextMenu({
            title: "File Menu",
            buttons: buttons
        });

        this.menu.create();
        this.menu.register([this.iconId]);

        /*
        //ignore file
        this.connect({
            name: "FileIgnore",
            nodeId: this.iconId,
            event: "onclick",
            method: function() {
                //TODO ignore and permit tooltip?
                this.ignore();
            }
        });

        //hover icon
        this.connect({
            name: "FileIconMouseOver",
            nodeId: this.iconId,
            event: "onmouseover",
            method: function() {
                this.hoverJavaIcon(true);
            }
        });
        this.connect({
            name: "FileIconMouseOut",
            nodeId: this.iconId,
            event: "onmouseout",
            method: function() {
                this.hoverJavaIcon(false);
            }
        });*/

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
     * destroys the file
     */
    destroy: function() {
        if(this.menu) this.menu.destroy(true);
        if(this.dialog) this.dialog.close();
        this.inherited(arguments);
    },

    /**
     * removes this file permanently
     */
    removeFile: function() {
        var file = new air.File(this.nativePath);
        if(file.exists) {
            //delete file
            file.deleteFile();

            //update the file tree
            dojo.publish("FileTreeUpdated");
        }
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
     * sets file as ignored. will be
     * ignored during the parsing and
     * compiling process if true
     * @param ignore
     */
    ignore: function(ignore) {
        ignore = typeof ignore == "boolean" ? ignore : !this.isIgnored;
        this.isIgnored = ignore;
        this.addIcon();
    },

    /**
     * throws an FileOpen event
     */
    open: function() {
        if(this.type == "java") {
            this.openJavaFile();
        }

        //throw FileTreeEntrySelected event
        dojo.publish("FileOpen", [{
            nodeId: this.htmlId,
            name: this.name,
            path: this.path,
            type: this.type
        }]);
    },

    /**
     * open java file in a tab
     */
    openJavaFile: function() {
        //get each opened tab
        var tab = this.getGlobal("tab");
        var tabExists = false;
        for(var id in tab) {
            //search for opened tab
            if(tab[id] && tab[id].content.filePath == this.path) {
                tabExists = true;
                tab = tab[id];
            }
        }

        //activate tab if exists
        if(tabExists) {
            tab.activate();
        }

        //create a new editor tab
        else {
            var editor = new ui.Tab({
                title: this.name,
                content: new ui.content.Editor(),
                menu: new ui.tools.Editor()
            });

            //get bottom frame
            var frame = this.getGlobal("frame", null, "bottom");

            if(frame) {
                //add tab into the bottom frame of the main win
                frame.tabBar.addTab(editor, true);

                //open java file
                editor.content.openFile({
                    nodeId: this.htmlId,
                    name: this.name,
                    path: this.path,
                    type: this.type
                });
            }
        }
    },

    /**
     * sets the file type icon
     * @param dataType string
     */
    addIcon: function(dataType) {
        var iconNode = dojo.byId(this.iconId);
        dataType = dataType || this.type;

        //default icon
        var iconClass = "txt";

        //if it's a java file
        if(dataType == "java" && !this.isIgnored) {
            iconClass = "java";
        } else if(dataType == "java" && this.isIgnored) {
            iconClass = "javaIgnored";
        }

        //add css class
        dojo.removeClass(iconNode, "txt");
        dojo.removeClass(iconNode, "java");
        dojo.removeClass(iconNode, "javaIgnored");
        dojo.addClass(iconNode, iconClass);
    },

    /**
     * hovers the icon
     */
    hoverJavaIcon: function(isHovered) {
        var iconClass, iconNode = dojo.byId(this.iconId);
        if(this.type == "java" && this.isIgnored && isHovered) {
            iconClass = "java";
        } else if(this.type == "java" && !this.isIgnored && isHovered) {
            iconClass = "javaIgnored";
        } else if(this.type == "java" && this.isIgnored && !isHovered) {
            iconClass = "javaIgnored";
        } else if(this.type == "java" && !this.isIgnored && !isHovered) {
            iconClass = "java";
        }

        dojo.removeClass(iconNode, "java");
        dojo.removeClass(iconNode, "javaIgnored");
        dojo.addClass(iconNode, iconClass);
    },

    /**
     * gets the height of the li element
     */
    getHeight: function() {
        return this.nodeUtil.height(this.htmlId);
    }
});
