package funpl.syntax;

import funpl.util.FunConstants;
import lifya.Lexer;
import lifya.Token;
import lifya.lookahead.LAHParser;
import lifya.lookahead.Rule;
import speco.array.Array;

public class Argument  extends Rule{
	public Argument(LAHParser parser) {
		super(FunConstants.ARG, parser);
	}
	@Override
	public boolean startsWith(Token token) { return parser.rule(FunConstants.EXPRESSION).startsWith(token); }

	@Override
	public Token analyze(Lexer lexer, Token current) {
		if(!startsWith(current)) return current.toError();
		if(check_symbol(current, '(')) {
			current = lexer.next();
			int start = current.start();
			Token tuple = parser.rule(FunConstants.EXPLIST).analyze(lexer, current);
			if( tuple.isError() ) return tuple;
			
			current = lexer.next();
			if(check_symbol(current, ')')) {
				@SuppressWarnings("unchecked")
				Array<Token> c = (Array<Token>)tuple.value();
				if(c.size()==1) return ((Expression)parser.rule(FunConstants.EXPRESSION)).inner_analyze_part2(lexer, tuple, start);
				return tuple; 
			}else {
				current.toError();
				return current;
			}
		}else return parser.rule(FunConstants.EXPRESSION).analyze(lexer, current);
	}
}
