package funpl.syntax;

import funpl.util.FunConstants;
import lifya.Lexer;
import lifya.Source;
import lifya.Token;
import lifya.lookahead.Rule;
import speco.array.Array;

public class Command extends Rule{

    public Command(FunParser parser) {
	super(FunConstants.COMMAND, parser);
    }

    @Override
    public Token analize(Lexer lexer, Token current) {
	if(!startsWith(current)) return current.toError();
	Source input = current.input();
	int start = current.start();
	int end = current.end();
	String type = current.type();
	Array<Token> command = new Array<Token>();
	command.add(current);
	if(type!=FunConstants.VALUE) {
	    Token c = lexer.next();
	    lexer.goback();
	    if(c!=null && check_symbol(c, '(')) {
		Token args = parser.analize(FunConstants.ARGS, lexer);
		if(args.isError()) return args;
		command.add(args);
		end = args.end();
	    }else {
		if(type==FunConstants.PRIMITIVE)
		    if(c==null) return eof(input,end);
		    else return c.toError();
	    }
	}
	return token(input,start,end,command);
    }

    @Override
    public boolean startsWith(Token token) {
	String type = token.type();
	return type==FunConstants.VALUE || type==FunConstants.FUNCTION ||
		type==FunConstants.PRIMITIVE || type==FunConstants.VARIABLE;
    }
}
