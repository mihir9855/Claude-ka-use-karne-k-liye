package in.mihir.paisa;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PaisaSmsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
