/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Box, Text } from "@theme-ui/components";
import { useRef, useState, useEffect } from "react";
import { Icon } from "@notesnook/ui";
import { Icons } from "../../toolbar/icons.js";
import { ReactNodeViewProps } from "../react/index.js";
import { ToolbarGroup } from "../../toolbar/components/toolbar-group.js";
import { DesktopOnly } from "../../components/responsive/index.js";
import { toBlobURL, revokeBloburl } from "../../utils/downloader.js";
import { AudioAttributes } from "./audio.js";

export function AudioComponent(props: ReactNodeViewProps<AudioAttributes>) {
  const { editor, node, selected } = props;
  const { filename, size, progress, mime, hash } = node.attrs;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (editor.storage?.getAttachmentData && hash) {
      setIsLoading(true);
      setError(undefined);
      
      editor.storage
        .getAttachmentData({
          type: "file",
          hash
        })
        .then((data: string | undefined) => {
          if (data) {
            try {
              const url = toBlobURL(data, "other", mime, hash);
              if (url) {
                setAudioSrc(url);
              } else {
                setError("Failed to create audio URL");
              }
            } catch (error) {
              console.error("Failed to create audio blob:", error);
              setError("Failed to load audio file");
            }
          } else {
            setError("No audio data found");
          }
        })
        .catch((error) => {
          console.error("Failed to get attachment data:", error);
          setError("Failed to load audio file");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editor.storage, hash, mime]);

  useEffect(() => {
    return () => {
      if (audioSrc && hash) {
        revokeBloburl(hash);
      }
    };
  }, [audioSrc, hash]);

  const isUploading = progress !== undefined && progress < 100;

  return (
    <Box
      ref={elementRef}
      contentEditable={false}
      variant="body"
      sx={{
        display: "block",
        position: "relative",
        userSelect: "none",
        backgroundColor: "var(--background-secondary)",
        m: 2,
        p: 3,
        borderRadius: "default",
        border: "1px solid var(--border)",
        borderColor: selected ? "accent" : "border",
        maxWidth: "100%",
        width: "fit-content",
        minWidth: "300px",
        ":hover": {
          bg: "hover"
        }
      }}
      title={filename}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      data-drag-handle
    >
      {/* Header with file info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2
        }}
      >
        <Icon path={Icons.attachment} size={20} />
        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
          <Text
            as="div"
            sx={{
              fontSize: "body",
              fontWeight: "body",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}
          >
            {filename}
          </Text>
          <Text
            as="div"
            sx={{
              fontSize: "0.75rem",
              color: "var(--paragraph-secondary)",
              mt: 1
            }}
          >
            {isUploading ? `Uploading... ${progress}%` : formatBytes(size)}
          </Text>
        </Box>
      </Box>

      {/* Audio player or loading/error state */}
      {isUploading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60px",
            bg: "var(--background-tertiary)",
            borderRadius: "default"
          }}
        >
          <Text sx={{ color: "var(--paragraph-secondary)" }}>
            Uploading audio... {progress}%
          </Text>
        </Box>
      ) : isLoading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60px",
            bg: "var(--background-tertiary)",
            borderRadius: "default"
          }}
        >
          <Text sx={{ color: "var(--paragraph-secondary)" }}>
            Loading audio...
          </Text>
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60px",
            bg: "var(--background-tertiary)",
            borderRadius: "default",
            border: "1px solid var(--border-error)"
          }}
        >
          <Icon path={Icons.imageFailed} size={16} sx={{ mr: 2, color: "error" }} />
          <Text sx={{ color: "error" }}>{error}</Text>
        </Box>
      ) : audioSrc ? (
        <Box
          sx={{
            width: "100%",
            "& audio": {
              width: "100%",
              height: "40px",
              borderRadius: "default"
            }
          }}
        >
          <audio controls preload="metadata" src={audioSrc}>
            Your browser does not support the audio element.
          </audio>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60px",
            bg: "var(--background-tertiary)",
            borderRadius: "default"
          }}
        >
          <Text sx={{ color: "var(--paragraph-secondary)" }}>
            Audio not available
          </Text>
        </Box>
      )}

      {/* Toolbar */}
      <DesktopOnly>
        {selected && !isDragging && (
          <ToolbarGroup
            editor={editor}
            groupId="audioTools"
            tools={
              editor.isEditable
                ? ["removeAudio", "downloadAttachment"]
                : ["downloadAttachment"]
            }
            sx={{
              boxShadow: "menu",
              borderRadius: "default",
              bg: "background",
              position: "absolute",
              top: -35,
              right: 0
            }}
          />
        )}
      </DesktopOnly>
    </Box>
  );
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "K", "M", "G", "T", "P", "E", "Z", "Y"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
