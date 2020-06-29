import CloudReplica from "./Dexie";

export default async function getCloudReplica() {
  return CloudReplica.ByName("cloudReplica");
}
