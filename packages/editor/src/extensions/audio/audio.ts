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

import { Node, mergeAttributes, findChildren } from "@tiptap/core";
import { hasSameAttributes } from "../../utils/prosemirror.js";
import { getDataAttribute } from "../attachment/index.js";
import { createNodeView } from "../react/index.js";
import { AudioComponent } from "./component.js";

export interface AudioOptions {
  HTMLAttributes: Record<string, unknown>;
}

export type BaseAudioAttachment = {
  hash: string;
  filename: string;
  mime: string;
  size: number;
  progress?: number;
};

export type AudioAttachment = BaseAudioAttachment & {
  type: "audio";
};

export type AudioAttributes = AudioAttachment & {
  src?: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Insert an audio player
       */
      insertAudio: (options: Partial<AudioAttributes>) => ReturnType;
      /**
       * Remove an audio player
       */
      removeAudio: () => ReturnType;
      /**
       * Update audio attributes
       */
      updateAudio: (
        audio: Partial<AudioAttributes>,
        options: {
          preventUpdate?: boolean;
          ignoreEdit?: boolean;
          query: (audio: AudioAttributes) => boolean;
        }
      ) => ReturnType;
    };
  }
}

export const AudioNode = Node.create<AudioOptions>({
  name: "audio",
  content: "",
  marks: "",
  draggable: true,
  priority: 51,

  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },

  group() {
    return "block";
  },

  addAttributes() {
    return {
      type: { default: "audio", rendered: false },
      progress: {
        default: 0,
        rendered: false
      },
      src: {
        default: null,
        rendered: false
      },
      hash: getDataAttribute("hash"),
      filename: getDataAttribute("filename"),
      mime: getDataAttribute("mime"),
      size: getDataAttribute("size")
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-hash][data-mime^='audio/']"
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    ];
  },

  addNodeView() {
    return createNodeView(AudioComponent, {
      shouldUpdate: (prev, next) => !hasSameAttributes(prev.attrs, next.attrs),
      forceEnableSelection: true
    });
  },

  addCommands() {
    return {
      insertAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          });
        },
      removeAudio:
        () =>
        ({ commands }) => {
          return commands.deleteSelection();
        },
      updateAudio:
        (audio, options) =>
        ({ state, tr, dispatch }) => {
          const audioNodes = findChildren(
            state.doc,
            (node) =>
              node.type.name === this.name &&
              options.query(node.attrs as AudioAttributes)
          );
          if (!audioNodes.length) return false;

          for (const { node, pos } of audioNodes) {
            const progress = audio.progress || node.attrs.progress;
            tr.setNodeMarkup(pos, node.type, {
              ...node.attrs,
              ...audio,
              progress:
                progress !== undefined && progress < 100 ? progress : undefined
            });
          }
          tr.setMeta("preventUpdate", options.preventUpdate || false);
          tr.setMeta("ignoreEdit", options.ignoreEdit || false);
          tr.setMeta("addToHistory", false);
          if (dispatch) dispatch(tr);
          return true;
        }
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-U": () =>
        this.editor.storage.openAttachmentPicker?.("audio") || true
    };
  }
});
