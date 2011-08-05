/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package alphaumlsample;

import alphauml.File;
import java.util.ArrayList;

/**
 *
 * @author MasterLinux
 */
public class Convention {
    public ArrayList<Nerd> nerds;
    
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
        
        File file = new File();
        output += file.path;
              
        return output;
    }
}
