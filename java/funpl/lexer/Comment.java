package funpl.lexer;

import funpl.util.FunConstants;
import lifya.lexeme.Lexeme;
import lifya.Source;
import lifya.Token;

public class Comment implements Lexeme<String>{
	@Override
	public Token match(Source txt, int start, int end) {
	    if(!startsWith(txt.get(start))) return error(txt, start, start+1);
	    int n = end;
	    end = start;
	    while(end<n && followsWith(txt.get(end))) end++;
	    return new Token(type(),txt,start,end,txt.substring(start,end));
	}

	@Override
	public boolean startsWith(char c){ 
	    return c=='%';
	}

	public boolean followsWith(char c){ 
	    return c!='\n' && c!='\r';
	}

	@Override
	public String type() { return FunConstants.COMMENT; }	
}