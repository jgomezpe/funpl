package funpl.util;

public class FunConstants {
	// FunMachine
	public static final String novalue = "·No valid value· ";
	public static final String NUMBERID = "numberid";
	public static final String LETTERID = "numberid";
	public static final String STARTID = "startid";

	// FunEncoder
	public static final String code="code";
	public static final String arity="arity";
	public static final String priority="priority";
	public static final String extra="extra";
	public static final int EOF=-1;
	public static final int DOLLAR=1;
	public static final char ASSIGN='=';
	public static final char COMMA=',';
	public static final char OPEN='(';
	public static final char CLOSE=')';
	public static final char SPACE=' ';

	// FunLexer
	public static final String COMMENT = "comment";
	public static final String FUNCTION = "function";
	public static final String VALUE = "value";
	public static final String PRIMITIVE = "primitive";
	public static final String VARIABLE = "variable";
	
	// FunParser
	public static final String EXPRESSION="expression";
	public static final String DEFINITION="definition";
	public static final String EXPLIST="expressionlist";
	public static final String DEF_LIST="list";
	public static final String COMMAND="command";
	public static final String ARG="arg";
	public static final String ARGS="args";
	public static final String TUPLE="tuple";
	
	public static final String expected="·Expecting· ";
	public static final String unexpected="·Unexpected· ";
	public static final String noargs="·No arguments· ";

	// FunMeaner
	public static final String nocommand="·Not a command· ";
	public static final String argmismatch="·Argument mismatch· ";
	public static final String argnumbermismatch="·Argument number mismatch· ";
	public static final String novar="·No a variable· ";	
	public static final String notuple="·No a tuple· ";	
	
	// FunAPI
	public static final String i18n="language/";
	public static final String machine="machine/";
	public static final String imgs="image/";
}
