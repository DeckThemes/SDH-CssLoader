import { useState, useEffect } from "react";
import { TaskQueryResponse } from "../apiTypes/SubmissionTypes";
import { getTaskStatus } from "../backend/apiHelpers/profileUploadingHelpers";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { ImSpinner5 } from "react-icons/im";

export function TaskStatus({
  task,
  onFinish,
}: {
  task: string;
  onFinish: (success: boolean) => void;
}) {
  const [apiStatus, setStatus] = useState<TaskQueryResponse | null>(null);

  async function getStatus() {
    if (task) {
      const data = await getTaskStatus(task);
      setStatus(data);
    }
  }
  useEffect(() => {
    if (apiStatus?.completed === null) {
      setTimeout(() => {
        getStatus();
      }, 1000);
    }
    if (apiStatus?.completed) {
      onFinish(apiStatus.success);
    }
  }, [apiStatus]);

  useEffect(() => {
    getStatus();
  }, [task]);

  if (!apiStatus) {
    return <span>Loading</span>;
  }

  // This is 100% ripped from deckthemes
  // Eventually please do re-do this
  return (
    <>
      <style>
        {`
          .flex {
            display: flex;
          }
          .flex-col {
            flex-direction: column;
          }
          .items-center {
            align-items: center;
          }
          .text-center {
            text-align: center;
          }
          .mb-8 {
            margin-bottom: 2rem;
          }
          .mb-4 {
            margin-bottom: 1rem;
          }
          .text-3xl {
            font-size: 1.875rem;
          }
          .font-semibold {
            font-weight: 600;
          }
          .capitalize {
            text-transform: capitalize;
          }
          .text-xl {
            font-size: 1.25rem;
          }
          .font-medium {
            font-weight: 500;
          }
          .text-5xl {
            font-size: 3rem;
          }
          .text-emerald-600 {
            color: #10b981;
          }
          .text-red-500 {
            color: #ef4444;
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          gap-2 {
            gap: 0.5rem;
          }
          .text-lg {
            font-size: 1.125rem;
          }
          .text-amber-600 {
            color: #f59e0b;
          }
        `}
      </style>
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <span className="font-semibold capitalize text-3xl">{apiStatus.name}</span>
          <span className="text-xl font-medium">Task {task?.split("-")[0]}</span>
        </div>
        {apiStatus.completed ? (
          <>
            <div className="mb-4">
              {apiStatus.success ? (
                <div className="flex items-center gap-2 text-5xl">
                  <BsCheckCircleFill className="text-emerald-600" />
                  <span>Success</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-5xl">
                  <BsXCircleFill className="text-red-500" />
                  <span>Failed</span>
                </div>
              )}
            </div>
            <span className="text-lg">
              {apiStatus?.success ? "Completed " : "Failed "}In{" "}
              <b>
                {(new Date(apiStatus.completed).valueOf() - new Date(apiStatus.started).valueOf()) /
                  1000}{" "}
              </b>
              Seconds
            </span>
            {!apiStatus.success && <span>{apiStatus.status}</span>}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-5xl">
              <ImSpinner5 className="animate-spin text-amber-600" />
              <span>Processing</span>
            </div>
            <span>{apiStatus.status}</span>
          </>
        )}
      </div>
    </>
  );
}
