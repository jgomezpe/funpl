package funpl.lexer;

import funpl.util.FunConstants;
import lifya.lexeme.Lexeme;
import lifya.Source;
import lifya.Token;

public class Function implements Lexeme<String>{
	protected boolean number;
	protected boolean letter;
	protected String start;
    
	public Function(){ this(true,true,""); }
	
	public Function(boolean canStartWithLetter, boolean canStartWithNumber, String start ){ 
		this.number = canStartWithNumber;
		this.letter = canStartWithLetter;
		this.start=start!=null?start:"";
	}

	public Function(String start ){ this(false,false,start); }

	public Function(boolean canStartWithLetter, boolean canStartWithNumber ){ 
		this(canStartWithLetter, canStartWithNumber, "");
	}

	@Override
	public Token match(Source txt, int start, int end) {
	    if(!startsWith(txt.get(start))) return error(txt, start, start+1);
	    int n = end;
	    end = start+1;
	    while(end<n && followsWith(txt.get(end))) end++;
	    return token(txt,start,end,txt.substring(start,end));
	}
	
	@Override
	public boolean startsWith(char c){ 
	    return (letter && Character.isLowerCase(c)) || (number && Character.isDigit(c)) || start.indexOf(c)>=0;
	}

	public boolean followsWith(char c){ 
	    return Character.isAlphabetic(c) || Character.isDigit(c) || c=='_';
	}

	@Override
	public String type() { return FunConstants.FUNCTION; }   	
}