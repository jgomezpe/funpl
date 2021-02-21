package test;

import java.util.HashMap;

import funpl.lexer.FunLexer;
import funpl.syntax.FunParser;
import funpl.util.FunConstants;
import lifya.Source;
import lifya.Token;
import lifya.lexeme.Lexeme;
import lifya.lexeme.Words;
import speco.array.Array;

public class SyntaxText {
    public static Lexeme<String> value(){
	return new Lexeme<String>() {

	    @Override
	    public Token match(Source input, int start, int end) {
		if(!startsWith(input.get(start))) return error(input,start,start+1);
		int e=start+1;
		while(e<end && startsWith(input.get(e))) e++;
		return token(input,start,e,input.substring(start,e));
	    }

	    @Override
	    public boolean startsWith(char c) {
		return c=='-' || c=='/' || c=='<' || c=='_';
	    }

	    @Override
	    public String type() {
		return FunConstants.VALUE;
	    }
	};
    }

    public static Lexeme<String> primitive(){
 	return new Words(FunConstants.PRIMITIVE, new String[] {"@","|"} ); 
    }

    public static Lexeme<String> primitive2(){
 	return new Words(FunConstants.PRIMITIVE, new String[] {"@","|","+"} ); 
    }
    
	public static void lexer() {
	    String code = "% Hello World\n   //<<|rot(X)";
	    FunLexer lexer = new FunLexer(true, value(), primitive());
	    try {
		System.out.println(code);
		Array<Token> tokens = lexer.get(code);
		System.out.println(tokens.size());
		for( Token t:tokens ) System.out.println(t);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	}

	public static void print( int tab, Token t ) {
	    Object obj = t.value();
	    if( obj instanceof Array ) {
		for( int k=0; k<tab; k++ ) {
		    System.out.print(' ');
		}
		System.out.println(t.type());
		@SuppressWarnings("unchecked")
		Array<Token> v = (Array<Token>)obj;
		for( int i=0; i<v.size(); i++ ) {
		    print(tab+1, v.get(i));
		}
	    }else {
		for( int k=0; k<tab; k++ ) {
		    System.out.print(' ');
		}
		System.out.println(t);
	    }
	}
	
	public static void parser() {
	    String code = "% Hello World\n0  = <\n1=@(<)|rot(X,Y)|@(Z)+<|Z";
	    FunLexer lexer = new FunLexer(true, value(), primitive2());
	    try {
		System.out.println("***********");
		System.out.println(code);
		Array<Token> tokens = lexer.get(code);
		System.out.println(tokens.size());
		for( Token t:tokens ) System.out.println(t);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	    HashMap<String, int[]> opers = new HashMap<String, int[]>();
	    opers.put("@", new int[] {1, 10});
	    opers.put("|", new int[] {2, 1});
	    opers.put("+", new int[] {2, 2});
	    FunParser parser = new FunParser(opers,FunConstants.DEF_LIST);
	    try {
		lexer.init(code);
		Token t = parser.analize(lexer);
		print(0,t);
	    } catch (Exception e) {
		e.printStackTrace();
	    } 
	}

	public static void main(String[] args) {
	    lexer(); // Uncomment to test the lexer
	    parser(); // Uncomment to test the parser
	}
}
