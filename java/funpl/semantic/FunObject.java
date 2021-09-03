package funpl.semantic;

import lifya.Position;
import lifya.Source;
import lifya.Token;
import lifya.stringify.Stringifier;

public abstract class FunObject extends Position{
	protected FunMachine machine;
	
	public FunObject( Source input, int pos, FunMachine machine ){ 
		super(input,pos);
		this.machine = machine;
	}
	
	public void setMachine(FunMachine machine){ this.machine = machine; }
	public FunMachine machine(){ return machine; }

	protected Exception exception(String code){
	    	Token t = new Token(this.input(), this.start(), this.start()+1, code);
		return new Exception(Stringifier.apply(t));
	}
	
	public abstract String name();
}