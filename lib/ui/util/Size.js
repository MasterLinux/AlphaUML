/**
 * User: Christoph Grundmann
 * Date: 23.05.11
 * Time: 18:03
 *
 */
dojo.provide("ui.util.Size");

dojo.declare("ui.util.Size", null, {
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
    }
});