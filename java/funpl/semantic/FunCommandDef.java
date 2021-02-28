package funpl.semantic;

import java.util.HashMap;

import funpl.util.FunConstants;

public class FunCommandDef extends FunCommand{
	protected FunCommandCall left;
	protected FunCommandCall right;

	public FunCommandDef(FunMachine machine, FunCommandCall left, FunCommandCall right ){
		super( left.input(), left.start(), machine );
		this.left = left;
		this.right = right;
	}
	
	public HashMap<String,Object> match( Object... values ) throws Exception{
		if(left.arity()==0) return new HashMap<String,Object>();
		return left.match(values);
	}

	@Override
	public Object execute( Object... values ) throws Exception{ 
		return right.run(match(values)); 
	}

	public String name(){ return left.name(); }

	@Override
	public int arity(){ return left.arity(); }
	
	public String toString(){
		StringBuilder sb=new StringBuilder();
		sb.append(left);
		sb.append(FunConstants.ASSIGN);
		sb.append(right);
		return sb.toString();
	}
	
}