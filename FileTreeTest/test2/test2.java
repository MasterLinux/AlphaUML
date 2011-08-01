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
 * @umlPos x:150 y:350
 */
public interface Car {
    /** A class implementation comment can go here. */
    public int maxKmh;
    public String name;
    public boolean needsFuel;

    /**
     * ...method doSomething documentation comment...
     */
    public abstract int currentSpeed(){}

    /**
     * ...method doSomethingElse documentation comment...
     * @since 1.5
     * @throws wusaClass descriptionsss
     * @exception wusa2Class sjdksdjskdjsk
     * @param someParam description
     * @param superDude lets have pfun!
     * @return that's a return description
     */
    public abstract void openDoors(static Door<DoorType>[] doors, int angle);
}
