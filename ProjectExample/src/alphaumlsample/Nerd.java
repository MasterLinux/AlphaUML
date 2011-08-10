/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 */
package alphaumlsample;

/**
 * @umlTitle AlphaUML Example
 * @umlPos x:49 y:511
 * @author MasterLinux
 */
public class Nerd {
    private String name;
    private Gadget mobile;
    
    public Nerd(String name, String gadget) {
        this.name = name;
        this.mobile = new Gadget(gadget);
    }
    
    public String theNerdLoves() {
        return this.name + " loves his " + this.mobile.getGadget();
    }
}
