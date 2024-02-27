import { TaskQueryResponse } from "../../apiTypes/SubmissionTypes";
import { genericApiFetch } from "./fetchWrappers";

async function fetchLocalZip(fileName: string) {
  if (!fileName.endsWith(".zip")) {
    throw new Error(`File must be a .zip!`);
  }
  const filesRes = await fetch(`/themes_custom/${fileName}`);
  if (!filesRes.ok) {
    throw new Error(`Couldn't fetch zip!`);
  }
  const rawBlob = await filesRes.blob();
  const correctBlob = new Blob([rawBlob], { type: "application/x-zip-compressed" });
  return correctBlob;
}

export async function uploadZipAsBlob(fileName: string): Promise<string> {
  if (!fileName.endsWith(".zip")) {
    throw new Error(`File must be a .zip!`);
  }
  const fileBlob = await fetchLocalZip(fileName);
  console.log("BLOB", fileBlob);
  const formData = new FormData();
  formData.append("File", fileBlob, fileName);
  console.log("FORM", formData);

  const json = await genericApiFetch(
    "/blobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    },
    { requiresAuth: true }
  );
  if (json) {
    return json;
  }
  throw new Error(`No json returned!`);
}

export async function publishProfile(
  profileId: string,
  isPublic: boolean,
  description: string
): Promise<string> {
  // const zipName = `${profileId}.zip`;
  const zipName = "round.zip";
  const blobId = await uploadZipAsBlob(zipName);
  if (!blobId) throw new Error(`No blobId returned!`);

  // ALL OF THIS IS UNTESTED, BLOB IS 415'ing RN
  const json = await genericApiFetch(
    `/submissions/css_zip`,
    {
      method: "POST",
      body: JSON.stringify({
        blob: blobId,
        imageBlobs: [],
        description: description,
        privateSubmission: !isPublic,
      }),
    },
    { requiresAuth: true }
  );
  if (!json || !json.task) throw new Error(`No task returned`);
  return json.task;
}

export async function getTaskStatus(taskId: string): Promise<TaskQueryResponse> {
  return await genericApiFetch(`/tasks/${taskId}`, undefined, { requiresAuth: true });
}
