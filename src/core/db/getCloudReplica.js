import db from "./db";

export default async function getCloudReplica() {
  return db.ByName("cloudReplica");
}
