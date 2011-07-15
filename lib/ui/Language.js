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

    //buttons
    ADD_OPERATION_BTN: "Operations",
    ADD_ATTRIBUTE_BTN: "Attributes",

    //class diagram
    DIAGRAM_ADD_CLASS: "Place Class",
    DIAGRAM_ADD_GENERALIZATION_SUPER: "Select Superclass",
    DIAGRAM_ADD_GENERALIZATION_SUB: "Select Subclass",
    DIAGRAM_ADD_ASSOCIATION_FIRST: "Select Class",
    DIAGRAM_ADD_ASSOCIATION_SECOND: "Select Another Class", //"select another/same class",

    //error
    PARAMETER_DUPLICATE: "Parameter already declared. Please rename it.",
    OPERATION_DUPLICATE: "Operation already declared. Please rename it."
});

