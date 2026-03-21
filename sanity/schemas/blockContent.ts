import { defineType } from "sanity";

export const blockContent = defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    { type: "block" },
    {
      type: "image",
      options: { hotspot: true },
    },
  ],
});
