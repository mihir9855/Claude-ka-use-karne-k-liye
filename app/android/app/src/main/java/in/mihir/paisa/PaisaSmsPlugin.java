package in.mihir.paisa;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import org.json.JSONArray;

@CapacitorPlugin(
    name = "PaisaSms",
    permissions = {
        @Permission(alias = "sms", strings = { Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS }),
        @Permission(alias = "notif", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class PaisaSmsPlugin extends Plugin {
    private static PaisaSmsPlugin instance;

    @Override
    public void load() { instance = this; }

    /** Called by the receiver; wakes the web app if it is in the foreground. */
    static void notifyNewSms() {
        if (instance != null) instance.notifyListeners("smsReceived", new JSObject());
    }

    /** Tells the web app whether this build can read SMS (the lite build cannot). */
    @PluginMethod
    public void capabilities(PluginCall call) {
        boolean sms = false;
        try {
            PackageInfo pi = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), PackageManager.GET_PERMISSIONS);
            if (pi.requestedPermissions != null) {
                for (String p : pi.requestedPermissions) {
                    if ("android.permission.RECEIVE_SMS".equals(p)) sms = true;
                }
            }
        } catch (Exception ignored) { }
        JSObject out = new JSObject();
        out.put("sms", sms);
        call.resolve(out);
    }

    /** Backup export: the web view cannot download files, so write it to cache and open the Android share sheet. */
    @PluginMethod
    public void shareFile(PluginCall call) {
        String name = call.getString("filename", "arthaly-backup.json").replaceAll("[^A-Za-z0-9._-]", "_");
        String content = call.getString("content", "");
        String mime = call.getString("mime", "application/json");
        try {
            File dir = new File(getContext().getCacheDir(), "exports");
            if (!dir.exists()) dir.mkdirs();
            File f = new File(dir, name);
            try (FileOutputStream out = new FileOutputStream(f)) {
                out.write(content.getBytes(StandardCharsets.UTF_8));
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(mime);
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(send, "Save or send backup"));
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not share the file: " + e.getMessage());
        }
    }

    /** Returns (and clears) bank SMS captured since the last call. */
    @PluginMethod
    public void drain(PluginCall call) {
        JSObject out = new JSObject();
        out.put("messages", fromJson(SmsStore.drain(getContext())));
        call.resolve(out);
    }

    /** One-time import of financial SMS from the inbox for the last N days. */
    @PluginMethod
    public void readInbox(PluginCall call) {
        if (getPermissionState("sms") != com.getcapacitor.PermissionState.GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }
        int days = call.getInt("days", 30);
        long since = System.currentTimeMillis() - days * 86400000L;
        JSArray list = new JSArray();
        try (Cursor c = getContext().getContentResolver().query(
                Uri.parse("content://sms/inbox"),
                new String[] { "address", "body", "date" },
                "date>?", new String[] { String.valueOf(since) },
                "date ASC")) {
            while (c != null && c.moveToNext()) {
                String body = c.getString(1);
                if (SmsStore.looksFinancial(body)) list.put(SmsStore.item(c.getString(0), body, c.getLong(2)));
            }
        } catch (Exception e) {
            call.reject("Could not read inbox: " + e.getMessage());
            return;
        }
        JSObject out = new JSObject();
        out.put("messages", list);
        call.resolve(out);
    }

    /** Remembers whether the user turned notifications on, so the receiver can honour it when the app is closed. */
    @PluginMethod
    public void setNotify(PluginCall call) {
        Notifier.setEnabled(getContext(), Boolean.TRUE.equals(call.getBoolean("enabled", false)));
        call.resolve();
    }

    /** Shows a notification (budget alerts raised by the web app). */
    @PluginMethod
    public void showNotification(PluginCall call) {
        Notifier.post(getContext(), call.getInt("id", 1), call.getString("title", "Arthaly"), call.getString("body", ""));
        call.resolve();
    }

    private static JSArray fromJson(JSONArray a) {
        JSArray r = new JSArray();
        for (int i = 0; i < a.length(); i++) r.put(a.opt(i));
        return r;
    }
}
