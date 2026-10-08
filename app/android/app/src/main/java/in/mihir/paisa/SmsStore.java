package in.mihir.paisa;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.regex.Pattern;

/** Keeps bank SMS received while the app is closed, until the web app drains them. */
final class SmsStore {
    private static final String PREFS = "paisa_sms";
    private static final String KEY = "pending";
    private static final int MAX_PENDING = 500;
    private static final Pattern AMOUNT = Pattern.compile("(rs\\.?|inr|₹)\\s*[\\d,]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern MOVEMENT = Pattern.compile(
        "\\b(debited|credited|spent|withdrawn|received|deposited|paid|sent|purchase|refund|deducted)\\b",
        Pattern.CASE_INSENSITIVE);

    private SmsStore() {}

    /** Only money-movement messages are kept; OTPs, chats and promos never leave the SMS app. */
    static boolean looksFinancial(String body) {
        return body != null && AMOUNT.matcher(body).find() && MOVEMENT.matcher(body).find();
    }

    static synchronized void add(Context ctx, String sender, String body, long ts) {
        if (!looksFinancial(body)) return;
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            JSONArray arr = new JSONArray(p.getString(KEY, "[]"));
            if (arr.length() >= MAX_PENDING) return;
            arr.put(item(sender, body, ts));
            p.edit().putString(KEY, arr.toString()).apply();
        } catch (Exception ignored) { }
    }

    static synchronized JSONArray drain(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            JSONArray arr = new JSONArray(p.getString(KEY, "[]"));
            p.edit().remove(KEY).apply();
            return arr;
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    static JSONObject item(String sender, String body, long ts) throws Exception {
        return new JSONObject().put("sender", sender).put("body", body).put("ts", ts);
    }
}
