/**
 * User: Christoph Grundmann
 * Date: 12.06.11
 * Time: 15:06
 *
 * language file
 */
dojo.provide("ui.Language");

dojo.declare("ui.Language", null, {
    FILE_NOT_FOUND: "File or program couldn't found. Please check your project settings to solve this problem.",
    COMMAND_NOT_FOUND: "Command can't be executed, 'cause it doesn't exists. Please read the manual for more information.",
    EXECUTABLE_ERROR: "Executable error:",

    //processes
    PROCESS_EXECUTED: "Process executed",

    //buttons
    ADD_OPERATION_BTN: "Operations",
    ADD_ATTRIBUTE_BTN: "Attributes",

    //class diagram
    DIAGRAM_ADD_CLASS: "Place Class",
    DIAGRAM_ADD_GENERALIZATION_SUPER: "Select Superclass <br /> or Interface",
    DIAGRAM_ADD_GENERALIZATION_SUB: "Select Subclass <br /> or Interface",
    DIAGRAM_ADD_ASSOCIATION_FIRST: "Select Class",
    DIAGRAM_ADD_ASSOCIATION_SECOND: "Select Another Class", //"select another/same class",
    DIAGRAM_ADDBTN_GENERALIZATION: "1. Add Generalization or<br /> 2. Set Provided Interface",
    DIAGRAM_ADDBTN_ASSOCIATION: "1. Add Association or<br /> 2. Set Required Interface or<br /> 3. Connect Note",
    DIAGRAM_ADDBTN_CLASS: "Add Class",
    DIAGRAM_ADDBTN_NOTE: "Add Note",
    DIAGRAM_ADDBTN_RTE: "Round Trip Engineering",

    JAVAC_PATH_DESCRIPTION: "",
    JAVADOC_PATH_DESCRIPTION: "",

    //error
    PARAMETER_DUPLICATE: "Parameter already declared. Please rename it.",
    OPERATION_DUPLICATE: "Operation already declared. Please rename it.",

    FE_DESCRIPTION: "Generate java source code with the<br /> help of the current class diagram.",
    FE_BUTTON: "Generate Java",
    RE_DESCRIPTION: "Generate a new class diagram from<br /> existing java files in project folder.",
    RE_BUTTON: "Generate diagram",

    //note
    NOTE_TITLE: "Note",

    //class diagram generation
    CLASSDIAGRAM_GEN_START: "start reverse engineering",
    CLASSDIAGRAM_GEN_PARSE: "parse java files",
    CLASSDIAGRAM_GEN_CLASS: "create class: ",
    CLASSDIAGRAM_GEN_CONNECTORS: "create dependencies",
    CLASSDIAGRAM_GEN_READY: "reverse engineering is ready",

    //java generator
    JAVA_GEN_START: "start forward engineering",
    JAVA_GEN_CLASS: "create class: ",
    JAVA_GEN_OPEN_IN_TAB: "open java source code in tab: ",
    JAVA_GEN_READY: "forward engineering is ready"
});


