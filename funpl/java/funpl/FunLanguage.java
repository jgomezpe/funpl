package funpl;

import funpl.lexer.FunLexer;
import funpl.semantic.FunMachine;
import funpl.semantic.FunMeaner;
import funpl.semantic.FunObject;
import funpl.syntax.FunParser;
import lifya.Language;

public class FunLanguage extends Language<FunObject>{
    protected FunMachine machine;
    public FunLanguage(FunLexer lexer, FunParser parser, FunMachine machine, String rule){ 
	super(lexer, parser, new FunMeaner(machine)); 
	parser.rule(rule);
    }	
}