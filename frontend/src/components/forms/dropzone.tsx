import { FC, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const Dropzone: FC = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    console.log(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed border-gray-300 rounded-md p-4 bg-gray-100 text-center"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-sm text-gray-500">Drop the files here ...</p>
      ) : (
        <p className="text-sm text-gray-500">Click or drop files here</p>
      )}
    </div>
  );
};
