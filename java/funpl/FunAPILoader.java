package funpl;

import jxon.JXON;

public interface FunAPILoader {
    FunAPI load( JXON json );
}