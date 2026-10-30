import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

export type Saved = { ok: true; message: string; dir?: string } | { ok: false; error: string; cancelled?: boolean };

const SAF = FileSystem.StorageAccessFramework;

/**
 * Saves a text file with one tap. On Android the first save asks for a folder (say Downloads), and that folder is
 * remembered by the caller (`dir`), so every later save is a single tap. On the web it is a normal download.
 */
export async function saveTextFile(fileName: string, text: string, mime: string, dir: string | null): Promise<Saved> {
  try {
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([text], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return { ok: true, message: `Saved ${fileName} to your downloads.` };
    }
    if (Platform.OS !== 'android') {
      await Share.share({ message: text, title: fileName });
      return { ok: true, message: 'Shared.' };
    }
    const base = fileName.replace(/\.[^.]+$/, '');
    const write = async (folder: string) => {
      const uri = await SAF.createFileAsync(folder, base, mime);
      await SAF.writeAsStringAsync(uri, text);
    };
    if (dir) {
      try {
        await write(dir);
        return { ok: true, message: `Saved ${fileName} in your folder.`, dir };
      } catch {
        // the folder was removed or its permission was lost: ask again below
      }
    }
    const perm = await SAF.requestDirectoryPermissionsAsync();
    if (!perm.granted) return { ok: false, error: 'No folder was chosen, so nothing was saved.', cancelled: true };
    await write(perm.directoryUri);
    return { ok: true, message: `Saved ${fileName} in the folder you chose.`, dir: perm.directoryUri };
  } catch (e) {
    return { ok: false, error: `Could not save the file. ${e instanceof Error ? e.message : ''}`.trim() };
  }
}

/** Lets the person pick a backup file and returns its text. */
export async function pickTextFile(): Promise<{ ok: true; text: string } | { ok: false; error: string; cancelled?: boolean }> {
  try {
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
    if (r.canceled || !r.assets?.length) return { ok: false, error: '', cancelled: true };
    const uri = r.assets[0].uri;
    const text = Platform.OS === 'web' ? await (await fetch(uri)).text() : await FileSystem.readAsStringAsync(uri);
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: `Could not read the file. ${e instanceof Error ? e.message : ''}`.trim() };
  }
}
