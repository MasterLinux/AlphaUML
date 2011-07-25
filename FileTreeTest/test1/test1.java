/**
 * @(#)Blah.java        1.82 99/03/18
 *
 * Copyright (c) 1994-1999 Sun Microsystems, Inc.
 * 901 San Antonio Road, Palo Alto, California, 94303, U.S.A.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of Sun
 * Microsystems, Inc. ("Confidential Information").  You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Sun.
 @param sw wewe
 */

//test test test test
public class Audi implements Car {
    /** A class implementation comment can go here. */
    private int maxKmh = 320;
    private String name = "Audi R8";
    private boolean needsFuel;
    private Wheel wheel;

    /** 
     * ...constructor Blah documentation comment...
     */
    public abstract Audi() {
        this.needsFuel = true;
    }

    /**
     * ...method doSomething documentation comment...
     */
    public int currentSpeed() {
        // ...implementation goes here... 
    }

    /**
     * ...method doSomethingElse documentation comment...
     * @since 1.5
     * @throws wusaClass descriptionsss
     * @exception wusa2Class sjdksdjskdjsk
     * @param someParam description
     * @param superDude lets have pfun!
     * @return that's a return description
     */
    public void openDoors(static Door<DoorType>[] doors, int angle) {
        // ...implementation goes here... 
    }
}
