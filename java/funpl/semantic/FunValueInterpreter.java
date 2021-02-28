package funpl.semantic;

import lifya.lexeme.Lexeme;

public interface FunValueInterpreter {
    Object get( String value );
    boolean valid( String value );
    String description();
    Lexeme<?> lexeme();
}
