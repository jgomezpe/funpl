package funpl.semantic;

import java.io.IOException;
import java.util.HashMap;

import funpl.util.FunConstants;
import lifya.Position;

public class FunMachine{
    protected HashMap<String,FunCommand> primitive;
    protected FunValueInterpreter value;
    protected FunAssignment assignment=null;
    protected FunProgram program;
	

    public FunMachine(){}
	
    public FunMachine( HashMap<String,FunCommand> primitives, FunValueInterpreter value, FunAssignment assignment ){
	setPrimitives( primitives );
	this.value = value;
	this.assignment = assignment;
    }
	
    public void setPrimitives(HashMap<String,FunCommand> primitives) {
	this.primitive = primitives; 
	for( FunCommand c : primitives.values() ) c.setMachine(this); 
    }

    public void setValues(FunValueInterpreter value) { this.value = value; }
		
    public FunProgram get(){ return program; }
    public void setProgram( FunProgram program ){
	this.program = program;
	program.machine = this;
    }
	
    public void clear(){ this.program.clear(); }
	
    public void setAssignment(FunAssignment assignment) { this.assignment = assignment; }

    public boolean can_assign( String variable, Object value ){
	boolean flag = false;
	if( assignment != null ) flag = assignment.check(variable, value);
	if(!flag){
	    String cmd = value.toString();
	    return primitive.get(cmd)!=null || program.defined(cmd);
	}
	return flag;
    }
	
//	public Object execute( String command, Object... args ) throws IOException{
		
//	}
	
    public Object execute( Position pos, String command, Object... args ) throws Exception{
	if(value.valid(command)){
	    if( args.length>0) {
		program.start(pos.start());
		throw program.exception(FunConstants.unexpected);
	    }
	    return value.get(command);
	}
	FunCommand c = primitive.get(command);
	if( c!=null ){
	    c.input(pos.input());
	    c.start(pos.start());
	    if( args.length != c.arity() ){
		if( args.length > 0 ) throw c.exception(FunConstants.argnumbermismatch + command);
		else return command;
	    }
	    return c.execute(args);
	    /*try{ return c.execute(args); }
			catch(IOException e){
				e.setPosition(pos);
				throw e;
			}*/
	}
	program.start(pos.start());
	try{
	    return program.execute(command, args);
	}catch(IOException e ){
	    if(program.defined(command) && !program.constant(command) && args.length==0 ) return command;
	    else throw e;
	}	
    }
}