/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package alphaumlsample;

/**
 *
 * @author MasterLinux
 */
public class AlphaUMLSample {    
    public static void main(String [ ] args) {
        Convention con = new Convention();
        con.startConvention();
        String loves = con.getLoves();
        System.out.println(loves);
    }
}
