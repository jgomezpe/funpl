package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Source;

public class FunVariable extends FunCommandCall{
	public FunVariable(Source input, int pos, FunMachine machine, String name) { super(input, pos, machine, name); }
	public Object execute( HashMap<String,Object> variables ) throws Exception{
		try{ return variables.get(name()); }catch(Exception e ){ throw exception(FunConstants.novar); }
	}	

	@Override
	public void getVars(HashMap<String,Object> vars) { vars.put(name,name); }
	
	public HashMap<String, Object> match( HashMap<String, Object> variables, Object... values ) throws Exception{
		if( values.length!=1 )  throw exception(FunConstants.argnumbermismatch + 1 + "!=" + values.length);
		String n=name();
		boolean match = true;
		try{
			Object obj = variables.get(n);
			match = obj.equals(values[0]);
		}catch(Exception e){ 
			match = machine.can_assign(n, values[0]);
			if(match) variables.put(n,values[0]);
		}		
		if( !match ) throw exception(FunConstants.argmismatch + values[0]);
		return variables;
	}
}