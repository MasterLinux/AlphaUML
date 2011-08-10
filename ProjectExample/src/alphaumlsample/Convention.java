/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package alphaumlsample;

import alphauml.Hero;
import alphauml.Superman;
import java.util.ArrayList;

/**
 * @umlTitle AlphaUML Example
 * @umlPos x:428 y:44
 * @author MasterLinux
 */
public class Convention {
    public ArrayList<Nerd> nerds;
    private Hero superman; 
    
    public Convention() {
        this.nerds = new ArrayList<Nerd>();        
    }
    
    public void addNerd(String name, String gadget) {
        this.nerds.add(new Nerd(name, gadget));
    }
    
    public void startConvention() {
        this.addNerd("Sheldon Cooper", "physics");
        this.addNerd("The Terminator", "gun");
        this.addNerd("Austin Powers", "moyo");
    }
    
    public String getLoves() {
        String output = "";
        for(int i=0; i<this.nerds.size(); i++) {
            output += this.nerds.get(i).theNerdLoves() + "\n";
        }
        
        //create superman
        superman = new Superman();
        output += superman.name;
              
        return output;
    }
}
