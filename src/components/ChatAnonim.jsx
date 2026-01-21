import React, { useState, useEffect, useRef } from "react";
import { databases, DATABASE_ID, CHATS_COLLECTION_ID, BLACKLIST_COLLECTION_ID, ID } from "../appwrite";
import { Query } from "appwrite";
import axios from "axios";
import Swal from "sweetalert2";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [userIp, setUserIp] = useState("");
  const [messageCount, setMessageCount] = useState(0);

  const messagesEndRef = useRef(null);

  // Fetch blocked IPs
  const fetchBlockedIPs = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BLACKLIST_COLLECTION_ID
      );
      return response.documents.map(doc => doc.ip_address);
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
      return [];
    }
  }

  useEffect(() => {
    // Fetch messages
    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          CHATS_COLLECTION_ID,
          [
            Query.orderAsc('timestamp'),
            Query.limit(100)
          ]
        );
        setMessages(response.documents);
        if (shouldScrollToBottom) {
          scrollToBottom();
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Setup realtime subscription
    const unsubscribe = databases.client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHATS_COLLECTION_ID}.documents`,
      response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setMessages(prev => [...prev, response.payload]);
          if (shouldScrollToBottom) {
            scrollToBottom();
          }
        }
      }
    );

    return () => {
      unsubscribe();
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    getUserIp();
    checkMessageCount();
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  }

  const getUserIp = async () => {
    try {
      const cachedIp = localStorage.getItem("userIp");
      if (cachedIp) {
        setUserIp(cachedIp);
        return;
      }
      const response = await axios.get("https://ipapi.co/json");
      const newUserIp = response.data.network;
      setUserIp(newUserIp);
      const expirationTime = new Date().getTime() + 60 * 60 * 1000;
      localStorage.setItem("userIp", newUserIp);
      localStorage.setItem("ipExpiration", expirationTime.toString());
    } catch (error) {
      console.error("Gagal mendapatkan alamat IP:", error);
    }
  };

  const checkMessageCount = () => {
    const userIpAddress = userIp;
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString();
    const storedDateString = localStorage.getItem("messageCountDate");

    if (currentDateString === storedDateString) {
      const userSentMessageCount = parseInt(localStorage.getItem(userIpAddress)) || 0;
      if (userSentMessageCount >= 20) {
        Swal.fire({
          icon: "error",
          title: "Message limit exceeded",
          text: "You have reached your daily message limit.",
          customClass: {
            container: "sweet-alert-container",
          },
        });
      } else {
        setMessageCount(userSentMessageCount);
      }
    } else {
      localStorage.removeItem(userIpAddress);
      localStorage.setItem("messageCountDate", currentDateString);
    }
  };

  const isIpBlocked = async () => {
    const blockedIPs = await fetchBlockedIPs();
    return blockedIPs.includes(userIp);
  };

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const isBlocked = await isIpBlocked();

      if (isBlocked) {
        Swal.fire({
          icon: "error",
          title: "Blocked",
          text: "You are blocked from sending messages.",
          customClass: {
            container: "sweet-alert-container",
          },
        });
        return;
      }

      const senderImageURL = "/AnonimUser.png";
      const trimmedMessage = message.trim().substring(0, 60);
      const userIpAddress = userIp;

      if (messageCount >= 20) {
        Swal.fire({
          icon: "error",
          title: "Message limit exceeded",
          text: "You have reached your daily message limit.",
          customClass: {
            container: "sweet-alert-container",
          },
        });
        return;
      }

      const updatedSentMessageCount = messageCount + 1;
      localStorage.setItem(userIpAddress, updatedSentMessageCount.toString());
      setMessageCount(updatedSentMessageCount);

      try {
        await databases.createDocument(
          DATABASE_ID,
          CHATS_COLLECTION_ID,
          ID.unique(),
          {
            message: trimmedMessage,
            sender_image: senderImageURL,
            timestamp: new Date().toISOString(),
            user_ip: userIp,
          }
        );

        setMessage("");
        setTimeout(() => {
          setShouldScrollToBottom(true);
        }, 100);
      } catch (error) {
        console.error("Error sending message:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to send message",
          text: "Please try again later.",
          customClass: {
            container: "sweet-alert-container",
          },
        });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="" id="ChatAnonim">
      <div className="text-center text-4xl font-semibold" id="Glow">
        Text Anonim
      </div>

      <div className="mt-5" id="KotakPesan" style={{ overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={msg.$id || index} className="flex items-start text-sm py-[1%]">
            <img 
              src={msg.sender_image || "/AnonimUser.png"} 
              alt="User Profile" 
              className="h-7 w-7 mr-2" 
            />
            <div className="relative top-[0.30rem]">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div id="InputChat" className="flex items-center mt-5">
        <input
          className="bg-transparent flex-grow pr-4 w-4 placeholder:text-white placeholder:opacity-60"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ketik pesan Anda..."
          maxLength={60}
        />
        <button onClick={sendMessage} className="ml-2">
          <img src="/paper-plane.png" alt="" className="h-4 w-4 lg:h-6 lg:w-6" />
        </button>
      </div>
    </div>
  );
}

export default Chat;
