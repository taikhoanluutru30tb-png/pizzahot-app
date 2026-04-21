"use client";

import { useMemo, useState } from "react";
import {
  CheckCheck,
  Circle,
  ImagePlus,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  accent: string;
  avatar: string;
  previewType: "text" | "image" | "file";
};

type Message = {
  id: string;
  author: string;
  content: string;
  time: string;
  outgoing?: boolean;
  hasImage?: boolean;
  hasFile?: boolean;
  seen?: boolean;
};

const conversations: Conversation[] = [
  {
    id: "team-sales",
    name: "Quản lý - Nhân viên",
    role: "Kênh chung",
    lastMessage: "Đã cập nhật lịch giao cho ca tối.",
    time: "08:42",
    unread: 3,
    online: true,
    accent: "from-[#dc2626] to-[#ef4444]",
    avatar: "Q",
    previewType: "text",
  },
  {
    id: "ctv-group",
    name: "Quản lý - CTV",
    role: "Lịch làm việc tháng 10",
    lastMessage: "Nhớ kiểm tra đơn đã chốt của hôm nay nhé.",
    time: "15:10",
    unread: 1,
    online: false,
    accent: "from-[#f59e0b] to-[#fb7185]",
    avatar: "C",
    previewType: "image",
  },
  {
    id: "shipper",
    name: "Quản lý - Shipper",
    role: "Khu vực giao hàng",
    lastMessage: "Em đang đứng ở sảnh, nhận đơn được rồi ạ.",
    time: "14:04",
    unread: 0,
    online: true,
    accent: "from-[#38bdf8] to-[#0ea5e9]",
    avatar: "S",
    previewType: "file",
  },
  {
    id: "chef-room",
    name: "Bếp - Điều phối",
    role: "Xử lý món nhanh",
    lastMessage: "Lô pizza Ocean Deluxe đã ra lò.",
    time: "12:30",
    unread: 0,
    online: false,
    accent: "from-[#8b5cf6] to-[#ec4899]",
    avatar: "B",
    previewType: "text",
  },
];

const messages: Message[] = [
  {
    id: "m1",
    author: "Trần Anh",
    content: "Chào cả nhà, hôm nay nguyên liệu hải sản về rất tươi. Chúng ta nên tập trung giới thiệu Pizza Ocean Deluxe cho khách nhé.",
    time: "09:16",
  },
  {
    id: "m2",
    author: "Bạn",
    content: "Tuyệt vời! Tối nay em sẽ cập nhật Banner khuyến mãi cho Ocean Deluxe trên hệ thống để mọi người kiểm tra xem đã thấy chưa?",
    time: "09:18",
    outgoing: true,
    seen: true,
  },
  {
    id: "m3",
    author: "Lê Thu",
    content: "Dạ em đã thấy trên POS rồi ạ. Đã sẵn sàng tư vấn cho khách.",
    time: "09:20",
  },
  {
    id: "m4",
    author: "Lê Thu",
    content: "Menu_Ocean_Update.pdf",
    time: "09:21",
    hasFile: true,
  },
  {
    id: "m5",
    author: "Bạn",
    content: "Cảm ơn Thu. Team shipper chú ý cập nhật lộ trình nhiệt cho các đơn Ocean Deluxe vì loại này cần ăn nóng mới ngon.",
    time: "09:26",
    outgoing: true,
    seen: true,
  },
];

function PreviewIcon({ type }: { type: Conversation["previewType"] }) {
  if (type === "image") return <ImagePlus className="h-3.5 w-3.5" />;
  if (type === "file") return <Paperclip className="h-3.5 w-3.5" />;
  return <Circle className="h-3 w-3 fill-current" />;
}

function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = Boolean(message.outgoing);

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[86%] sm:max-w-[72%] ${isOutgoing ? "order-2" : "order-2"}`}>
        <div className={`mb-1 text-[11px] font-semibold ${isOutgoing ? "text-right text-[#b47b74]" : "text-left text-[#9a7d77]"}`}>
          {message.author} · {message.time}
        </div>

        <div
          className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ring-1 ${
            isOutgoing
              ? "bg-[#c62828] text-white ring-[#b62020]"
              : "bg-white text-[#3d2a26] ring-[#f0e1dd]"
          }`}
        >
          {message.hasFile ? (
            <div className="flex items-center gap-3 rounded-[18px] bg-white/10 px-3 py-2">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Paperclip className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{message.content}</p>
                <p className={`text-xs ${isOutgoing ? "text-white/75" : "text-[#a38680]"}`}>1.2 MB · PDF</p>
              </div>
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {isOutgoing && (
          <div className="mt-1 flex justify-end text-[11px] text-[#b47b74]">
            {message.seen ? (
              <span className="inline-flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5" />
                Đã xem
              </span>
            ) : (
              <span>Đã gửi</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CtvMessagePage() {
  const [activeConversationId, setActiveConversationId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId],
  );

  return (
    <main className="mx-auto min-h-[calc(100vh-1rem)] max-w-[1600px] px-4 py-4 text-[#241615] sm:px-5 lg:px-6">
      <section className="grid min-h-[calc(100vh-2rem)] grid-cols-1 overflow-hidden rounded-[30px] bg-white shadow-[0_20px_60px_rgba(97,39,25,0.08)] ring-1 ring-[#f0e1dd] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-[#f1e5e1] bg-[#fffdfc] lg:border-b-0 lg:border-r lg:border-[#f1e5e1]">
          <div className="border-b border-[#f4e9e6] p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b88a83]">Tin nhắn</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#241615] sm:text-[2.25rem]">Message</h1>
                <p className="mt-1 text-sm text-[#9a7d77]">Danh sách cuộc hội thoại và nội dung chat được đồng bộ theo phong cách Zalo / Messenger.</p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff1f0] text-[#c62828] shadow-sm ring-1 ring-[#f4d7d2]"
                aria-label="Tạo cuộc trò chuyện"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-[18px] border border-[#eadfdb] bg-[#faf8f7] px-4 py-3 shadow-sm focus-within:border-[#d9b7b0]">
              <Search className="h-5 w-5 shrink-0 text-[#b07c74]" />
              <input
                placeholder="Tìm hội thoại..."
                className="w-full bg-transparent text-sm font-medium text-[#4d3b37] outline-none placeholder:text-[#bea9a4]"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a78b85]">Kênh chung</div>
            <div className="space-y-2 sm:hidden">
              {conversations.map((conversation) => {
                const active = conversation.id === activeConversation?.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`flex w-full items-center gap-3 rounded-[22px] border p-3 text-left transition active:scale-[0.99] ${
                      active ? "border-[#c62828] bg-[#fff8f7] shadow-[0_10px_24px_rgba(198,40,40,0.08)]" : "border-[#f2e7e3] bg-white"
                    }`}
                  >
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-sm ${conversation.accent}`}>
                      {conversation.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="truncate text-sm font-extrabold text-[#2a1d1a]">{conversation.name}</h2>
                        <span className="text-[11px] font-medium text-[#a78b85]">{conversation.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#9b807a]">{conversation.role}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#8f746f]">
                        <PreviewIcon type={conversation.previewType} />
                        <span className="truncate">{conversation.lastMessage}</span>
                      </div>
                    </div>
                    {conversation.unread > 0 && (
                      <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#c62828] px-2 text-xs font-bold text-white">
                        {conversation.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden space-y-2 sm:block">
              {conversations.map((conversation) => {
                const active = conversation.id === activeConversation?.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition hover:-translate-y-[1px] active:scale-[0.99] ${
                      active ? "border-[#c62828] bg-[#fff8f7] shadow-[0_10px_24px_rgba(198,40,40,0.08)]" : "border-[#f2e7e3] bg-white hover:border-[#e8d4cf]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br text-lg font-black text-white shadow-sm ${conversation.accent}`}>
                        {conversation.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="truncate text-[1.02rem] font-extrabold text-[#2a1d1a]">{conversation.name}</h2>
                          <span className="text-[11px] font-medium text-[#a78b85]">{conversation.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#9b807a]">{conversation.role}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#8f746f]">
                          <PreviewIcon type={conversation.previewType} />
                          <span className="truncate">{conversation.lastMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${conversation.online ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-[#f6f0ee] text-[#8d726b] ring-1 ring-[#eadfdb]"}`}>
                          <span className={`h-2 w-2 rounded-full ${conversation.online ? "bg-emerald-500" : "bg-[#b8a09a]"}`} />
                          {conversation.online ? "Online" : "Offline"}
                        </span>
                        {conversation.unread > 0 && (
                          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#c62828] px-2 text-xs font-bold text-white">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#fbf9f8]">
          <header className="sticky top-0 z-10 border-b border-[#f0e4e0] bg-white/95 px-4 py-4 backdrop-blur sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-sm ${activeConversation?.accent ?? "from-[#dc2626] to-[#ef4444]"}`}>
                  {activeConversation?.avatar ?? "M"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-extrabold text-[#241615] sm:text-[1.35rem]">{activeConversation?.name}</h2>
                    <span className="hidden rounded-full bg-[#fff1f0] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c62828] sm:inline-flex">
                      {activeConversation?.role}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[#8f746f]">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeConversation?.online ? "bg-emerald-500" : "bg-[#b8a09a]"}`} />
                    <span>{activeConversation?.online ? "12 thành viên trực tuyến" : "Đang ngoại tuyến"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <IconButton label="Gọi thoại" icon={Phone} />
                <IconButton label="Gọi video" icon={Video} />
                <IconButton label="Thêm" icon={MoreVertical} />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-6">
            <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a98b84] shadow-sm ring-1 ring-[#f0e1dd]">
                  Hôm nay, 10 tháng 10
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          </div>

          <footer className="border-t border-[#f0e4e0] bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-end gap-2 rounded-[26px] bg-[#fbf7f6] p-2.5 shadow-[0_8px_24px_rgba(97,39,25,0.05)] ring-1 ring-[#f0e1dd] sm:gap-3 sm:p-3">
                <div className="flex items-center gap-1 pl-1 text-[#a27b74] sm:gap-2">
                  <ComposerIcon label="Đính kèm" icon={Paperclip} />
                  <ComposerIcon label="Gửi ảnh" icon={ImagePlus} />
                  <ComposerIcon label="Emoji" icon={Smile} />
                </div>

                <div className="flex-1">
                  <label className="flex min-h-[52px] items-center rounded-[20px] border border-transparent bg-white px-4 shadow-sm ring-1 ring-[#efe3df] focus-within:ring-[#d9b7b0]">
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Nhắn tin..."
                      className="w-full bg-transparent text-sm font-medium text-[#4d3b37] outline-none placeholder:text-[#bea9a4]"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="inline-flex h-12 min-w-12 items-center justify-center rounded-[18px] bg-[#c62828] px-4 text-white shadow-[0_14px_28px_rgba(198,40,40,0.24)] transition hover:bg-[#a91f1f] active:scale-[0.98]"
                >
                  <Send className="h-5 w-5" />
                  <span className="ml-2 hidden text-sm font-extrabold sm:inline">Send</span>
                </button>
              </div>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}

function IconButton({ label, icon: Icon }: { label: string; icon: typeof Phone }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-2xl border border-[#efe1dd] bg-white text-[#7f625d] shadow-sm transition hover:border-[#e2c8c2] hover:text-[#c62828]"
    >
      <Icon className="h-4.5 w-4.5" />
    </button>
  );
}

function ComposerIcon({ label, icon: Icon }: { label: string; icon: typeof Paperclip }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-2xl transition hover:bg-white hover:text-[#c62828]"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
