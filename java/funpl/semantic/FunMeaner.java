package funpl.semantic;

import funpl.util.FunConstants;
import lifya.Meaner;
import lifya.Source;
import lifya.Token;
import speco.array.Array;

public class FunMeaner implements Meaner{
	protected FunMachine machine;
	protected Source src;
	
	public FunMeaner(){}
	
	public FunMeaner( FunMachine machine ){
		this.machine = machine;	
	}
	
	public void setMachine( FunMachine machine ){ this.machine = machine; }
	
	@SuppressWarnings("unchecked")
	protected FunCommandCall command(Array<Token> v){
		String name = null;
		Token xt = v.get(0);
		if(xt.type()==FunConstants.VALUE) return new FunValue(src, xt.start(), machine, xt.value().toString());
		if(xt.type()==FunConstants.VARIABLE) return new FunVariable(src, xt.start(), machine, (String)xt.value());
		name = (String)xt.value();
		if(v.size()>1) v = (Array<Token>)v.get(1).value();
		else v.clear();
		FunCommandCall[] args = new FunCommandCall[v.size()];
		for( int i=0; i<v.size(); i++ )
			args[i] = (FunCommandCall)command(v.get(i));
		return new FunCommandCall(src, xt.start(), machine, name, args);
	}
	
	protected Object get( Array<?> v, int i ){
		try{ return v.get(i); }catch(Exception e){ return null; }
	}
		
	protected FunCommand command_def(Array<Token> v){
		return new FunCommandDef(machine, (FunCommandCall)command(v.get(0)), (FunCommandCall)command(v.get(1)));
	}

	protected FunProgram command_def_list(Array<Token> list){
		Array<FunCommandDef> defs = new Array<FunCommandDef>();
		for(Token s:list) defs.add((FunCommandDef)command(s));
		return new FunProgram(machine, defs);
	}
	
	@SuppressWarnings("unchecked")
	public FunObject command(Token rule){
		switch( rule.type() ){
			case FunConstants.VARIABLE: return new FunVariable(src, rule.start(), machine, (String)rule.value());
			case FunConstants.VALUE: return new FunValue(src, rule.start(), machine, (String)rule.value());
			case FunConstants.DEFINITION: return command_def((Array<Token>)rule.value());
			case FunConstants.DEF_LIST: return command_def_list((Array<Token>)rule.value());
			case FunConstants.COMMAND: return command((Array<Token>)rule.value());
		}
		return null;
	}

	public void src(Source src) {
	    this.src = src;
	}
	
	@Override
	public Token apply(Token rule){
	    rule.value(command(rule));
	    return rule;
	}

}
