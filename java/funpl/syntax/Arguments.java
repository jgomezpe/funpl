package funpl.syntax;

import funpl.util.FunConstants;
import lifya.lookahead.ListRule;

public class Arguments extends ListRule{
    public Arguments(FunParser parser) { super(FunConstants.ARGS, parser, FunConstants.ARG, '(', ')', ','); }
}