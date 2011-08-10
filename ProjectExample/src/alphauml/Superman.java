/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package alphauml;

import cars.Batmobil;

/**
 * @umlTitle AlphaUML Example
 * @umlPos x:230 y:276
 * @author MasterLinux
 */
public class Superman implements Hero {
    private Batmobil car = new Batmobil();
    public String name = "Superman";

    public void showPower() {
        //do something!
    }

    public void sleep() {
        //go to bed
    }

    public int numberOfHeroicDeeds() {
        return 20;
    }
    
    public void showCar() {
        this.car.openDoor(3);
    }
    
}
