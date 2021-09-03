package funpl;

import speco.jxon.JXON;

public interface FunAPILoader {
    FunAPI load( JXON json );
}