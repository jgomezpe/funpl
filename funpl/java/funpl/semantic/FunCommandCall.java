package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Source;
import speco.array.Array;

public class FunCommandCall extends FunCommand {
    protected String name;
    protected String ho_name;
    protected FunCommandCall[] args=null;

    public FunCommandCall( Source input, int pos, FunMachine machine, String name ){
	super(input, pos, machine);
	this.name = name;
	this.ho_name = name;
    }
	
    public FunCommandCall( Source input, int pos, FunMachine machine, String name, FunCommandCall[] args ){
	this(input, pos, machine, name);
	this.args = args;
    }	

    public String name(){ return name; }
    public FunCommandCall[] args(){ return args; }

    public HashMap<String,Object> var2assign(HashMap<String,Object> variables) {
	HashMap<String,Object> undvars = new HashMap<String, Object>();
	HashMap<String,Object> vars = getVars();
	for( String v:vars.keySet() ) {
	    Object o = variables.get(v);
	    if(o==null || o.equals(FunVariable.UNASSIGNED)) undvars.put(v, FunVariable.UNASSIGNED);
	}
	return undvars;
    }
    
    protected HashMap<String, Object> match( HashMap<String, Object> variables, Object... values )
	    throws Exception{
	ho_name = (String)variables.get(name); 

	if( ho_name == null ) ho_name = name;

	int arity = arity();
	if( arity == 0 ){
	    Object obj=machine.execute(this, ho_name);
	    if(obj==null || values.length!=1 || !obj.equals(values[0])) throw exception(FunConstants.argmismatch + values[0]);
	    return variables;
	}
	if( values.length != arity ) throw exception(FunConstants.argnumbermismatch + values.length + "!=" + arity);
	Exception ex = null;
	Array<Integer> index = new Array<Integer>();
	for( int i=0; i<arity; i++ ) index.add(i);
	// Checking FunValues and Variables
	int i=0;
	while(i<index.size()) {
	    int k=index.get(i);
	    if( args[k] instanceof FunValue || args[k] instanceof FunVariable ){
		args[k].match(variables,values[k]);
		index.remove(i);
	    }else i++;
	}
	// Checking other commands	
	int m = 1;
	i=0;
	while(index.size()>0 && m<3) {
	    int k = index.get(i);
	    if(args[k].var2assign(variables).size() <= m) {
		String aname = args[k].name();
		try{
		    FunCommand c = machine.primitive.get(aname);
		    if(c != null ){
			int a = c.arity();
			Object[] toMatch = new Object[a];
			for( int j=0; j<a; j++ )
			    try{ 
				toMatch[j]=args[k].args[j].run(variables); 
			    }catch(Exception x){ toMatch[j]=null; }
			c.input(args[k].input());
			c.start(args[k].start);
			Object[] objs = c.reverse(values[k], toMatch);
			args[k].match(variables, objs);
		    }else{
			Object obj = args[k].run(variables);
			if( obj==null || !obj.equals(values[k]) ) throw args[k].exception(FunConstants.argmismatch + values[k]);
		    }
		    index.remove(i);
		    i=-1; 
		    m=1;
		}catch( Exception e ){
		    ex = e;
		}
	    }
	    i++;
	    if(i==index.size()) {
		m++;
		i=0;
	    }
	}
	
	if( index.size() > 0 ) {
	    StringBuilder sb = new StringBuilder();
	    HashMap<String,Object> uvars = var2assign(variables);
	    for(String uv:uvars.keySet()) sb.append(" "+uv);
	    ex = ex!=null?ex:exception(FunConstants.novar + sb.toString());
	    throw ex;
	}
	return variables; 
    }
    
    public HashMap<String, Object> match( Object... values ) throws Exception{ 
	return match( new HashMap<String,Object>(), values ); 
    }
	
    public Object run( HashMap<String,Object> variables ) throws Exception{
	Object x = variables.get(name); 
	if( x == null ) ho_name = name;
	else ho_name = x.toString();
	int a = arity();
	Object[] obj = new Object[a];
	for( int i=0; i<a; i++ ) obj[i] = args[i].run(variables);
	return machine.execute(this, ho_name, obj);
    }

    public void getVars(HashMap<String,Object> vars) {
	if( args != null )
		for( int i=0; i<args.length; i++ )
		    args[i].getVars(vars);
    }
	
    public HashMap<String,Object> getVars() {
	HashMap<String, Object> vars = new HashMap<String, Object>();
	getVars(vars);
	return vars;
    }

    @Override
    public Object execute( Object... value ) throws Exception{
	HashMap<String,Object> vars = (HashMap<String, Object>)getVars();
	if(vars.size()!=1) throw exception(FunConstants.argnumbermismatch);
		
	for(String k:vars.keySet()) vars.put(k,value[0]);		
	return run(vars); 
    }

    @Override
    public int arity() { return (args!=null)?args.length:0; }	
	
    public String toString(){
	StringBuilder sb=new StringBuilder();
	sb.append(name());
	int n = arity();
	if( n>0 ){
	    sb.append(FunConstants.OPEN);
	    sb.append(args[0]);
	    for( int i=1; i<n;i++ ){
		sb.append(FunConstants.COMMA);			
		sb.append(args[i]);
	    }
	    sb.append(FunConstants.CLOSE);			
	}
	return sb.toString();
    }
}