package in.mihir.paisa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

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
        SmsStore.add(ctx, sender == null ? "" : sender, body.toString(), ts);
        PaisaSmsPlugin.notifyNewSms();
    }
}
