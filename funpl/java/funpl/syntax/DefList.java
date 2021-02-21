package funpl.syntax;

import funpl.util.FunConstants;
import lifya.Lexer;
import lifya.Source;
import lifya.Token;
import lifya.lookahead.Rule;
import speco.array.Array;

public class DefList  extends Rule{
    public DefList(FunParser parser) { super(FunConstants.DEF_LIST, parser); }

    @Override
    public boolean startsWith(Token t) { return t.type()==FunConstants.FUNCTION; }
    
    @Override
    public Token analize(Lexer lexer, Token current) {
	if(!startsWith(current)) return current.toError();
	Source input = current.input();
	int start = current.start();
	int end = current.end();
	Array<Token> list = new Array<Token>();
	while(current!=null && startsWith(current)){
	    Token t = parser.rule(FunConstants.DEFINITION).analize(lexer, current);
	    if(t.isError()) return t;
	    list.add(t);
	    end = current.end();
	    current = lexer.next();
	}
	if(current!=null) return current.toError();
	return token(input,start,end,list);
    }

}
