"use client";

import { IKImage, ImageKitProvider, IKUpload, IKVideo } from "imagekitio-next";
import config from "@/lib/config";
import ImageKit from "imagekit";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const {
  publicKey,
  urlEndpoint,
  privateKey, // Destructure correctly
} = config.env.imagekit;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();

    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

interface Props {
  type: "image" | "video"; //
  accept: string; //
  placeholder: string; //
  folder: string; //
  variant: "dark" | "light"; //
  onFileChange: (filePath: string) => void;
  value?: string;
}

const FileUpload = ({
  type, //
  accept, //
  placeholder, //
  folder, //
  variant, //
  onFileChange,
  value,
}: Props) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });
  const [progress, setProgress] = useState(0); //

  const styles = {
    //
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  }; //

  const onError = (error: any) => {
    console.log(error);

    toast({
      title: `${type} upload failed`, //
      description: `Your ${type} could not be uploaded. Please try again.`, //
      variant: "destructive",
    });
  };

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast({
      title: `${type} uploaded successfully`, //
      description: `${res.filePath} uploaded successfully!`, //
    });
  };

  const onValidate = (file: File) => {
    //
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        //20MB
        toast({
          title: "File size too large",
          description: "Please upload a file that is less than 20MB in size",
          variant: "destructive",
        });

        return false;
      }
    } else if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        //50MB
        toast({
          title: "File size too large",
          description: "Please upload a file that is less than 50MB in size",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  }; // full function modified for usage for video

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator} // No arguments here
    >
      <IKUpload
        ref={ikUploadRef} //--
        onError={onError} //--
        onSuccess={onSuccess} //--
        // removed filename
        useUniqueFileName={true} //
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.round((loaded / total) * 100);

          setProgress(percent);
        }}
        folder={folder}
        accept={accept} // this is used bc for id we are not in need of getting video only img should be accepted
        className="hidden" //
      />

      <button
        className={cn("upload-btn", styles.button)} //styles.btn added extra
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        {/* p tag down is modified */}
        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>

        {file && (
          <p className={cn("upload-filename", styles.text)}>{file.filePath}</p>
        )}
      </button>

      {progress > 0 &&
        progress !== 100 && ( //
          <div className="w-full rounded-full bg-green-200">
            <div className="progress" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
          //
        )}

      {file && //
        (type === "image" ? (
          file.filePath ? (
            <IKImage
              alt="file"
              path={file.filePath} // path will be a string here
              width={500}
              height={300}
            />
          ) : null
        ) : type === "video" ? (
          file.filePath ? (
            <IKVideo
              path={file.filePath} // path will be a string here
              controls={true}
              className="h-96 w-full rounded-xl"
            />
          ) : null //
        ) : null)}
    </ImageKitProvider>
  );
};

export default FileUpload;
