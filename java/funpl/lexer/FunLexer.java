package funpl.lexer;

import funpl.util.FunConstants;
import lifya.lexeme.Lexeme;
import lifya.lexeme.Space;
import lifya.lexeme.Symbol;
import lifya.lookahead.LAHLexer;

public class FunLexer extends LAHLexer{
    public FunLexer( Function f, Lexeme<?> value, Lexeme<String> primitive ) {
	super( new Lexeme[] {
		new Variable(),
		f,
		value, primitive,
		new Symbol("()=,"),
		new Comment(),
		new Space()}, new String[] {Space.TAG, FunConstants.COMMENT});  
    }	
}