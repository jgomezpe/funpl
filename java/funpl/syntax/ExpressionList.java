package funpl.syntax;

import funpl.util.FunConstants;
import lifya.lookahead.LAHParser;
import lifya.lookahead.NonEmptyListRule;

public class ExpressionList extends NonEmptyListRule{
	public ExpressionList(LAHParser parser) { super(FunConstants.EXPLIST, parser, FunConstants.EXPRESSION); }
}