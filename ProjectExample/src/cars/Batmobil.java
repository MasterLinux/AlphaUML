/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package cars;

/**
 * It's a batmobil!!
 * 
 * @umlTitle AlphaUML Example
 * @umlPos x:715 y:482
 * @umlNotePos x:953 y:466
 * @since 1.0
 * @author MasterLinux
 */
public class Batmobil extends Car {
    
    /**
     * constructor
     */
    public Batmobil() {
        this.startEngine();
    }
    
    /**
     * overwritten superclass method
     * @see superclass method
     */
    public void startEngine() {
        super.startEngine();
        System.out.println("Batmobil can now be driven!");
    }
}
