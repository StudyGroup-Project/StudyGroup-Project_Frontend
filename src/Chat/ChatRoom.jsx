import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ChatRoom.css";

const API_BASE = "http://3.39.81.234:8080";

const getToken = () => localStorage.getItem("accessToken");

export default function ChatRoom() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [noMoreHistory, setNoMoreHistory] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // /api/auth/me 로 받은 내 userId

  const chatBoxRef = useRef(null);
  const oldestMessageId = useRef(null); // 가장 과거 메시지 id (무한 스크롤 위로)
  const latestMessageId = useRef(null); // 가장 최근 메시지 id (폴링용)
  const pollingTimerRef = useRef(null); // setInterval 핸들

  /* -------------------------------
      1. 히스토리 로딩 (기존 GET API 사용)
      - initial = true  : 최초 로드 (최신 50개)
      - initial = false : 스크롤 위로 → 더 과거 메시지 로드
  ------------------------------- */
  const loadHistory = async (initial = false) => {
    if (noMoreHistory && !initial) return [];

    const token = getToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return [];
    }

    let url = `${API_BASE}/api/studies/${studyId}/chatMessages?limit=50`;

    // 과거 메시지 더 불러올 때(lastMessageId = 현재 가장 오래된 메시지 id)
    if (oldestMessageId.current && !initial) {
      url += `&lastMessageId=${oldestMessageId.current}`;
    }

    try {
      setLoading(true);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        alert("다시 로그인 해주세요.");
        navigate("/login");
        return [];
      }

      if (!res.ok) {
        throw new Error("채팅 기록 불러오기 실패");
      }

      const data = await res.json();

      if (data.length === 0) {
        setNoMoreHistory(true);
        return [];
      }

      // 화면에서 아래로 갈수록 최근이 되도록 오름차순 정렬
      const sorted = data.slice().sort((a, b) => a.id - b.id);

      // 가장 오래된 메시지 id 갱신 (첫 번째 요소가 제일 과거)
      oldestMessageId.current = sorted[0].id;

      // 최초 로드시 최신 메시지 id도 세팅
      if (initial) {
        latestMessageId.current = sorted[sorted.length - 1].id;
      }

      return sorted;
    } catch (err) {
      console.error("[History] 에러:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
      2. 새로운 메시지 폴링
      - 2초마다 최신 50개 다시 받아서,
        latestMessageId보다 큰 것만 append
  ------------------------------- */
  const pollNewMessages = async () => {
    const token = getToken();
    if (!token) return;

    // 아직 초기 메시지 로딩이 안 됐으면 패스
    if (!latestMessageId.current) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/studies/${studyId}/chatMessages?limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("[Polling] 새 메시지 가져오기 실패");
        return;
      }

      const data = await res.json();
      if (data.length === 0) return;

      const sorted = data.slice().sort((a, b) => a.id - b.id);

      // 최신 ID보다 큰 애들만 "새로운 메시지"로 간주
      const newMessages = sorted.filter(
        (m) => m.id > latestMessageId.current
      );

      if (newMessages.length === 0) return;

      setMessages((prev) => [...prev, ...newMessages]);

      latestMessageId.current =
        newMessages[newMessages.length - 1].id;

      // 거의 맨 아래를 보고 있을 때만 자동 스크롤
      requestAnimationFrame(() => {
        if (!chatBoxRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } =
          chatBoxRef.current;

        if (scrollHeight - (scrollTop + clientHeight) < 100) {
          chatBoxRef.current.scrollTop =
            chatBoxRef.current.scrollHeight;
        }
      });
    } catch (err) {
      console.error("[Polling] 에러:", err);
    }
  };

  /* -------------------------------
      3. 초기 실행:
         - /api/auth/me 로 내 userId 가져오기
         - 채팅 히스토리 로딩
         - 폴링 시작
  ------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = getToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // (1) 내 userId 가져오기
      try {
        const resMe = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resMe.status === 401) {
          alert("다시 로그인 해주세요.");
          navigate("/login");
          return;
        }

        if (!resMe.ok) {
          throw new Error("/api/auth/me 호출 실패");
        }

        const me = await resMe.json(); // { userId: ... }
        if (!cancelled) {
          setCurrentUserId(me.userId);
        }
      } catch (e) {
        console.error("getMe 에러:", e);
      }

      // (2) 채팅 히스토리 로딩
      const initialMessages = await loadHistory(true);
      if (cancelled) return;

      setMessages(initialMessages);

      // 맨 아래로 스크롤
      requestAnimationFrame(() => {
        if (!chatBoxRef.current) return;
        chatBoxRef.current.scrollTop =
          chatBoxRef.current.scrollHeight;
      });

      // (3) 2초마다 새 메시지 폴링
      pollingTimerRef.current = setInterval(() => {
        pollNewMessages();
      }, 2000);
    };

    init();

    return () => {
      cancelled = true;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [studyId]);

  /* -------------------------------
      4. 스크롤 최상단 → 과거 메시지 더 로딩
  ------------------------------- */
  const handleScroll = async () => {
    if (!chatBoxRef.current) return;
    if (chatBoxRef.current.scrollTop !== 0 || noMoreHistory) return;

    const prevHeight = chatBoxRef.current.scrollHeight;

    const older = await loadHistory(false);
    if (older.length === 0) return;

    // 위쪽에 이전 메시지 prepend
    setMessages((prev) => [...older, ...prev]);

    // 스크롤 위치 유지
    requestAnimationFrame(() => {
      if (!chatBoxRef.current) return;
      const newHeight = chatBoxRef.current.scrollHeight;
      chatBoxRef.current.scrollTop = newHeight - prevHeight;
    });
  };

  /* -------------------------------
      5. 메시지 전송 (HTTP POST)
      - POST /api/studies/{studyId}/chatMessages
      - body: { content }
  ------------------------------- */
  const sendMessage = async () => {
    const token = getToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const content = inputValue.trim();
    if (!content) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/studies/${studyId}/chatMessages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (res.status === 401) {
        alert("다시 로그인 해주세요.");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("메시지 전송 실패");
      }

      const newMsg = await res.json();

      // 방금 보낸 메시지를 바로 리스트에 추가
      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");

      // latestMessageId 갱신
      if (
        !latestMessageId.current ||
        newMsg.id > latestMessageId.current
      ) {
        latestMessageId.current = newMsg.id;
      }

      // 맨 아래로 스크롤
      requestAnimationFrame(() => {
        if (!chatBoxRef.current) return;
        chatBoxRef.current.scrollTop =
          chatBoxRef.current.scrollHeight;
      });
    } catch (err) {
      console.error("[Send] 에러:", err);
      alert("메시지 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="chat-container">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <div className="chat-header">
        <button
          type="button"
          className="chat-back-button"
          onClick={() => navigate(-1)}
        >
          ← 
        </button>
        <h2>스터디 채팅방 (ID: {studyId})</h2>
      </div>

      <div
        ref={chatBoxRef}
        className="chat-box"
        onScroll={handleScroll}
      >
        {messages.map((msg) => {
          const isMine =
            currentUserId !== null && msg.userId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`msg ${isMine ? "my-msg" : "other-msg"}`}
            >
              <div className="msg-content">
                <img
                  src={msg.profileImageUrl || "/default-profile.png"}
                  alt="profile"
                />
                <div>
                  <div className="nickname">{msg.nickname}</div>
                  <div>{msg.content}</div>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="history-loading">불러오는 중...</div>
        )}
        {noMoreHistory && messages.length > 0 && (
          <div className="history-end">이전 채팅이 더 없습니다.</div>
        )}
        {messages.length === 0 && !loading && (
          <div className="history-empty">아직 채팅이 없습니다.</div>
        )}
      </div>

      <div className="input-area">
        <input
          value={inputValue}
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
