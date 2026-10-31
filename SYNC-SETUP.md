# Phone and PC sync (Firebase) – one-time setup

1. Open https://console.firebase.google.com and click **Add project** (name e.g. `brihad-temple`; Analytics can be off).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database** (any location, start in production mode). Then open the **Rules** tab, paste this and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid}/{doc=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
4. **Project settings (gear icon) → General → Your apps → Web app (</>)** → register. Copy `apiKey` and `projectId`.
5. In the app: **Settings → Sync** → paste API key and Project ID, enter an email and password, tap **Create account**.
6. On the other device, open the same Settings → Sync card, paste the same two values, same email and password, tap **Sign in**.
