package in.mihir.paisa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Fires for every incoming SMS, even when the app is not running. */
public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;
        SmsMessage[] parts = Telephony.Sms.Intents.getMessagesFromIntent(intent);
        if (parts == null || parts.length == 0) return;
        StringBuilder body = new StringBuilder();
        for (SmsMessage m : parts) body.append(m.getMessageBody());
        String sender = parts[0].getOriginatingAddress();
        long ts = parts[0].getTimestampMillis();
        boolean added = SmsStore.add(ctx, sender == null ? "" : sender, body.toString(), ts);
        if (added && Notifier.enabled(ctx)) {
            Notifier.post(ctx, (int) (ts % 90000) + 1000, "New bank transaction", summary(body.toString()));
        }
        PaisaSmsPlugin.notifyNewSms();
    }

    private static final Pattern AMOUNT = Pattern.compile("(rs\\.?|inr|₹)\\s*([\\d,]+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern DEBIT = Pattern.compile("debited|spent|withdrawn|paid|sent|purchase|deducted", Pattern.CASE_INSENSITIVE);
    private static final Pattern CREDIT = Pattern.compile("credited|received|deposited|refund", Pattern.CASE_INSENSITIVE);

    /** Amount and direction only, so nothing sensitive shows on the lock screen. */
    private static String summary(String body) {
        Matcher a = AMOUNT.matcher(body);
        String amt = a.find() ? "₹" + a.group(2) : "A transaction";
        Matcher d = DEBIT.matcher(body), c = CREDIT.matcher(body);
        boolean hasD = d.find(), hasC = c.find();
        String dir = hasD && (!hasC || d.start() < c.start()) ? " debited" : hasC ? " credited" : "";
        return amt + dir + ". Open Arthaly to review.";
    }
}
