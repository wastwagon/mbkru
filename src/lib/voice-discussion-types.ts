/** Serializable Voice discussion payload (shared server + client). */

export type VoiceDiscussionCommentPayload = {
  id: string;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
  authorLabel: string;
  reactions: { LIKE: number; THANK: number; INSIGHT: number };
  viewerReaction: "LIKE" | "THANK" | "INSIGHT" | null;
};

export type VoiceDiscussionPayload = {
  id: string;
  title: string;
  body: string;
  kind: string;
  status: string;
  createdAt: string;
  /** Viewer has a member session (support/comments/reactions require sign-in). */
  sessionSignedIn: boolean;
  regionName: string | null;
  figure: {
    name: string;
    slug: string;
    role: string;
    party: string | null;
  } | null;
  supportCount: number;
  viewerSupported: boolean;
  comments: VoiceDiscussionCommentPayload[];
};
