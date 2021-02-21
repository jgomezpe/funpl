package funpl.syntax;

import java.util.HashMap;

import lifya.lookahead.LAHParser;
import lifya.lookahead.Rule;

public class FunParser extends LAHParser{
    
    protected static Rule[] rules(HashMap<String, int[]> operator_priority) { return new Rule[] {
	    new Definition(null),
	    new DefList(null),
	    new Expression(null,operator_priority),
	    new Arguments(null),
	    new Command(null)
    }; }

    public FunParser(HashMap<String, int[]> operator_priority, String rule){
	super(rules(operator_priority), rule);
    }
}