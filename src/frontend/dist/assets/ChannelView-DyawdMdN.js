import { c as createLucideIcon, u as useGetChannel, a as useGetChannelPosts, b as useFollowChannel, d as useUnfollowChannel, e as useAddChannelPost, f as useMediaUpload, r as reactExports, g as useDeleteChannel, m as markChannelAsViewed, h as ue, j as jsxRuntimeExports, S as Skeleton, B as Button, A as ArrowLeft, i as Avatar, k as AvatarImage, l as AvatarFallback, U as Users, D as DropdownMenu, n as DropdownMenuTrigger, E as EllipsisVertical, o as DropdownMenuContent, p as DropdownMenuItem, q as SquarePen, T as Trash2, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, C as AlertDialogAction, L as LoaderCircle, F as Textarea, I as Input, X, M as Mic, G as Send, H as Image, V as Video, J as ScrollArea, K as ChannelPostCard, N as useUpdateChannel, O as Dialog, P as DialogContent, Q as DialogHeader, R as DialogTitle, W as Camera, Y as Label } from "./index-BGEpdXd_.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode);
const POSTS_PAGE_SIZE = 9;
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function detectEmbedPlatform(url) {
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/") || url.includes("youtube.com/shorts/"))
    return "youtube";
  if (url.includes("twitter.com/") || url.includes("x.com/")) return "x";
  if (url.includes("tiktok.com/") || url.includes("vt.tiktok.com"))
    return "tiktok";
  return null;
}
function EditChannelModal({
  open,
  onOpenChange,
  channelId,
  initialName,
  initialDescription,
  initialAvatarUrl
}) {
  const [name, setName] = reactExports.useState(initialName);
  const [description, setDescription] = reactExports.useState(initialDescription);
  const [avatarPreview, setAvatarPreview] = reactExports.useState(
    initialAvatarUrl ?? null
  );
  const [pendingAvatar, setPendingAvatar] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const { mutateAsync: updateChannel, isPending } = useUpdateChannel();
  const { uploadMedia, isUploading } = useMediaUpload();
  const isBusy = isPending || isUploading;
  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      let avatarUrl = initialAvatarUrl;
      if (pendingAvatar) {
        const result = await uploadMedia(pendingAvatar);
        avatarUrl = result.url;
      }
      await updateChannel({
        channelId,
        name: name.trim(),
        description: description.trim(),
        avatarUrl
      });
      ue.success("Channel updated");
      onOpenChange(false);
    } catch {
      ue.error("Failed to update channel");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "channel.edit.dialog",
      className: "bg-card border-border max-w-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-foreground", children: "Edit Channel" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "relative group",
                onClick: () => {
                  var _a;
                  return (_a = fileRef.current) == null ? void 0 : _a.click();
                },
                disabled: isBusy,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "w-20 h-20", children: [
                    avatarPreview && /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: avatarPreview, alt: "avatar" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AvatarFallback,
                      {
                        className: "text-2xl font-bold",
                        style: {
                          background: "oklch(0.76 0.13 72 / 0.3)",
                          color: "oklch(0.82 0.15 72)"
                        },
                        children: getInitials(name || "CH")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                      style: { background: "oklch(0 0 0 / 0.5)" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-6 w-6 text-white" })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => {
                  var _a;
                  const f = (_a = e.target.files) == null ? void 0 : _a[0];
                  if (f) {
                    setPendingAvatar(f);
                    setAvatarPreview(URL.createObjectURL(f));
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground", children: "Channel Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "channel.edit.input",
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "bg-input border-border",
                maxLength: 60
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-muted-foreground", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "data-ocid": "channel.edit.textarea",
                value: description,
                onChange: (e) => setDescription(e.target.value),
                className: "bg-input border-border resize-none h-20",
                maxLength: 300
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "channel.edit.cancel_button",
              variant: "ghost",
              onClick: () => onOpenChange(false),
              disabled: isBusy,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "channel.edit.save_button",
              onClick: handleSubmit,
              disabled: isBusy || !name.trim(),
              style: {
                background: "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                color: "oklch(0.08 0.004 55)"
              },
              children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save"
            }
          )
        ] })
      ]
    }
  ) });
}
function ChannelView({
  channelId,
  currentUserId,
  onBack
}) {
  const { data: channelMeta, isLoading: channelLoading } = useGetChannel(channelId);
  const { data: posts = [], isLoading: postsLoading } = useGetChannelPosts(channelId);
  const { mutate: follow, isPending: following } = useFollowChannel();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowChannel();
  const { mutateAsync: addPost, isPending: posting } = useAddChannelPost(channelId);
  const { uploadMedia, isUploading } = useMediaUpload();
  const [postText, setPostText] = reactExports.useState("");
  const [pendingMedia, setPendingMedia] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = reactExports.useState(false);
  const [postsPage, setPostsPage] = reactExports.useState(1);
  const { mutateAsync: deleteChannel, isPending: deleting } = useDeleteChannel();
  const imageRef = reactExports.useRef(null);
  const videoRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const recordingChunksRef = reactExports.useRef([]);
  const recordingTimerRef = reactExports.useRef(null);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingSeconds, setRecordingSeconds] = reactExports.useState(0);
  const [showEmbedInput, setShowEmbedInput] = reactExports.useState(false);
  const [embedUrl, setEmbedUrl] = reactExports.useState("");
  reactExports.useEffect(() => {
    markChannelAsViewed(channelId.toString());
  }, [channelId]);
  reactExports.useEffect(() => {
    return () => {
      var _a;
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (((_a = mediaRecorderRef.current) == null ? void 0 : _a.state) === "recording") {
        mediaRecorderRef.current.stop();
        for (const t of mediaRecorderRef.current.stream.getTracks()) {
          t.stop();
        }
      }
    };
  }, []);
  const isBusy = posting || isUploading;
  const detectedPlatform = embedUrl.trim() ? detectEmbedPlatform(embedUrl.trim()) : null;
  const startRecording = reactExports.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      recordingChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1e3);
    } catch {
      ue.error("Microphone access denied");
    }
  }, []);
  const stopRecording = reactExports.useCallback(() => {
    var _a;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (((_a = mediaRecorderRef.current) == null ? void 0 : _a.state) === "recording") {
      mediaRecorderRef.current.stop();
      for (const t of mediaRecorderRef.current.stream.getTracks()) {
        t.stop();
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);
  const cancelRecording = reactExports.useCallback(() => {
    stopRecording();
    recordingChunksRef.current = [];
  }, [stopRecording]);
  const sendRecording = reactExports.useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    await new Promise((resolve) => {
      recorder.onstop = () => resolve();
      if (recorder.state === "recording") {
        recorder.stop();
        for (const t of recorder.stream.getTracks()) {
          t.stop();
        }
      } else {
        resolve();
      }
    });
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    const mimeType = recorder.mimeType || "audio/webm";
    const blob = new Blob(recordingChunksRef.current, { type: mimeType });
    recordingChunksRef.current = [];
    const ext = mimeType.includes("ogg") ? "ogg" : "webm";
    const audioFile = new File([blob], `audio_recording.${ext}`, {
      type: mimeType
    });
    try {
      const result = await uploadMedia(audioFile);
      await addPost({
        text: postText.trim(),
        mediaUrl: result.url,
        mediaType: result.mediaType
      });
      setPostText("");
      setPendingMedia(null);
      setPostsPage(1);
      ue.success("Post published!");
    } catch {
      ue.error("Failed to publish post");
    }
  }, [addPost, uploadMedia, postText]);
  if (channelLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "channel.view.loading_state",
        className: "flex flex-col h-full",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32 mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-4 flex flex-col gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }, i)) })
        ]
      }
    );
  }
  if (!channelMeta) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "channel.view.error_state",
        className: "flex-1 flex items-center justify-center text-muted-foreground",
        children: "Channel not found"
      }
    );
  }
  const { channel, followerCount, isFollowing, ownerProfile } = channelMeta;
  const isOwner = channel.owner.toString() === currentUserId;
  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollow(channelId);
    } else {
      follow(channelId);
    }
  };
  const handlePost = async () => {
    const hasEmbed = embedUrl.trim() && detectedPlatform;
    if (!postText.trim() && !pendingMedia && !hasEmbed) return;
    try {
      let mediaUrl;
      let mediaType;
      if (hasEmbed) {
        mediaUrl = embedUrl.trim();
        const platformMap = {
          youtube: "embedYouTube",
          x: "embedX",
          tiktok: "embedTikTok"
        };
        mediaType = { other: platformMap[detectedPlatform] };
      } else if (pendingMedia) {
        const result = await uploadMedia(pendingMedia);
        mediaUrl = result.url;
        mediaType = result.mediaType;
      }
      await addPost({
        text: postText.trim(),
        mediaUrl,
        mediaType
      });
      setPostText("");
      setPendingMedia(null);
      setEmbedUrl("");
      setShowEmbedInput(false);
      setPostsPage(1);
      ue.success("Post published!");
    } catch {
      ue.error("Failed to publish post");
    }
  };
  const formatRecordingTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const sortedPosts = [...posts].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );
  const visiblePosts = sortedPosts.slice(0, postsPage * POSTS_PAGE_SIZE);
  const hasMorePosts = sortedPosts.length > postsPage * POSTS_PAGE_SIZE;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "shrink-0 border-b border-border px-4 py-3",
        style: {
          background: "linear-gradient(135deg, oklch(0.12 0.01 55), oklch(0.10 0.008 55))"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: onBack,
                className: "h-9 w-9 rounded-xl hover:bg-muted md:hidden",
                "data-ocid": "channel.view.button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "w-12 h-12 shrink-0", children: [
              channel.avatarUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: channel.avatarUrl, alt: channel.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarFallback,
                {
                  className: "text-lg font-bold",
                  style: {
                    background: "linear-gradient(135deg, oklch(0.76 0.13 72 / 0.3), oklch(0.65 0.11 65 / 0.2))",
                    color: "oklch(0.82 0.15 72)"
                  },
                  children: getInitials(channel.name)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-lg text-foreground truncate", children: channel.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  Number(followerCount),
                  " followers"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "icon",
                      variant: "ghost",
                      className: "h-9 w-9 rounded-xl hover:bg-muted",
                      "data-ocid": "channel.view.open_modal_button",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    DropdownMenuContent,
                    {
                      align: "end",
                      className: "bg-card border-border",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          DropdownMenuItem,
                          {
                            onClick: () => setEditOpen(true),
                            className: "cursor-pointer",
                            "data-ocid": "channel.view.edit_button",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4 mr-2" }),
                              "Edit Channel"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          DropdownMenuItem,
                          {
                            onClick: () => setDeleteConfirmOpen(true),
                            className: "cursor-pointer text-destructive focus:text-destructive",
                            "data-ocid": "channel.view.delete_button",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                              "Delete Channel"
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialog,
                  {
                    open: deleteConfirmOpen,
                    onOpenChange: setDeleteConfirmOpen,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "bg-card border-border", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Channel" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                          'Are you sure you want to delete "',
                          channel.name,
                          '"? This action cannot be undone and all posts will be lost.'
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "channel.delete.cancel_button", children: "Cancel" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          AlertDialogAction,
                          {
                            "data-ocid": "channel.delete.confirm_button",
                            disabled: deleting,
                            onClick: async () => {
                              try {
                                await deleteChannel(channelId);
                                ue.success("Channel deleted");
                                onBack();
                              } catch {
                                ue.error("Failed to delete channel");
                              }
                            },
                            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                            children: [
                              deleting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                              "Delete"
                            ]
                          }
                        )
                      ] })
                    ] })
                  }
                )
              ] }),
              !isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: handleFollowToggle,
                  disabled: following || unfollowing,
                  size: "sm",
                  "data-ocid": "channel.view.toggle",
                  style: {
                    background: isFollowing ? "oklch(0.2 0.01 55)" : "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                    color: isFollowing ? "oklch(0.7 0.05 55)" : "oklch(0.08 0.004 55)",
                    border: isFollowing ? "1px solid oklch(0.3 0.01 55)" : "none"
                  },
                  className: "rounded-xl text-xs px-4",
                  children: following || unfollowing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : isFollowing ? "Following" : "Follow"
                }
              )
            ] })
          ] }),
          channel.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 leading-relaxed", children: channel.description })
        ]
      }
    ),
    isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "shrink-0 border-b border-border px-4 py-3 flex flex-col gap-2",
        style: { background: "oklch(0.11 0.008 55)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              "data-ocid": "channel.post.textarea",
              placeholder: "Share something with your followers...",
              value: postText,
              onChange: (e) => setPostText(e.target.value),
              className: "bg-input border-border resize-none min-h-[4rem] text-sm",
              disabled: isBusy || isRecording
            }
          ),
          pendingMedia && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-48", children: pendingMedia.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setPendingMedia(null),
                className: "text-destructive hover:underline",
                children: "Remove"
              }
            )
          ] }),
          showEmbedInput && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "channel.post.input",
                  placeholder: "Paste YouTube, X, or TikTok URL...",
                  value: embedUrl,
                  onChange: (e) => setEmbedUrl(e.target.value),
                  className: "flex-1 h-8 text-xs bg-input border-border",
                  disabled: isBusy
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setEmbedUrl("");
                    setShowEmbedInput(false);
                  },
                  className: "p-1 rounded hover:bg-muted text-muted-foreground",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                }
              )
            ] }),
            detectedPlatform && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: "text-xs font-semibold px-1",
                style: { color: "oklch(0.82 0.15 72)" },
                children: [
                  detectedPlatform === "youtube" && "▶ YouTube detected",
                  detectedPlatform === "x" && "𝕏 X / Twitter detected",
                  detectedPlatform === "tiktok" && "TT TikTok detected"
                ]
              }
            )
          ] }),
          isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2.5 w-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    style: { background: "oklch(0.55 0.22 25)" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "relative inline-flex rounded-full h-2.5 w-2.5",
                    style: { background: "oklch(0.6 0.25 25)" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Mic,
                {
                  className: "h-4 w-4",
                  style: { color: "oklch(0.6 0.25 25)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-sm font-mono font-semibold",
                  style: { color: "oklch(0.6 0.25 25)" },
                  children: formatRecordingTime(recordingSeconds)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: cancelRecording,
                className: "px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors text-muted-foreground",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                onClick: sendRecording,
                disabled: isBusy,
                style: {
                  background: "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                  color: "oklch(0.08 0.004 55)"
                },
                className: "rounded-xl text-xs px-4",
                "data-ocid": "channel.post.submit_button",
                children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3 mr-1.5" }),
                  "Send"
                ] })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "channel.post.upload_button",
                onClick: () => {
                  var _a;
                  return (_a = imageRef.current) == null ? void 0 : _a.click();
                },
                disabled: isBusy,
                className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                title: "Attach image",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a;
                  return (_a = videoRef.current) == null ? void 0 : _a.click();
                },
                disabled: isBusy,
                className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                title: "Attach video",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: startRecording,
                disabled: isBusy,
                className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                title: "Record audio",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowEmbedInput((v) => !v),
                disabled: isBusy,
                className: "p-1.5 rounded-lg hover:bg-muted transition-colors hover:text-foreground",
                style: {
                  color: showEmbedInput ? "oklch(0.82 0.15 72)" : void 0
                },
                title: "Embed YouTube / X / TikTok",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: imageRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => {
                  var _a;
                  return setPendingMedia(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: videoRef,
                type: "file",
                accept: "video/*",
                className: "hidden",
                onChange: (e) => {
                  var _a;
                  return setPendingMedia(((_a = e.target.files) == null ? void 0 : _a[0]) ?? null);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "channel.post.submit_button",
                size: "sm",
                onClick: handlePost,
                disabled: isBusy || !postText.trim() && !pendingMedia && !(embedUrl.trim() && detectedPlatform),
                style: {
                  background: "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                  color: "oklch(0.08 0.004 55)"
                },
                className: "rounded-xl text-xs px-4",
                children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3 mr-1.5" }),
                  "Post"
                ] })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 flex flex-col gap-4", children: postsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "channel.view.loading_state", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl mb-4" }, i)) }) : sortedPosts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "channel.view.empty_state",
        className: "flex flex-col items-center justify-center py-20 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 opacity-30",
              style: { background: "oklch(0.76 0.13 72 / 0.2)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Send,
                {
                  className: "h-7 w-7",
                  style: { color: "oklch(0.82 0.15 72)" }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "No posts yet" }),
          isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Share something with your followers" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      visiblePosts.map((post, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChannelPostCard,
        {
          post,
          authorName: ownerProfile.displayName,
          authorAvatar: ownerProfile.avatarUrl,
          isOwner,
          isPostAuthor: post.author.toString() === currentUserId,
          currentUserId,
          channelId,
          index: idx
        },
        post.id.toString()
      )),
      hasMorePosts && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setPostsPage((p) => p + 1),
          className: "w-full py-3 text-xs font-semibold text-center rounded-xl transition-colors hover:bg-muted/30",
          style: { color: "oklch(0.82 0.15 72)" },
          children: [
            "Load",
            " ",
            Math.min(
              POSTS_PAGE_SIZE,
              sortedPosts.length - postsPage * POSTS_PAGE_SIZE
            ),
            " ",
            "more posts"
          ]
        }
      )
    ] }) }) }),
    isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditChannelModal,
      {
        open: editOpen,
        onOpenChange: setEditOpen,
        channelId,
        initialName: channel.name,
        initialDescription: channel.description,
        initialAvatarUrl: channel.avatarUrl
      }
    )
  ] });
}
export {
  ChannelView as default
};
