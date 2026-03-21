import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "PDF", value: "pdf" },
          { title: "Document", value: "document" },
          { title: "Report", value: "report" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      options: { accept: ".pdf,.doc,.docx" },
    }),
    defineField({
      name: "externalUrl",
      title: "External URL (if not uploading file)",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", type: "type" },
    prepare({ title, type }) {
      return { title: title, subtitle: type };
    },
  },
});
