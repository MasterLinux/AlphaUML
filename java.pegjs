/*
 * Implementation of the Java language
 * as a parser expression grammar
 */

 start =
    _m:(_m:Method {return _m;} / _v:Variable {return _v;} / WhiteSpace {return "";} / EndOfLine {return "";})* !.
    {
        var result = [];
        for (var i = 0; i < _m.length; i++) {
            if(_m[i] != "") {
                result.push(_m[i]);
            }
        }

        return result;
    }

Class =
    _v:VisibilityKeyword WhiteSpace+
    Keyword WhiteSpace+
    _n:WordNumber WhiteSpace+
    _e:("extends" WhiteSpace+ _e:WordNumber WhiteSpace+ {return _e;})?
    __ "{" __
    _m:(!"}" _m:Method {return _m;} /!"}" __ {return null;} /!"}" .* {return null;})*
    "}"
    {
        return {
            type: "class",
            visibility: _v,
            name: _n,
            extends: _e,
            method: _m
        }
    }

Method =
    _jd:JavaDocComment? (WhiteSpace / EndOfLine)*
    _v:VisibilityKeyword WhiteSpace+
    _m:(_m:ModifierKeyword WhiteSpace+ {return _m;})?
    _d:(_d:DataTypeKeyword WhiteSpace+ {return _d;})?
    _n:WordNumber WhiteSpace*
    "(" _pl:ParameterList ")"
    (WhiteSpace / EndOfLine)*
    "{" (!"}" .)* "}"
    {
        return {
            type: "method",
            javaDoc: _jd !== "" ? _jd : null,
            name: _n,
            visibility:  _v,
            modifier: _m !== "" ? _m : null,
            dataType: _d !== "" ? _d : "constructor",
            parameter: _pl
        };
    }

Variable =
    _jd:JavaDocComment? (WhiteSpace / EndOfLine)*
    _v:VisibilityKeyword WhiteSpace+
    _m:(_m:ModifierKeyword WhiteSpace+ {return _m;})?
    _d:WordNumber WhiteSpace+
    _n:WordNumber WhiteSpace*
    _val:("=" _v:(!";" _v:. {return _v;})* {return _v;})? ";"
    {
        return {
            type: "variable",
            javaDoc: _jd !== "" ? _jd : null,
            name: _n,
            visibility:  _v,
            modifier: _m !== "" ? _m : null,
            dataType: _d,
            value: _val !== "" ? _val.join("") : null
        };
    }

Word =
    _w:[a-zA-Z]+
    {
        return _w.join("");
    }

WordNumber =
    _wn:[a-zA-Z0-9]+
    {
        return _wn.join("");
    }

Parameter =
    _d:(DataTypeKeyword/Word) WhiteSpace+ _n:Word
    {
        return {
            dataType: _d,
            name: _n
        } 
    }

ParameterList = (
    WhiteSpace* _p:Parameter WhiteSpace* ","? WhiteSpace*
    {
        return _p
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
    = (WhiteSpace / EndOfLine)*

/*
 * comments
 */
JavaDocComment =
    "/**"
    _p:(
            (!("*/" / JavaDocTag) .)* {return null;}
        /   JavaDocTag
    )*
    "*/" {return _p;}

JavaDocTag = (
        JavaDocParam
    /   JavaDocReturn
)

JavaDocUML =
    "@uml" WhiteSpace+ 

JavaDocParam =
    "@param" WhiteSpace+ _n:(_n:WordNumber WhiteSpace+ {return _n;})? _d:(!EndOfLine _d:. {return _d;})* EndOfLine
    {
        return {
            tag: "param",
            name: _n !== "" ? _n : null,
            description: _d.length !== 0 ? _d.join("") : null
        };
    }

JavaDocReturn =
    "@return" WhiteSpace+ _d:(!EndOfLine _d:. {return _d;})* EndOfLine
    {
        return {
            tag: "return",
            description: _d.length !== 0 ? _d.join("") : null
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
