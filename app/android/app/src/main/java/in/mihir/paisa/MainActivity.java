package in.mihir.paisa;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PaisaSmsPlugin.class);
        super.onCreate(savedInstanceState);
        handleShare(getIntent());
        // System Back is handled by the web app first (close sheet / go Home / press-again-to-exit); we leave only when it says so.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                final WebView wv = getBridge() == null ? null : getBridge().getWebView();
                if (wv == null) { finish(); return; }
                wv.evaluateJavascript("(function(){try{return window.__arthalyBack?window.__arthalyBack():0}catch(e){return 0}})()", value -> {
                    if (!"1".equals(value)) finish();
                });
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShare(intent);
    }

    /** A bank SMS shared to the app is queued like a captured SMS; the web app picks it up. */
    private void handleShare(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null || !"text/plain".equals(intent.getType())) return;
        SmsStore.add(this, "share", text, System.currentTimeMillis());
        PaisaSmsPlugin.notifyNewSms();
    }
}
