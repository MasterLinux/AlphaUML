/**
 * User: Christoph Grundmann
 * Date: 15.07.11
 * Time: 00:53
 *
 */
dojo.provide("ui.dialog.AddAssociation");
dojo.require("ui.classDiagram.Connector");
dojo.require("ui.Dialog");
dojo.require("ui.TextInput");

dojo.declare("ui.dialog.AddAssociation", ui.Dialog, {
    connector: null,
    diagram: null,

    leftClassCntId: null,
    leftClassId: null,
    leftClass: null,

    leftClassPropertiesId: null,
    leftRoleVisibilityCntId: null,
    leftRoleVisibility: null,
    leftMultiplicityCntId: null,
    leftMultiplicity: null,
    leftRoleCntId: null,
    leftRole: null,

    leftDirCheckboxId: null,
    leftDirectionId: null,

    associationNameCntId: null,
    associationNameId: null,
    associationName: null,

    rightDirCheckboxId: null,
    rightDirectionId: null,

    rightClassPropertiesId: null,
    rightRoleVisibilityCntId: null,
    rightRoleVisibility: null,
    rightMultiplicityCntId: null,
    rightMultiplicity: null,
    rightRoleCntId: null,
    rightRole: null,

    rightClassCntId: null,
    rightClassId: null,
    rightClass: null,

    rightClassPreviewId: null,
    rightRolePreviewId: null,
    rightArrowPreviewId: null,
    rightMultiplicityPreviewId: null,
    namePreviewId: null,
    leftClassPreviewId: null,
    leftRolePreviewId: null,
    leftArrowPreviewId: null,
    leftMultiplicityPreviewId: null,

    //selected classes
    _left: null,
    _right: null,

    /**
     * args: {
     *   placeAt: string parent id
     *   diagram: ui.content.ClassDiagram
     *   connector: ui.classDiagram.Connector
     *   leftClass: ui.classDiagram.Class
     *   rightClass: ui.classDiagram.Class
     * }
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.diagram = args.diagram;
        this._left = args.leftClass;
        this._right = args.rightClass;
        this.connector = args.connector;
    },

    /**
     * creates dialog
     */
    create: function() {
        this.inherited(arguments);

        //add new table
        this.addTableView();

        //create ids
        this.leftClassPreviewId = this.htmlId + "LeftClassPreview";
        this.leftRolePreviewId = this.htmlId + "LeftRolePreview";
        this.leftArrowPreviewId = this.htmlId + "LeftArrowPreview";
        this.leftMultiplicityPreviewId = this.htmlId + "LeftMultiplicityPreview";
        this.namePreviewId = this.htmlId + "NamePreview";
        this.rightClassPreviewId = this.htmlId + "RightClassPreview";
        this.rightRolePreviewId = this.htmlId + "RightRolePreview";
        this.rightArrowPreviewId = this.htmlId + "RightArrowPreview";
        this.rightMultiplicityPreviewId = this.htmlId + "RightMultiplicityPreview";

        //add preview
        this.addTablePreview(
            '<div class="row">' +
                '<div class="association class" id="' + this.leftClassPreviewId + '"></div>' +
                '<div class="inner">' +
                    '<div class="association role" id="' + this.leftRolePreviewId + '">role</div>' +
                    '<div class="association arrow">' +
                        '<div class="line"></div>' +
                        '<div style="position: relative;"><div class="west" id="' + this.leftArrowPreviewId + '"></div></div>' +
                    '</div>' +
                    '<div class="association multiplicity" id="' + this.leftMultiplicityPreviewId + '">1..*</div>' +
                '</div>' +
                '<div class="inner">' +
                    '<div class="association name" id="' + this.namePreviewId + '">name</div>' +
                    '<div class="association line"></div>' +
                    '<div class="spacer"></div>' +
                '</div>' +
                '<div class="inner">' +
                    '<div class="association role" id="' + this.rightRolePreviewId + '">role</div>' +
                    '<div class="association arrow">' +
                        '<div class="line"></div>' +
                        '<div style="position: relative;"><div class="east" id="' + this.rightArrowPreviewId + '"></div></div>' +
                    '</div>' +
                    '<div class="association multiplicity" id="' + this.rightMultiplicityPreviewId + '">1..*</div>' +
                '</div>' +
                '<div class="association class" id="' + this.rightClassPreviewId + '"></div>' +
            '</div>'
        );

        //add rows
        this.leftClassRow();
        this.leftClassPropertiesRow();
        this.leftDirectionRow();
        this.associationNameRow();
        this.rightDirectionRow();
        this.rightClassPropertiesRow();
        this.rightClassRow();
    },

    /**
     * destroys dialog
     * @param del
     */
    destroy: function(del) {
        this.leftClass.destroy(true);
        this.leftRole.destroy(true);
        this.leftRoleVisibility.destroy(true);
        this.leftMultiplicity.destroy(true);
        this.rightClass.destroy(true);
        this.rightRole.destroy(true);
        this.rightRoleVisibility.destroy(true);
        this.rightMultiplicity.destroy(true);
        this.associationName.destroy(true);
        this.inherited(arguments);
    },

    onApprove: function() {
        //get classes
        var leftClass = this.getClass(this.leftClass.getValue());
        var rightClass = this.getClass(this.rightClass.getValue());
        var name = this.associationName.getValue();
        var leftRoleVisibility = this.leftRoleVisibility.getValue();
        var leftRole = this.leftRole.getValue();
        var leftMultiplicity = this.leftMultiplicity.getValue();
        var rightRoleVisibility = this.rightRoleVisibility.getValue();
        var rightRole = this.rightRole.getValue();
        var rightMultiplicity = this.rightMultiplicity.getValue();

        //get direction
        var direction = "";
        var leftCheckbox = dojo.byId(this.leftDirCheckboxId);
        var rightCheckbox = dojo.byId(this.rightDirCheckboxId);
        if(leftCheckbox.checked && rightCheckbox.checked) {
            direction = "both";
        } else if(leftCheckbox.checked) {
            direction = "p0";
        } else if(rightCheckbox.checked) {
            direction = "p1";
        }

        //destroys existing connector
        if(this.connector) this.connector.destroy(true);

        //initialize connector
        var connector = new ui.classDiagram.Association({
            diagram: this.diagram,
            placeAt: this.diagram.areaId,
            name: name,
            direction: direction,
            p0RoleVisibility: leftRoleVisibility,
            p0Multiplicity: leftMultiplicity,
            p0Role: leftRole,
            p1RoleVisibility: rightRoleVisibility,
            p1Multiplicity: rightMultiplicity,
            p1Role: rightRole
        });

        //place connector
        connector.create();

        //register classes
        connector.registerClass(
            leftClass, "p0",
            rightClass, "p1"
        );

        //store connector
        this.diagram.connectors.push(connector);
    },

    /**
     * gets a specific class
     * @param name
     */
    getClass: function(name) {
        var _class = null;
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name == name) {
                _class = c;
            }
        }));

        return _class;
    },

    /**
     * gets a list of classes
     * @param exclude class names
     * @param onClick function
     */
    getClasses: function(exclude, onClick) {
        var options = [];
        dojo.forEach(this.diagram.classes, dojo.hitch(this, function(c) {
            if(c.name != exclude && c.stereotype != "interface") {
                options.push({
                    title: c.name,
                    value: c.name,
                    onClick: onClick,
                    storage: c
                });
            }
        }));

        return options;
    },

    leftClassRow: function() {
        //create unique identifier
        this.leftClassCntId = this.htmlId + "LeftClassContent";
        this.leftClassId = this.htmlId + "LeftClass";

        //add new table row
        this.addTableRow({id: this.leftClassId});

        //add content into row
        this.addContent("Class", '<span id="' + this.leftClassCntId + '"></span>', this.leftClassId);

        //create modifier input field
        this.leftClass = new ui.TextInput({
            placeAt: this.leftClassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.leftClass.clearOptions();
                //get each possible class
                var classes = this.getClasses(this.rightClass.value);
                //generate new class list
                this.leftClass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.leftClass.create();

        //clear old options
        this.leftClass.clearOptions();
        //get each possible class
        var classes = this.getClasses();
        //generate new class list
        this.leftClass.addOptions(classes);

        //set pre-configured class
        if(this.connector) {
            this.leftClass.setValue(this.connector.p0Class.name);
        } else if(this._left) {
            this.leftClass.setValue(this._left.name);
        }
    },

    leftClassPropertiesRow: function() {
        //create unique identifier
        this.leftRoleVisibilityCntId = this.htmlId + "LeftRoleVisibilityContent";
        this.leftRoleCntId = this.htmlId + "LeftRoleContent";
        this.leftMultiplicityCntId = this.htmlId + "LeftMultiplicityContent";
        this.leftClassPropertiesId = this.htmlId + "LeftClassProperties";

        //add new table row
        this.addTableRow({id: this.leftClassPropertiesId});

        //add content into row
        this.addContent("Role Visibility", '<span id="' + this.leftRoleVisibilityCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftRoleVisibility = new ui.TextInput({
            placeAt: this.leftRoleVisibilityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "public",
                    value: "public"
                },
                {
                    title: "protected",
                    value: "protected"
                },
                {
                    title: "private",
                    value: "private"
                }
            ]
        });

        this.leftRoleVisibility.create();

        //add content into row
        this.addContent("Role", '<span id="' + this.leftRoleCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftRole = new ui.TextInput({
            placeAt: this.leftRoleCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.leftRole.create();

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.leftMultiplicityCntId + '"></span>', this.leftClassPropertiesId);

        //create modifier input field
        this.leftMultiplicity = new ui.TextInput({
            placeAt: this.leftMultiplicityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                //remove special characters
                if(value) value = value.replace(/\[/g, "").replace(/\]/g, "");
                //return value
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "[1]",
                    value: "[1]"
                },
                {
                    title: "[0..*]",
                    value: "[0..*]"
                }
            ]
        });

        this.leftMultiplicity.create();

        //get connector info
        if(this.connector) {
            var vis = (this.connector.p0RoleVisibility != "package") ?
                this.connector.p0RoleVisibility : "";

            this.leftRoleVisibility.setValue(vis);
            this.leftRole.setValue(this.connector.p0Role);
            this.leftMultiplicity.setValue(this.connector.p0Multiplicity);
        }
    },

    leftDirectionRow: function() {
        //create unique identifier
        this.leftDirectionId = this.htmlId + "LeftDirection";
        this.leftDirCheckboxId = this.htmlId + "LeftDirCheckbox";

        //add new table row
        this.addTableRow({id: this.leftDirectionId});

        //add content into row
        this.addContent(
            '<span style="font-family: serif;">&larr;</span>',
            '<span>' +
                '<input type="checkbox" id="' + this.leftDirCheckboxId + '">' +
            '</span>',
            this.leftDirectionId
        );

        this.connect({
            name: "LeftArrowChange",
            event: "onchange",
            nodeId: this.leftDirCheckboxId,
            method: this.renderPreview
        });

        //get connector info
        if(this.connector) {
            var checkbox = dojo.byId(this.leftDirCheckboxId);
            if(this.connector.direction == "p0" || this.connector.direction == "both") {
                checkbox.click();
            }
        } else if(this._left) {
            //select box cause _left is the first selected class
            var checkbox = dojo.byId(this.leftDirCheckboxId);
            checkbox.click();
        }
    },

    associationNameRow: function() {
        //create unique identifier
        this.associationNameCntId = this.htmlId + "AssociationNameContent";
        this.associationNameId = this.htmlId + "AssociationName";

        //add new table row
        this.addTableRow({id: this.associationNameId});

        //add content into row
        this.addContent("Name", '<span id="' + this.associationNameCntId + '"></span>', this.associationNameId);

        //create modifier input field
        this.associationName = new ui.TextInput({
            placeAt: this.associationNameCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.associationName.create();

        //get connector info
        if(this.connector) {
            this.associationName.setValue(this.connector.name);
        }
    },

    rightDirectionRow: function() {
        //create unique identifier
        this.rightDirectionId = this.htmlId + "RightDirection";
        this.rightDirCheckboxId = this.htmlId + "RightDirCheckbox";

        //add new table row
        this.addTableRow({id: this.rightDirectionId});

        //add content into row
        this.addContent(
            '<span style="font-family: serif;">&rarr;</span>',
            '<span>' +
                '<input type="checkbox" id="' + this.rightDirCheckboxId + '">' +
            '</span>',
            this.rightDirectionId
        );

        this.connect({
            name: "RightArrowChange",
            event: "onchange",
            nodeId: this.rightDirCheckboxId,
            method: this.renderPreview
        });

        //get connector info
        if(this.connector) {
            var checkbox = dojo.byId(this.rightDirCheckboxId);
            if(this.connector.direction == "p1" || this.connector.direction == "both") {
                checkbox.click();
            }
        }
    },

    rightClassPropertiesRow: function() {
        //create unique identifier
        this.rightRoleVisibilityCntId = this.htmlId + "RightRoleVisibilityContent";
        this.rightRoleCntId = this.htmlId + "RightRoleContent";
        this.rightMultiplicityCntId = this.htmlId + "RightMultiplicityContent";
        this.rightClassPropertiesId = this.htmlId + "RightClassProperties";

        //add new table row
        this.addTableRow({id: this.rightClassPropertiesId});

        //add content into row
        this.addContent("Role Visibility", '<span id="' + this.rightRoleVisibilityCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightRoleVisibility = new ui.TextInput({
            placeAt: this.rightRoleVisibilityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "public",
                    value: "public"
                },
                {
                    title: "protected",
                    value: "protected"
                },
                {
                    title: "private",
                    value: "private"
                }
            ]
        });

        this.rightRoleVisibility.create();

        //add content into row
        this.addContent("Role", '<span id="' + this.rightRoleCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightRole = new ui.TextInput({
            placeAt: this.rightRoleCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            dynamicSize: true,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.rightRole.create();

        //add content into row
        this.addContent("Multiplicity", '<span id="' + this.rightMultiplicityCntId + '"></span>', this.rightClassPropertiesId);

        //create modifier input field
        this.rightMultiplicity = new ui.TextInput({
            placeAt: this.rightMultiplicityCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                //remove special characters
                if(value) value = value.replace(/\[/g, "").replace(/\]/g, "");
                //return value
                return value;
            },
            options: [
                {
                    title: "&nbsp;",
                    value: ""
                },
                {
                    title: "[1]",
                    value: "[1]"
                },
                {
                    title: "[0..*]",
                    value: "[0..*]"
                }
            ]
        });

        this.rightMultiplicity.create();

        //get connector info
        if(this.connector) {
            var vis = (this.connector.p3RoleVisibility != "package") ?
                this.connector.p3RoleVisibility : "";

            this.rightRoleVisibility.setValue(vis);
            this.rightRole.setValue(this.connector.p3Role);
            this.rightMultiplicity.setValue(this.connector.p3Multiplicity);
        }
    },

    rightClassRow: function() {
        //create unique identifier
        this.rightClassCntId = this.htmlId + "RightClassContent";
        this.rightClassId = this.htmlId + "RightClass";

        //add new table row
        this.addTableRow({id: this.rightClassId});

        //add content into row
        this.addContent("Class", '<span id="' + this.rightClassCntId + '"></span>', this.rightClassId);

        //create modifier input field
        this.rightClass = new ui.TextInput({
            placeAt: this.rightClassCntId,
            onChange: dojo.hitch(this, this.renderPreview),
            hasMenu: true,
            hasEmptyOption: true,
            onFocus: dojo.hitch(this, function() {
                //clear old options
                this.rightClass.clearOptions();
                //get each possible class
                var classes = this.getClasses(this.leftClass.value);
                //generate new class list
                this.rightClass.addOptions(classes);
            }),
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = null;
                return value;
            }
        });

        this.rightClass.create();

        //clear old options
        this.rightClass.clearOptions();
        //get each possible class
        var classes = this.getClasses();
        //generate new class list
        this.rightClass.addOptions(classes);

        //set pre-configured class
        if(this.connector) {
            this.rightClass.setValue(this.connector.p3Class.name);
        } else if(this._left) {
            this.rightClass.setValue(this._right.name);
        }
    },

    /**
     * renders the preview
     */
    renderPreview: function() {
        var rightClass = dojo.byId(this.rightClassPreviewId);
        var rightRole = dojo.byId(this.rightRolePreviewId);
        var rightArrow = dojo.byId(this.rightArrowPreviewId);
        var rightMultiplicity = dojo.byId(this.rightMultiplicityPreviewId);
        var name = dojo.byId(this.namePreviewId);
        var leftClass = dojo.byId(this.leftClassPreviewId);
        var leftRole = dojo.byId(this.leftRolePreviewId);
        var leftArrow = dojo.byId(this.leftArrowPreviewId);
        var leftMultiplicity = dojo.byId(this.leftMultiplicityPreviewId);

        //set classes
        leftClass.innerHTML = (this.leftClass && this.leftClass.value != "") ? this.leftClass.value : "class";
        rightClass.innerHTML = (this.rightClass && this.rightClass.value != "") ? this.rightClass.value : "class";

        //get visibility
        var _leftVisibility = "";
        if(this.leftRoleVisibility) {
            if(this.leftRoleVisibility.value == "public") _leftVisibility = "+ ";
            else if(this.leftRoleVisibility.value == "protected") _leftVisibility = "# ";
            else if(this.leftRoleVisibility.value == "private") _leftVisibility = "- ";
            else _leftVisibility = "~ ";
        }

        //set role
        if(this.leftRole && this.leftRole.value != "") {
            //set role with visibility
            leftRole.innerHTML = _leftVisibility + this.leftRole.value;
            dojo.style(leftRole, "opacity", "1");
        } else {
            //handle package visibility
            _leftVisibility = (_leftVisibility == "~ ") ? "" : _leftVisibility;

            //unset role
            if(_leftVisibility == "") {
                dojo.style(leftRole, "opacity", "0");
                leftRole.innerHTML = "&nbsp;";
            }
            else {
                dojo.style(leftRole, "opacity", "1");
                leftRole.innerHTML = _leftVisibility;
            }
        }

        //get visibility
        var _rightVisibility = "";
        if(this.rightRoleVisibility) {
            if(this.rightRoleVisibility.value == "public") _rightVisibility = "+ ";
            else if(this.rightRoleVisibility.value == "protected") _rightVisibility = "# ";
            else if(this.rightRoleVisibility.value == "private") _rightVisibility = "- ";
            else _rightVisibility = "~ ";
        }

        //set role
        if(this.rightRole && this.rightRole.value != "") {
            //set role with visibility
            rightRole.innerHTML = _rightVisibility + this.rightRole.value;
            dojo.style(rightRole, "opacity", "1");
        } else {
            //handle package visibility
            _rightVisibility = (_rightVisibility == "~ ") ? "" : _rightVisibility;

            //unset role
            if(_rightVisibility == "") {
                dojo.style(rightRole, "opacity", "0");
                rightRole.innerHTML = "&nbsp;";
            }
            else {
                dojo.style(rightRole, "opacity", "1");
                rightRole.innerHTML = _rightVisibility;
            }
        }

        //set multiplicity
        if(this.leftMultiplicity && this.leftMultiplicity.value != "") {
            leftMultiplicity.innerHTML = this.leftMultiplicity.value.replace(/\[/g, "").replace(/\]/g, "");
            dojo.style(leftMultiplicity, "opacity", "1");
        } else {
            leftMultiplicity.innerHTML = "&nbsp;";
            dojo.style(leftMultiplicity, "opacity", "0");
        }

        if(this.rightMultiplicity && this.rightMultiplicity.value != "") {
            rightMultiplicity.innerHTML = this.rightMultiplicity.value.replace(/\[/g, "").replace(/\]/g, "");
            dojo.style(rightMultiplicity, "opacity", "1");
        } else {
            rightMultiplicity.innerHTML = "&nbsp;";
            dojo.style(rightMultiplicity, "opacity", "0");
        }

        //set direction
        var rightCheckbox = dojo.byId(this.rightDirCheckboxId);
        if(rightCheckbox && rightCheckbox.checked) {
            dojo.style(rightArrow, "opacity", "1");
        } else {
            dojo.style(rightArrow, "opacity", "0");
        }

        var leftCheckbox = dojo.byId(this.leftDirCheckboxId);
        if(leftCheckbox && leftCheckbox.checked) {
            dojo.style(leftArrow, "opacity", "1");
        } else {
            dojo.style(leftArrow, "opacity", "0");
        }

        //set name
        name.innerHTML = (this.associationName && this.associationName.value != "") ? this.associationName.value : "";

        //update preview position
        dojo.publish("PreviewUpdate");
    }
});