package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Source;

public class FunVariable extends FunCommandCall{
    public static final String UNASSIGNED = "%unassigned";
    
    public FunVariable(Source input, int pos, FunMachine machine, String name) { super(input, pos, machine, name); }

    @Override
    public void getVars(HashMap<String,Object> vars) { vars.put(name,UNASSIGNED); }

    @Override
    public HashMap<String, Object> match( HashMap<String, Object> variables, Object[] values ) 
	    throws Exception{
	if( values.length!=1 )  throw exception(FunConstants.argnumbermismatch + 1 + "!=" + values.length);
	Object value = values[0];
	Object obj = variables.get(name);
	boolean match = true;
	if(obj!=null) match = obj.equals(value);
	else {
	    match = machine.can_assign(name, value);
	    if(match) variables.put(name,value);
	}
	if( !match ) throw exception(FunConstants.argmismatch + value);
	return variables;
    }
    
    @Override
    public Object run( HashMap<String,Object> variables ) throws Exception{
	Object x = variables.get(name); 
	if( x == null ) throw exception(FunConstants.novar+name);
	return x;
    }
}