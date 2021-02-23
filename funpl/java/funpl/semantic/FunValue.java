package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Source;

public class FunValue extends FunCommandCall{
    protected Object obj = null;
    protected Exception e = null;
    public FunValue(Source input, int pos, FunMachine machine, String name) {
	super(input, pos, machine, name);
	try{ obj = machine.value.get(name); }
	catch(Exception e){ this.e = exception(FunConstants.novalue + name); }
    }

    public Object execute( HashMap<String,Object> variables ) throws Exception{
	if( e != null ) throw e;
	return obj;
    }
    
    @Override
    public HashMap<String, Object> match( HashMap<String, Object> variables, Object... values ) 
	    throws Exception{
	if( values.length!=1 )  throw exception(FunConstants.argnumbermismatch + 1 + "!=" + values.length);
	Object value = values[0];
	if( obj==null || !obj.equals(value) ) throw exception(FunConstants.argmismatch + value);
	return variables;
    }
}