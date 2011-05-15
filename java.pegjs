/*
 * Implementation of the Java language
 * as a parser expression grammar
 */

Method =
    _v:VisibilityKeyword WhiteSpace+
    _m:ModifierKeyword? WhiteSpace?
    _d:DataTypeKeyword WhiteSpace+
    _n:Word WhiteSpace*
    "(" _pl:ParameterList ")"
    (WhiteSpace / LineTerminatorSequence)*
    "{" (!"}" .)* "}" !.
    {
        return {
            name: _n,
            visibility:  _v,
            modifier: _m,
            dataType: _d,
            parameter: _pl
        }
    }

Word =
    _w:[a-zA-Z]+
    {
        return _w.join("");
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

WhiteSpace "whitespace"
  = [\t\v\f \u00A0\uFEFF]
  / Zs

//Separator, Space
Zs = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028" // line spearator
  / "\u2029" // paragraph separator

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
