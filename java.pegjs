/*
 * Implementation of the Java language
 * as a parser expression grammar
 */

start =
    File

File =
    JavaDocComment? __
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
    "{" $b:(!"}" $b:. {return $b;})* "}"
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
            body: $b.join("")
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
    "/**"
    $p:(
            (!("*/" / JavaDocTag) .)* {return null;}
        /   JavaDocTag
    )*
    "*/"
    {
        var index = 0;
        var comment = {};
        //format array to an more readable object
        for(var i=0; i<$p.length; i++) {
            var tag = $p[i].tag;

            if(tag !== "return" || tag !== "since") {
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
)

JavaDocUML =
    "@uml" WhiteSpace+ 

JavaDocParam =
    "@param" WhiteSpace+ $n:($n:Identifier WhiteSpace+ {return $n;})? $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "param",
            name: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocThrows =
    "@throws" WhiteSpace+ $n:($n:Identifier WhiteSpace+ {return $n;})? $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "throws",
            classname: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocException =
    "@exception" WhiteSpace+ $n:($n:Identifier WhiteSpace+ {return $n;})? $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "exception",
            classname: $n !== "" ? $n : null,
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocReturn =
    "@return" WhiteSpace+ $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "return",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocSince =
    "@since" WhiteSpace+ $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "since",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocAuthor =
    "@author" WhiteSpace+ $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "author",
            description: $d.length !== 0 ? $d.join("") : null
        };
    }

JavaDocSee =
    "@see" WhiteSpace+ $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "see",
            description: $d.length !== 0 ? $d.join("") : null
        };
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
