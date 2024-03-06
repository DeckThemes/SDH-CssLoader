import { useState, useEffect, useRef } from "react";
import { TaskQueryResponse } from "../apiTypes/SubmissionTypes";
import { getTaskStatus } from "../backend/apiHelpers/profileUploadingHelpers";
import { DialogButton, Focusable } from "decky-frontend-lib";
import { Loading } from "./Loading";

export function TaskStatus({
  uploadStatus,
  setUploadStatus,
  errorData,
  taskId,
  onFinish,
}: {
  errorData: string | undefined;
  uploadStatus: "submitting" | "taskStatus" | "completed" | "error";
  setUploadStatus: (status: "submitting" | "taskStatus" | "completed" | "error") => void;
  taskId: string | undefined;
  onFinish: () => void;
}) {
  const [apiStatus, setStatus] = useState<TaskQueryResponse | null>(null);

  async function getStatus() {
    if (taskId) {
      const data = await getTaskStatus(taskId);
      setStatus(data);
    }
  }
  useEffect(() => {
    if (!apiStatus) return;

    if (apiStatus.completed) {
      setUploadStatus("completed");
      return;
    }

    setTimeout(() => {
      getStatus();
    }, 1000);
  }, [apiStatus]);

  useEffect(() => {
    getStatus();
  }, [taskId]);

  if (["submitting", "taskStatus"].includes(uploadStatus)) {
    return (
      <div
        style={{
          minHeight: "127px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </div>
    );
  }

  if (uploadStatus === "error") {
    return (
      <Focusable style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold" }}>Error Submitting Theme!</span>
        <span>{errorData}</span>
      </Focusable>
    );
  }

  return <TaskStatusFinishedDisplay apiStatus={apiStatus} onFinish={onFinish} />;
}

// This was split out essentially just so the ref works
function TaskStatusFinishedDisplay({
  apiStatus,
  onFinish,
}: {
  apiStatus: TaskQueryResponse | null;
  onFinish: () => void;
}) {
  const closeButtonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeButtonRef?.current && closeButtonRef.current.focus();
  }, [closeButtonRef]);

  return (
    <>
      <Focusable style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: apiStatus?.success ? "#10b981" : "#ef4444",
          }}
        >
          Profile Upload {apiStatus?.success ? "Succeeded" : "Failed"}
        </span>
        <span>{apiStatus?.status}</span>
        <Focusable style={{ display: "flex", gap: "1em", justifyContent: "end" }}>
          <DialogButton ref={closeButtonRef} onClick={onFinish}>
            <span>Close</span>
          </DialogButton>
        </Focusable>
      </Focusable>
    </>
  );
}
