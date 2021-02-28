package funpl.remote;

import funpl.FunAPI;
import funpl.gui.FunApplication;
import aplikigo.net.Channel;
import aplikigo.remote.Console;
import aplikigo.remote.Editor;
import aplikigo.remote.Render;

public class FunRemoteApplication extends FunApplication{
    public FunRemoteApplication(String id, FunAPI api, Channel channel) {
	super(id, new Editor("program",channel), new Editor("command",channel), 
		new Console("console", channel), new Render("render", channel), api);
    }
}