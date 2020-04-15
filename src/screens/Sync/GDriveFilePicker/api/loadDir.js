/*
 * example gdrive entry
 * {
 *   "kind": "drive#file",
 *   "id": "0Bw9P99xSQYrCMjJjMTYzMmYtODE0OC00NGQ1LTliOGUtZDI2NDhmZTFkNDQ4",
 *   "name": "Documents",
 *   "mimeType": "application/vnd.google-apps.folder"
 * }
*/

const getFileType = entry => {
    return entry.mimeType.includes("folder") ? "directory" : "file";
};

const gdriveEntryToNode = entry => ({
  fileType: getFileType(entry),
  id: entry.id,
  name: entry.name,
  mimeType: entry.mimeType,
});

export default async function gDriveLoadDir({ id }) {
    try {
        const entries = await window.gapi.client.drive.files.list({
            "orderBy": "name_natural",
            "q": `'${id}' in parents`
        });

        return {
            contents: entries.result.files.map(gdriveEntryToNode)
        };
    } catch(err) {
        console.error(err);
        throw new Error('Error trying to load Google Drive folder');
    }
}
