/**
 * User: Christoph Grundmann
 * Date: 23.05.11
 * Time: 18:03
 *
 */
dojo.provide("ui.util.Node");

//TODO rename it to Node.js
dojo.declare("ui.util.Node", null, {
    /**
     * calculates the width of a node
     * @param nodeId string
     * @return integer
     */
    width: function(nodeId) {
        //get node by id
        var node = dojo.byId(nodeId);

        //calculate width and return it
        if(node) return dojo.style(node, "width") +
                        dojo.style(node, "marginLeft") +
                        dojo.style(node, "marginRight") +
                        dojo.style(node, "paddingLeft") +
                        dojo.style(node, "paddingRight");

        //node doesn't exists
        else return false;
    },

    /**
     * calculates the height of a node
     * @param nodeId string
     * @return integer
     */
    height: function(nodeId) {
        //get node by id
        var node = dojo.byId(nodeId);

        //calculate height and return it
        if(node) return dojo.style(node, "height") +
                        dojo.style(node, "marginTop") +
                        dojo.style(node, "marginBottom") +
                        dojo.style(node, "paddingTop") +
                        dojo.style(node, "paddingBottom");

        //node doesn't exists
        else return false;
    },

    /**
     * sets the size of a node
     * @param node string|node
     * @param width integer optional
     * @param height integer optional
     */
    setSize: function(node, width, height) {
        var node = (typeof node == "string")? dojo.byId(node) : node;
        if(width) dojo.style(node, "width", width + "px");
        if(height) dojo.style(node, "height", height + "px");
    },

    /**
     * sets the position of a node
     * @param node string|node
     * @param x integer optional
     * @param y integer optional
     */
    setPosition: function(node, x, y) {
        var node = (typeof node == "string")? dojo.byId(node) : node;
        if(x) dojo.style(node, "left", x + "px");
        if(y) dojo.style(node, "top", y + "px");
    },

    /**
     * gets the position of
     * the origin of a node
     * @param node string|node
     * @return vector
     */
    getOrigin: function(node) {
        var node = (typeof node == "string")? dojo.byId(node) : node;
        var pos = dojo.position(node);

        return {
            x: pos.x + pos.w/2,
            y: pos.y + pos.h/2
        }
    }
});