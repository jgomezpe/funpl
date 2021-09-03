package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;

public class FunTuple extends FunCommandCall{
	public FunTuple(FunMachine machine, FunCommandCall[] component) {
		super(component[0].input(), component[0].start(), machine, FunConstants.TUPLE, component);
	}

	@Override
	public int arity() { return 1; }
	
	@Override
	public HashMap<String, Object> match( HashMap<String, Object> variables, Object[] values ) 
			throws Exception{		
		if( values.length == 1 && values[0] instanceof Object[] )
			values = (Object[])values[0];
		if(values.length != args.length) throw exception(FunConstants.argnumbermismatch +values.length + "!=" + args.length);
		return inner_match(variables, values, args.length);
	}

	public Object run( HashMap<String,Object> variables ) throws Exception{
		int a = args.length;
		Object[] obj = new Object[a];
		for( int i=0; i<a; i++ ) obj[i] = args[i].run(variables);
		return obj;
	}
	
	public String toString(){
		StringBuilder sb=new StringBuilder();
		char sep = ' ';
		for(FunCommandCall c:args) {
			sb.append(sep);
			sb.append(c.toString());
			sep =',';
		}
		return sb.toString();
	}
	
}
