import { refreshToken } from "../../api";
import { TaskQueryResponse } from "../../apiTypes/SubmissionTypes";
import { server } from "../pythonRoot";
import { genericApiFetch } from "./fetchWrappers";

type BlobResponse = {
  message: {
    blobType: string;
    downloadCount: number;
    id: string;
    uploaded: string;
  };
};

export async function publishProfile(
  profileName: string,
  isPublic: boolean,
  description: string
): Promise<string> {
  const token = await refreshToken();

  const deckyRes = await server!.callPluginMethod<{}, BlobResponse>("upload_theme", {
    name: profileName,
    base_url: "https://api.deckthemes.com",
    bearer_token: token,
  });
  if (!deckyRes.success) {
    throw new Error(`Failed To Call Backend ${deckyRes.result.toString()}`);
  }
  deckyRes.result = deckyRes.result as BlobResponse;
  if (!deckyRes.result?.message?.id) {
    throw new Error(`No blobId returned!`);
  }
  const blobId = deckyRes.result.message.id;
  try {
    const json = await genericApiFetch(
      `/submissions/css_zip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blob: blobId,
          meta: {
            imageBlobs: [],
            description: description,
            privateSubmission: !isPublic,
          },
        }),
      },
      {
        requiresAuth: true,
        onError: () => {
          throw new Error(`Error Posting Request`);
        },
      }
    );
    if (!json || !json.task) throw new Error(`No task returned`);
    return json.task;
  } catch (error) {
    throw new Error(`Failed to submit profile: ${error}`);
  }
}

export async function getTaskStatus(taskId: string): Promise<TaskQueryResponse> {
  return await genericApiFetch(`/tasks/${taskId}`, undefined, { requiresAuth: true });
}
