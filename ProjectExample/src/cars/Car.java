/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package cars;

/**
 * class descibes a car
 * @umlTitle AlphaUML Example
 * @umlPos x:843 y:214
 * @umlNotePos x:1140 y:313 
 * @author MasterLinux
 */
public class Car {
    protected boolean isStarted = false;
    protected String name = "Car";
    protected int wheels = 4;
    
    public void startEngine() {
        this.isStarted = true;
        System.out.println("Engine started.");
    }
    
    /**
     * opens a specific door
     * @param doorId id of the door which has to be opened
     */
    public void openDoor(int doorId) {
        //open door
    }
}
