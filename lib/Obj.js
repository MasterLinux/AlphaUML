/**
 *
 * User: MasterLinux
 * Date: 23.02.11
 * Time: 19:58
 *
 * TODO: method for destroy this object completely -> destroy()? and one for destroy only hmtl and events -> deactivate()?
 */

dojo.provide("lib.Obj");

dojo.declare("lib.Obj", null, {
    globalCat: null,
    placeAt: null,
    htmlId: null,
    connects: null,
    subscribes: null,
    isActivated: null,
    uiType: null,

    constructor: function(args) {
        this.isActivated = false;
        this.connects = {};
        this.subscribes = {};

        //parent-node id
        this.placeAt = args.placeAt;
    },

    /**
     * creates a unique id
     */
    create: function() {
        //creates unique htmlId
        this.htmlId = this.uniqueId();

        //TODO: subscribe(clearObjects) destroys each object -> this.destroy()
        this.subscribe({
            event: "DeleteObjects",
            lock: true,
            method: function() {
                //remove this completely
                this.destroy(true);
            }
        });
    },

    /**
     * stores reference of this object
     * into the window object
     * @param category string
     */
    setGlobal: function(category) {
        //if category isn't set use the class name as category
        this.globalCat = category || this.declaredClass;

        //create new prototype if doesn't exists
        if(!window.userInterface) {
            window["userInterface"] = {};
        }

        //create new category if necessary
        if(!window.userInterface[this.globalCat]) {
            window.userInterface[this.globalCat] = {};
        }

        //store this object
        window.userInterface[this.globalCat][this.htmlId] = this;
    },

    /**
     * removes this object from globals
     * @param category string
     */
    unsetGlobal: function(category) {
        category = category || this.globalCat;

        if(category && window.userInterface) {
            //get stored objects of the given category
            category = window.userInterface[category];

            //delete this object if registered as global
            if(category && category[this.htmlId]) {
                delete category[this.htmlId];
            }
        }
    },

    /**
     * gets a global stored ui object
     * @param category string
     * @param id string htmlId of the required object
     * @return the hole category with each object or the required object
     */
    getGlobal: function(category, id) {
        category = category || this.globalCat;

        //return each object of category if id isn't set
        if(!id) return window.userInterface[category];
        //otherwise return the required object
        else {
            var category = window.userInterface[category];
            return category[id];
        }
    },

    /**
     * destroys this object
     * @param del boolean delete this object completely from memory
     */
    destroy: function(del) {
        //disconnects event handler
        this.deactivate({force: true});

        //remove node if exists
        dojo.destroy(this.htmlId);

        //unset global
        this.unsetGlobal();

        //delete this object
        if(del) delete this;
    },

    /**
     * creates an unique identifier
     * @param step integer
     * @param obscure boolean
     * @returns {String} id
     */
    uniqueId: function(step, obscure) {
        //if step isn't set but obscure
        if(typeof step == "boolean") {
            obscure = step;
            step = undefined;
        }

        //declare params
        obscure = (obscure === undefined) ? false : obscure;
        step = (step === undefined) ? 5 : step;
        var counter = 0;

        //remove each dot in class string and convert it to lower case
        var declaredClass = this.declaredClass.replace(/\./g, "");
        declaredClass = declaredClass.toLowerCase();

        //encrypt class string
        var uniqueId = "";

        if(obscure) {
            //obscure class name
            for(var n=0; n<declaredClass.length; n++) {
                //get char of each position
                var asciiChar = declaredClass.charCodeAt(n);
                //convert to another char and store it
                asciiChar += step;
                if(asciiChar > 122) asciiChar -= 26;
                asciiChar = String.fromCharCode(asciiChar);
                //create new unique string
                uniqueId += asciiChar;
            }
        } else {
            //use class name as unique id
            uniqueId = declaredClass;
        }

        //count each dom-element of this class
        dojo.query('*[id*="' + uniqueId + '"]').forEach(
            dojo.hitch(this, function() {
                //increment counter
                counter++;
            })
        );

        //create and return unique id
        return uniqueId + counter;
    },

    /**
     * TODO: documentation
     * args: {
     *  name: string -> unique name of the event handler
     *  node: object -> the source object for the event function
     *  event: string -> name of the event function like "onclick"
     *  context: object ->
     *  method: function ->
     *  lock: boolean -> if it is locked it can't deactivated
     * }
     * @param args
     */
    connect: function(args) {
        var name = args.name;
        var node = args.node;
        var event = args.event;
        var context = args.context;
        var method = args.method;
        var lock = args.lock || false;

        //set context if it isn't set
        if(!context) context = this;

        //if name doesn't set use event as name
        if(!name) name = event;

        //if name already registered in this.connects or this.subscribes break
        if(this.subscribes[name] || this.connects[name]) return;
        //TODO log if an event-name is registered twice

        //create a new event handler
        this.connects[name] = {
            handler: dojo.connect(node, event, context, method),
            isActive: true,
            name: name,
            node: node,
            event: event,
            context: context,
            method: method,
            lock: lock
        };
    },

    /**
     * TODO: documentation
     * @param args
     * lock: boolean -> if it is locked it can't deactivated
     */
    subscribe: function(args) {
        var name = args.name;
        var event = args.event;
        var context = args.context;
        var method = args.method;
        var lock = args.lock || false;

        //set context if it isn't set
        if(!context) context = this;

        //if name doesn't set use event as name
        if(!name) name = event;

        //if name already registered in this.connects or this.subscribes break
        if(this.subscribes[name] || this.connects[name]) return;
        //TODO log if an event-name is registered twice

        //create a new event handler
        this.subscribes[name] = {
            handler: dojo.subscribe(event, dojo.hitch(context, method)),
            isActive: true,
            name: name,
            event: event,
            context: context,
            method: method,
            lock: lock
        };
    },

    /**
     * connects and subscribe each
     * registered event handler
     */
    activate: function(name) {
        this.isActivated = true;

        if(name && this.connects[name]) {
            //activate if it isn't active
            if(!this.connects[name].isActive) {
                //activate it
                this.connects[name].isActive = true;

                //create new event handler
                this.connects[name].handler = dojo.connect(
                    this.connects[name].node,
                    this.connects[name].event,
                    this.connects[name].context,
                    this.connects[name].method
                );
            }
        } else if(name && this.subscribes[name]) {
            //activate if it isn't active
            if(!this.subscribes[name].isActive) {
                //activate it
                this.subscribes[name].isActive = true;

                //create new event handler
                this.subscribes[name].handler = dojo.subscribe(
                    this.subscribes[name].event,
                    dojo.hitch(
                        this.subscribes[name].context,
                        this.subscribes[name].method
                    )
                );
            }
        } else if(name) {
            //handler not found
            //TODO: log this error
            return;
        } else {
            //activate each inactive handler
            for(var handler in this.connects) {
                if(!this.connects[handler].isActive) {
                    //activate it
                    this.connects[handler].isActive = true;

                    //create new event handler
                    this.connects[handler].handler = dojo.connect(
                        this.connects[handler].node,
                        this.connects[handler].event,
                        this.connects[handler].context,
                        this.connects[handler].method
                    );
                }
            }

            //activate each inactive handler
            for(var handler in this.subscribes) {
                if(!this.subscribes[handler].isActive) {
                    //activate it
                    this.subscribes[handler].isActive = true;

                    //create new event handler
                    this.subscribes[handler].handler = dojo.subscribe(
                        this.subscribes[handler].event,
                        dojo.hitch(
                            this.subscribes[handler].context,
                            this.subscribes[handler].method
                        )
                    );
                }
            }
        }
        
    },

    /**
     * unsubscribes and disconnects
     * each registered event handler
     */
    deactivate: function(args) {
        if(!args) args = {};
        var name = args.name;
        var force = args.force || false;
        this.isActivated = false;

        console.debug("force: " + force);
        
        if(name && this.connects[name]) {
            //disconnect specific handler
            if(!this.connects[name].lock || force) {
                //deactivate it
                this.connects[name].isActive = false;
                //disconnect it
                dojo.disconnect(this.connects[name].handler);
                this.connects[name].handler = null;
            }
        } else if(name && this.subscribes[name]) {
            //unsubscribe specific handler
            if(!this.subscribes[name].lock || force) {
                //deactivate it
                this.subscribes[name].isActive = false;
                //unsubscribe it
                dojo.unsubscribe(this.subscribes[name].handler);
                this.subscribes[name].handler = null;
            }
        } else if(name) {
            //handler not found
            //TODO: log this error
            return;
        } else {
            //disconnect each handler
            for(var handler in this.connects) {
                if(!this.connects[handler].lock || force) {
                    //deactivate it
                    this.connects[handler].isActive = false;
                    //disconnect it
                    dojo.disconnect(this.connects[handler].handler);
                    this.connects[handler].handler = null;
                }
            }

            //unsubscribe each handler
            for(var handler in this.subscribes) {
                if(!this.subscribes[handler].lock || force) {
                    //deactivate it
                    this.subscribes[handler].isActive = false;
                    //unsubscribe it
                    dojo.unsubscribe(this.subscribes[handler].handler);
                    this.subscribes[handler].handler = null;
                }
            }
        }
    }
});
