import Dexie from "../../Dexie";
import { localDBName } from "./constants";

export default async function deleteLocalDBs({ except }) {
  const dbs = await Dexie.getDatabaseNames();
  return Promise.all(
    dbs
      .filter((name) => {
        return name !== except && localDBName.regex.exec(name);
      })
      .map(Dexie.delete)
  );
}
