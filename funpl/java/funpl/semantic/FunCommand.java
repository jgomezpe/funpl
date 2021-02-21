package funpl.semantic;

import funpl.util.FunConstants;
import lifya.Source;
import utila.I18N;

public abstract class FunCommand extends FunObject{
    public FunCommand() {
	this(null);
    }
    
    public FunCommand(FunMachine machine) {
	this(null,0,machine);
    }
	
    public FunCommand( Source input, int pos, FunMachine machine ){ 
	super(input, pos, machine);
    }
	
    public abstract Object execute( Object... value ) throws Exception;
    public abstract int arity();
	
    public Object[] reverse(Object value, Object[] original) throws Exception{ return null; }
	
    public String comment(){ return I18N.process("·"+name()+"·"); }
    public String toString(){
	StringBuilder sb=new StringBuilder();
	String c = comment();
	if( c!=null ) sb.append(c+"\n");
	sb.append(name());
	int n = arity();
	if( n>0 ){
	    String var="XYZABCDEIJKNM";
	    sb.append(FunConstants.OPEN);
	    sb.append(var.charAt(0));
	    for( int i=1; i<n;i++ ){
		sb.append(FunConstants.COMMA);			
		sb.append(var.charAt(i%var.length())+((i>=var.length())?(""+i/var.length()):""));
	    }
	    sb.append(FunConstants.CLOSE);		
	}
	return sb.toString();
    }	
}