/*
 * Implementation of the Java language
 * as a parser expression grammar
 */

start = __ Class+ __ !.

Class =
    $jd:JavaDocComment? __
    $v:VisibilityKeyword __
    Keyword __
    $n:WordNumber __
    $e:("extends" __ $e:WordNumber __ {return $e;})?
    "{" __
    $m:InnerClass
    "}"
    {
        return {
            type: "class",
            javaDoc: $jd !== "" ? $jd : null,
            visibility: $v,
            name: $n,
            extends: $e,
            method: $m
        }
    }

InnerClass =
    $m:($m:Method {return $m;} / $v:Variable {return $v;} / WhiteSpace {return "";} / EndOfLine {return "";})*
    {
        var result = [];
        for (var i = 0; i < $m.length; i++) {
            if($m[i] != "") {
                result.push($m[i]);
            }
        }

        return result;
    }

Method =
    $jd:JavaDocComment? __
    $v:VisibilityKeyword __
    $m:($m:ModifierKeyword __ {return $m;})?
    $d:($d:DataTypeKeyword __ {return $d;})?
    $n:WordNumber __
    "(" $pl:ParameterList ")" __
    "{" (!"}" .)* "}"
    {
        return {
            type: "method",
            javaDoc: $jd !== "" ? $jd : null,
            name: $n,
            visibility:  $v,
            modifier: $m !== "" ? $m : null,
            dataType: $d !== "" ? $d : "constructor",
            parameter: $pl
        };
    }

Variable =
    $jd:JavaDocComment? __
    $v:VisibilityKeyword __
    $m:($m:ModifierKeyword __ {return $m;})?
    $d:WordNumber __
    $n:WordNumber __
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
            visibility:  $v,
            modifier: $m !== "" ? $m : null,
            dataType: $d,
            value: value
        };
    }

Word =
    $w:[a-zA-Z]+
    {
        return $w.join("");
    }

WordNumber =
    $wn:[a-zA-Z0-9]+
    {
        return $wn.join("");
    }

Parameter =
    $d:(DataTypeKeyword/Word) __ $n:Word
    {
        return {
            dataType: $d,
            name: $n
        } 
    }

ParameterList = (
    __ $p:Parameter __ ","? __
    {
        return $p
    }
)*

WhiteSpace
  = [\t\v\f \u00A0\uFEFF]
  / Zs

//Separator, Space
Zs = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

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
        return $p;
    }

JavaDocTag = (
        JavaDocParam
    /   JavaDocReturn
)

JavaDocUML =
    "@uml" WhiteSpace+ 

JavaDocParam =
    "@param" WhiteSpace+ $n:($n:WordNumber WhiteSpace+ {return $n;})? $d:(!EndOfLine $d:. {return $d;})* EndOfLine
    {
        return {
            tag: "param",
            name: $n !== "" ? $n : null,
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
