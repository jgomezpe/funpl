package funpl.syntax;

import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Lexer;
import lifya.Source;
import lifya.Token;
import lifya.lookahead.Rule;
import speco.array.Array;

public class Expression extends Rule{
    protected HashMap<String,int[]> operator_priority;
    

    public Expression(FunParser parser, HashMap<String,int[]> operator_priority) {
	super(FunConstants.EXPRESSION, parser);
	this.operator_priority = operator_priority;
    }

    
    @Override
    public Token analize(Lexer lexer, Token current) {
	Token t = inner_analize(lexer,current);
	if(!t.isError()) {
	    @SuppressWarnings("unchecked")
	    Array<Token> list = (Array<Token>)t.value();
	    for( int i=1; i<list.size(); i+=2) { 
		int[] oper = operator_priority.get((String)list.get(i).value());
		if( oper[0] == 1 )
		    return list.get(i).toError();
	    }
	    t = tree(list);
	}
	return t;    
    }

    protected Token tree(Array<Token> list) {
	if( list.size()==1 ) return list.get(0);
	int p = operator_priority.get((String)list.get(1).value())[1];
	int k = 1;
	for( int i=3; i<list.size(); i+=2) { 
	    int pi = operator_priority.get((String)list.get(i).value())[1];
	    if(pi<p) {
		k = i;
		p = pi;
	    }
	}
	Array<Token> args = new Array<Token>();
	args.add(list.get(k-1));
	args.add(list.get(k+1));
	Array<Token> node = new Array<Token>();
	node.add(list.get(k));
	node.add(new Token(FunConstants.ARGS, args.get(0).input(), args.get(0).start(), args.get(1).end(),args));
	Token t = new Token(FunConstants.COMMAND, node.get(0).input(),node.get(1).start(), node.get(1).end(),node);
	list.remove(k+1);
	list.set(k,t);
	list.remove(k-1);
	return tree(list);
    }
    
    protected Token inner_analize(Lexer lexer, Token current) {
	if(!startsWith(current)) return current.toError();
	Source input = current.input();
	int start = current.start();
	int end = current.end();
	Token command;
	if( check_symbol(current, '(')) {
	    current = lexer.next();
	    command = analize(lexer,current);
	    if(command.isError()) return command;
	    end = current.end();
	    current = lexer.next();
	    if(current==null) return eof(input,end);
	    if(!check_symbol(current, ')')) return current.toError();
	}else {
	    command = parser.rule(FunConstants.COMMAND).analize(lexer,current);
	    if(command.isError()) return command;
	}
	current = lexer.next();
	if(current==null || current.type()!=FunConstants.PRIMITIVE) {
	    lexer.goback();
	    Array<Token> t = new Array<Token>();
	    t.add(command);
	    return token(input,start,command.end(),t);
	}
	end = current.end();
	Token oper = current;
	current = lexer.next();
	if(current==null) return eof(input,end);
	Token list = inner_analize(lexer,current);
	if(list.isError()) return list;
	@SuppressWarnings("unchecked")
	Array<Token> l = (Array<Token>)list.value();
	l.add(0, command);
	l.add(1,oper);
	return token(input,start,list.end(),l);
    }

    @Override
    public boolean startsWith(Token token) {
	return parser.rule(FunConstants.COMMAND).startsWith(token) || check_symbol(token, '(');
    }

}
