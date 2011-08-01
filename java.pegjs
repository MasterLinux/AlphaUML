


/*
 * Implementation of the Java language
 * as a parser expression grammar
 */

start =
    File

File =
    $p:(__ "package" __ !";" $p:Identifier __ ";" __ {return $p;})?
    $i:(__ "import" __ !";" $i:[0-9A-Za-z_$.*]+ __ ";" __ {return $i.join("");})*
    __ $c:Class+ __ !.
    {
        return {
            package: $p !== "" ? $p : null,
            imports: $i !== "" ? $i : null,
            classes: $c
        };
    }

Class =
    $jd:JavaDocComment? __
    $v:VisibilityKeyword? __
    $m:($m:ModifierKeyword __ {return $m;})*
    $t:("class"/"interface"/"enum") __
    $n:Identifier __
    $e:("extends" __ $e:Identifier __ {return $e;})?
    $i:("implements" __ $i:(__ ","? __ $i:Identifier __ {return $i})+ {return $i;})?
    "{" __
    $b:ClassBody
    "}"
    {
        return {
            type: $t,
            javaDoc: $jd != "" ? $jd : null,
            visibility: $v != "" ? $v : null,
            modifier: $m,
            name: $n,
            extend: $e !== "" ? $e : null,
            implement: $i,
            body: $b
        };
    }

ClassBody =
    $m:(Method / Variable / WhiteSpace {return "";} / EndOfLine {return "";})*
    {
        var result = {};
        for (var i = 0; i < $m.length; i++) {
            //add variables
            if($m[i].type == "variable") {
                //if variable array doesn't exists create once
                if(!result["variable"]) result["variable"] = [];
                //push variable into array
                result.variable.push($m[i]);
            }

            //add methods
            else if($m[i].type == "method") {
                //if method array doesn't exists create once
                if(!result["method"]) result["method"] = [];
                //push variable into array
                result.method.push($m[i]);
            }
        }

        return result;
    }

Method =
    $jd:JavaDocComment? __
    $v:($v:VisibilityKeyword __ {return $v;})?
    $m:($m:ModifierKeyword __ {return $m;})*
    $d:($d:DataType __ !"(" __ {return $d;})?
    $n:Identifier __
    "(" $pl:ParameterList ")" __
    $b:(("{" $b:(!"}" $b:. {return $b;})* "}" {return $b;}) / (__ ";" __ {return "";})) 
    {
        return {
            type: "method",
            javaDoc: $jd !== "" ? $jd : null,
            name: $n,
            visibility: $v !== "" ? $v : null,
            modifier: $m,
            dataType: $d !== "" ? $d.dataType : "constructor",
            generic: $d !== "" ? $d.generic : null,
            array: $d !== "" ? $d.array : null,
            parameter: $pl,
            body: $b && $b !== "" ? $b.join("") : null
        };
    }

Variable =
    $jd:JavaDocComment? __
    $v:($v:VisibilityKeyword __ {return $v;})?
    $m:($m:ModifierKeyword __ {return $m;})*
    $d:DataType __ !("="/";") __
    $n:Identifier __
    $val:("=" __ $v:(!";" $v:. {return $v;})* {return $v;})? ";"
    {
        //get value if exists and remove each existing quote
        var value = $val !== "" ? $val.join("").replace(/"/g, "").replace(/'/g, "") : null

        //convert the value of int and float datatypes to a number
        if(value) if($d == "int") value = parseInt(value);
        if(value) if($d == "float") value = parseFloat(value);
        
        return {
            type: "variable",
            javaDoc: $jd !== "" ? $jd : null,
            name: $n,
            visibility: $v !== "" ? $v : null,
            modifier: $m,
            array: $d ? $d.array : null,
            generic: $d ? $d.generic : null,
            dataType: $d ? $d.dataType : null,
            value: value
        };
    }

Generic =
    "<" __ $g:Identifier __ ">"
    {
        return $g;
    }

Array =
    $a:("[" __ "]")
    {
        return ($a && $a != "") ? true : false;
    }

DataType =
    $d:DataTypeKeyword __
    $g:($g:Generic __ {return $g;})?
    $a:($a:Array __ {return $a;})?
    {
        return {
            generic: $g !== "" ? $g : null,
            array: $a !== "" ? $a : false,
            dataType: $d
        };
    }

Identifier =
    $i:[a-zA-Z0-9_$]+
    {
        return $i.join("");
    }

JavaLetter =
    [a-zA-Z_$]

JavaDigit =
    [0-9]

Parameter =
    $m:($m:ModifierKeyword __ {return $m;})*
    $d:DataType __
    $n:Identifier __
    {
        return {
            type: "parameter",
            modifier: $m,
            generic: $d.generic,
            array: $d.array,
            dataType: $d.dataType,
            name: $n
        };
    }

ParameterList = (
    __ ","? __ $p:Parameter
    {
        return $p;
    }
)*

FilePath =
    ([a-zA-Z0-9-_:] / "/" / "\\")+

Word =
    ([a-zA-Z0-9-_:.!?"'§$%&/()='] / "/" / "\\")+ 

WhiteSpace
  = [\t\v\f \u00A0\uFEFF]
  / Space

//Separator, Space
Space = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

EndOfLine
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028" // line spearator
  / "\u2029" // paragraph separator

__
    = (WhiteSpace / EndOfLine / MultiLineComment / SingleLineComment)*

/*
 * comments
 */
MultiLineComment =
    !"/**" "/*" (!"*/" .)* "*/"
    {
        return null;
    }

SingleLineComment =
    "//" (!EndOfLine .)* EndOfLine
    {
        return null;
    }

JavaDocComment =
    "/**" __ 
    $d:((!("*/" / JavaDocTag / EndOfLine) $d:. {return $d;}) / (WhiteSpace / EndOfLine {return " "}))* __
    $p:JavaDocTag* __
    "*/"
    {
        var index = 0;
        var comment = {};

        //add javadoc comment
        if($d !== "") {
            ++index;
            comment["description"] = {
                tag: "description",
                description: $d.join("").replace(/\s*(\*)?\s+/g, " ")
            }
        }

        //format array to an more readable object
        for(var i=0; i<$p.length; i++) {
            var tag = $p[i].tag;

            if(tag !== "return" || tag !== "since" || tag !== "umlPos") {
                ++index;
                //create specific tag array if doesn't exists
                if(!comment[tag]) comment[tag] = [];
                //push tag into array
                comment[tag].push($p[i]);
            } else {
                ++index;
                //return is only allowed once
                comment[tag] = $p[i];
            }
        }

        return index == 0 ? null : comment;
    }

JavaDocTag = (
        JavaDocParam
    /   JavaDocReturn
    /   JavaDocThrows
    /   JavaDocException
    /   JavaDocSince
    /   JavaDocAuthor
    /   JavaDocSee
    /   JavaDocUmlPos
    /   JavaDocUmlIgnore
    /   JavaDocUmlProject
    /   JavaDocUmlTitle
)

JavaDocParam =
    __ "*"? __
    "@param" __
    $n:Identifier? __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "param",
            name: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocThrows =
    __ "*"? __
    "@throws" __
    $n:Identifier? __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "throws",
            classname: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocException =
    __ "*"? __
    "@exception" __
    $n:Identifier? __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "exception",
            classname: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocReturn =
    __ "*"? __
    "@return" __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "return",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocSince =
    __ "*"? __
    "@since" __
    $d:(!"*/" $d:[0-9.] __ {return $d;})*
    {
        return {
            tag: "since",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocAuthor =
    __ "*"? __
    "@author" __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "author",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocSee =
    __ "*"? __
    "@see" __
    $d:(!"*/" $d:Word __ {return $d;})*
    {
        return {
            tag: "see",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

/* uml specific javadoc tags */
JavaDocUmlPos =
    __ "*"? __
    "@umlPos" __
    $x:("x:" __ $x:[0-9]+ {return $x;}) __
    $y:("y:" __ $y:[0-9]+ {return $y;})
    {
        return {
            tag: "umlPos",
            x: $x.join(""),
            y: $y.join("")
        };
    }

JavaDocUmlIgnore =
    __ "*"? __
    "@umlIgnore" __
    $i:(!"*/" $i:FilePath {return $i;})
    {
        return {
            tag: "umlIgnore",
            path: $i.join("")
        }
    }

JavaDocUmlProject =
    __ "*"? __
    "@umlProject" __
    $r:("root:" __ $r:FilePath WhiteSpace+ {return $r;}) __
    $m:("main:" __ $m:FilePath WhiteSpace* {return $m;})
    {
        return {
            tag: "umlProject",
            root: $r.join(""),
            main: $m.join("")
        }
    }

JavaDocUmlTitle =
    __ "*"? __
    "@umlTitle" __
    $t:(!"*/" $t:[a-zA-Z0-9_-] {return $t;})*
    {
        return {
            tag: "umlTitle",
            title: $t.join("")
        }
    }

/*
 * keywords
 */
Keyword = (
        DataTypeKeyword
    /   ModifierKeyword
    /   VisibilityKeyword
    /   UnusedKeyword
    /   "class"
    /   "extends"
    /   "import"
    /   "interface"
    /   "package"
)

DataTypeKeyword = (
        "boolean"
    /   "byte"
    /   "char"
    /   "double"
    /   "enum"
    /   "float"
    /   "int"
    /   "long"
    /   "short"
    /   "void"
    /   Identifier
)

ModifierKeyword = (
        "abstract"
    /   "final"
    /   "static"
    /   "synchronized"
    /   "volatile"
    /   "transient"
    /   "native"
)

VisibilityKeyword = (
        "default"
    /   "private"
    /   "protected"
    /   "public"
)

UnusedKeyword = (
        "const"
    /   "goto"
)
