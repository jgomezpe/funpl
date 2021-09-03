package funpl.syntax;

import funpl.util.FunConstants;
import lifya.Lexer;
import lifya.Source;
import lifya.Token;
import lifya.lookahead.Rule;
import speco.array.Array;

public class Definition extends Rule{
	public final static String TAG = "ATTRIBUTE"; 
	public Definition(FunParser parser) { super(FunConstants.DEFINITION, parser); }
    
	@Override
	public boolean startsWith(Token t) { return t.type()==FunConstants.FUNCTION; }
    
	@Override
	public Token analyze(Lexer lexer, Token current) {
		if(!startsWith(current)) return current.toError();
		Source input = current.input();
		int start = current.start();
		int end = current.end();
		Array<Token> pair = new Array<Token>();
		pair.add(parser.rule(FunConstants.COMMAND).analyze(lexer,current));
		if(pair.get(0).isError()) return pair.get(0);
		current = lexer.next();
		if(current==null) return eof(input,end);
		if(!check_symbol(current, '=')) return current.toError();
		end = current.end();
		pair.add(parser.analyze(FunConstants.EXPLIST,lexer));
		if(pair.get(1).isError()) return pair.get(1);
		return token(input,start,pair.get(1).end(),pair);
	}
}